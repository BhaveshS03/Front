import { useState, useRef, useEffect } from "react";
import  call  from '@/hooks/utils';
import { sendMessage } from '@/hooks/api'

export function Editor() {
  const [content, setContent] = useState(``);
  const [currentLine, setCurrentLine] = useState(1);
  const [currentColumn, setCurrentColumn] = useState(1);
  const [currentWord, setCurrentWord] = useState('');
  const [currentLineText, setCurrentLineText] = useState(''); // State for the current line's text
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef(null);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    setContent(e.currentTarget.innerHTML);
    updateCursorPosition();
  };
  useEffect(() => {
    console.log("working??")
    sendMessage(currentWord, currentLine, currentColumn);
  },[currentWord]);

  const updateCursorPosition = () => {
    const selection = window.getSelection();
    const editableElement = editorRef.current;

    if (!selection || selection.rangeCount === 0 || !editableElement) {
      setCurrentWord('');
      setCurrentLineText('');
      return;
    }

    const range = selection.getRangeAt(0);
    const currentNode = range.startContainer;
    
    if (!editableElement.contains(currentNode)) {
      return;
    }
    
    // --- Calculate Line and Column ---
    setCurrentColumn(range.startOffset + 1);

    let lineNum = 1;
    let lineNode: Node | null = null;
    for (let i = 0; i < editableElement.childNodes.length; i++) {
      const node = editableElement.childNodes[i];
      if (node.contains(currentNode)) {
        lineNum = i + 1;
        lineNode = node;
        break;
      }
    }
    setCurrentLine(lineNum);

    // --- Get Word/Text of Current Line ---
    const setWord = (currentText : string) =>{
      if (!selection.isCollapsed) {
        setCurrentWord(selection.toString().trim());
      } else if (currentNode.nodeType === Node.TEXT_NODE || lineNode.nodeType === Node.ELEMENT_NODE) {
        const textContent = currentText || '';
        const cursorPosition = range.startOffset;

        let startIndex = cursorPosition;
        while (startIndex > 0 && /\S/.test(textContent[startIndex - 1])) {
          startIndex--;
        }
        let endIndex = cursorPosition;
        while (endIndex < textContent.length && /\S/.test(textContent[endIndex])) {
          endIndex++;
        }
        setCurrentWord(textContent.substring(startIndex, endIndex));
      } else {
        setCurrentWord('');
      }
    };
        if (lineNode) {
        let currText = (lineNode.textContent ?? (lineNode as HTMLElement).innerText);
        setCurrentLineText(currText);
        setWord(currText);
      } else {
        setCurrentLineText('');
      }
  };
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
  }, []);

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
            className="outline-none prose prose-lg max-w-none"
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
          />
        </div>
        <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Last saved: Just now</span>
            <div className="flex gap-4">
              <span>
                Words:{' '}
                {content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length}
              </span>
              <span>
                Characters: {content.replace(/<[^>]*>/g, '').length}
              </span>
              <span>
                Line: {currentLine}
              </span>
              <span>
                Col: {currentColumn}
              </span>
            </div>
          </div>
          {/* Status bar for current context */}
          <div className="w-full bg-muted/50 p-2 rounded-md flex gap-4 overflow-x-auto">
            <span className="font-semibold whitespace-nowrap">Word:</span>
            <span className="font-mono text-primary">{currentWord || '–'}</span>
            <span className="border-l border-border"></span>
            <span className="font-semibold whitespace-nowrap">Line Text:</span>
            <span className="font-mono truncate">{currentLineText || '–'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}