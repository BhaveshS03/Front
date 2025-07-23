import { useState, useRef, useEffect, useCallback } from "react";
import call from '@/hooks/utils';
import { sendMessage } from '@/hooks/api';

export function Editor() {
  const [content, setContent] = useState<Map<number, string>>(new Map());
  const [cursorInfo, setCursorInfo] = useState({
    line: 1,
    column: 1,
    word: '',
    lineText: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const getTextFromMap = useCallback((map: Map<number, string>) => {
    return Array.from(map.values()).join('\n');
  }, []);
    const getPlainTextFromEditor = useCallback((): string => {
      if (!editorRef.current) return '';
      
      const textContent = editorRef.current.textContent || '';
      return textContent;
    }, []);

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    // Use plain text instead of HTML parsing
    const plainText = getPlainTextFromEditor();
    const lines = plainText.split('\n');
    
    const newMap = new Map<number, string>();
    lines.forEach((line, idx) => {
      newMap.set(idx + 1, line);
    });
    console.log(newMap);
    setContent(newMap);
    updateCursorPosition();
  }, [getPlainTextFromEditor]);

  useEffect(() => {
    sendMessage(cursorInfo.word, cursorInfo.line, cursorInfo.column);
  }, [cursorInfo.column]);

  // Improved: Batch state updates to prevent multiple re-renders
  const updateCursorPosition = useCallback(() => {
    const selection = window.getSelection();
    const editableElement = editorRef.current;

    if (!selection || selection.rangeCount === 0 || !editableElement) {
      setCursorInfo(prev => ({
        ...prev,
        word: '',
        lineText: ''
      }));
      return;
    }

    const range = selection.getRangeAt(0);
    const currentNode = range.startContainer;

    if (!editableElement.contains(currentNode)) return;

    // Calculate all cursor info in one go
    const newCursorInfo = {
      line: 1,
      column: range.startOffset + 1,
      word: '',
      lineText: ''
    };

    // Find line number
    let lineNode: Node | null = null;
    for (let i = 0; i < editableElement.childNodes.length; i++) {
      const node = editableElement.childNodes[i];
      if (node.contains(currentNode)) {
        newCursorInfo.line = i + 1;
        lineNode = node;
        break;
      }
    }

    // Calculate word and line text
    if (lineNode) {
      const currText = lineNode.textContent || '';
      newCursorInfo.lineText = currText;

      // Word extraction logic
      if (!selection.isCollapsed) {
        newCursorInfo.word = selection.toString().trim();
      } else if (currentNode.nodeType === Node.TEXT_NODE || lineNode?.nodeType === Node.ELEMENT_NODE) {
        const cursorPosition = range.startOffset;
        
        let startIndex = cursorPosition;
        while (startIndex > 0 && /\S/.test(currText[startIndex - 1])) {
          startIndex--;
        }
        let endIndex = cursorPosition;
        while (endIndex < currText.length && /\S/.test(currText[endIndex])) {
          endIndex++;
        }
        newCursorInfo.word = currText.substring(startIndex, endIndex);
      }
    }

    // Single state update instead of multiple setState calls
    setCursorInfo(newCursorInfo);
  }, []);

  useEffect(() => {
    const editorElement = editorRef.current;
    if (editorElement) {
      editorElement.addEventListener('keyup', updateCursorPosition);
      editorElement.addEventListener('mouseup', updateCursorPosition);
      editorElement.addEventListener('focus', updateCursorPosition);

      return () => {
        editorElement.removeEventListener('keyup', updateCursorPosition);
        editorElement.removeEventListener('mouseup', updateCursorPosition);
        editorElement.removeEventListener('focus', updateCursorPosition);
      };
    }
  }, [updateCursorPosition]);

  return (
    <div className="flex-1 flex justify-center p-8 organic-bg">
      <div className="w-full max-w-4xl">
        <div
          className={`editor-content min-h-[700px] p-12 rounded-xl ${
            isEditing ? 'ring-2 ring-primary/20' : ''
          }`}
        >
          <div
            contentEditable
            ref={editorRef}
            className="outline-none prose prose-lg max-w-none whitespace-pre-wrap"
            style={{
              minHeight: '600px',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.6',
              color: 'hsl(var(--foreground))',
            }}
            onInput={handleInput}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            onPaste={(e) => {
              e.preventDefault();
              const text = e.clipboardData.getData('text/plain');
              document.execCommand('insertText', false, text);
              updateCursorPosition();
            }}
          >
            {/* Initial render from map */}
            {Array.from(content.entries()).map(([lineNum, lineText]) => (
              <div key={lineNum}>{lineText}</div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Last saved: Just now</span>
            <div className="flex gap-4">
              <span>
                Words:{' '}
                {getTextFromMap(content).split(/\s+/).filter(Boolean).length}
              </span>
              <span>
                Characters: {getTextFromMap(content).length}
              </span>
              <span>
                Line: {cursorInfo.line}
              </span>
              <span>
                Col: {cursorInfo.column}
              </span>
            </div>
          </div>
          <div className="w-full bg-muted/50 p-2 rounded-md flex gap-4 overflow-x-auto">
            <span className="font-semibold whitespace-nowrap">Word:</span>
            <span className="font-mono text-primary">{cursorInfo.word || '–'}</span>
            <span className="border-l border-border"></span>
            <span className="font-semibold whitespace-nowrap">Line Text:</span>
            <span className="font-mono truncate">{cursorInfo.lineText || '–'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}