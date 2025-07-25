// components/Editor.tsx
import { useRef, useEffect, FC, KeyboardEvent, MouseEvent, useState } from "react";
import { Content, Cursor, OTOp } from '@/types/ot';
import { getLineText, getAbsolutePosition } from '@/utils/ot';
import { createInsertOp, createDeleteOp } from '@/lib/ot';
import { useOTEditor } from '@/hooks/ot'

export const Editor: FC = () => {
  const {
    content,
    setContent,
    cursor,
    setCursor,
    applyLocalOp
  } = useOTEditor();

  const [isFocused, setIsFocused] = useState<boolean>(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
  }, []);

  // Mouse click handler for positioning cursor
  const handleEditorClick = (e: MouseEvent<HTMLDivElement>) => {
    const editorDiv = editorRef.current;
    if (!editorDiv) return;

    // Find the clicked line element
    let targetLineElement = e.target as HTMLElement;
    while (targetLineElement && targetLineElement !== editorDiv && !targetLineElement.dataset.lineNumber) {
      targetLineElement = targetLineElement.parentElement as HTMLElement;
    }

    if (!targetLineElement || !targetLineElement.dataset.lineNumber) return;

    const lineNumber = parseInt(targetLineElement.dataset.lineNumber, 10);
    const lineText = getLineText(content[lineNumber]);

    // Find the text content span for measurement
    const textSpan = targetLineElement.querySelector('.line-text-content');
    if (!textSpan) return;

    const rect = textSpan.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;

    // Create temporary element for text measurement
    const measurer = document.createElement('span');
    measurer.style.visibility = 'hidden';
    measurer.style.position = 'absolute';
    measurer.style.font = window.getComputedStyle(textSpan).font;
    measurer.style.letterSpacing = window.getComputedStyle(textSpan).letterSpacing;
    measurer.style.whiteSpace = 'pre';
    document.body.appendChild(measurer);

    let bestMatchIndex = 0;
    let minDiff = Infinity;

    // Find the best cursor position based on click location
    for (let i = 0; i <= lineText.length; i++) {
      measurer.textContent = lineText.substring(0, i);
      const width = measurer.offsetWidth;
      const diff = Math.abs(relativeX - width);

      if (diff < minDiff) {
        minDiff = diff;
        bestMatchIndex = i;
      }
    }

    document.body.removeChild(measurer);
    setCursor({ line: lineNumber, ch: bestMatchIndex });
    editorDiv.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault();

    const { key } = e;
    const { line, ch } = cursor;

    // Create deep copy for immutable updates
    const newContent: Content = JSON.parse(JSON.stringify(content));
    let currentLineWords = newContent[line] || [''];
    let currentLineText = getLineText(currentLineWords);

    // Character input
    if (key.length === 1) {
      const absPos = getAbsolutePosition(line, ch, content);
      const op = createInsertOp(absPos, key);
      applyLocalOp(op);

      const newText = currentLineText.slice(0, ch) + key + currentLineText.slice(ch);
      newContent[line] = newText.split(' ');
      setContent(newContent);
      setCursor({ line, ch: ch + 1 });
    }
    // Backspace
    else if (key === 'Backspace') {
      if (ch > 0 || line > 1) {
        const absPos = getAbsolutePosition(line, ch, content) - 1;
        const op = createDeleteOp(absPos);
        applyLocalOp(op);
      }
      
      if (ch > 0) {
        const newText = currentLineText.slice(0, ch - 1) + currentLineText.slice(ch);
        newContent[line] = newText.split(' ');
        setContent(newContent);
        setCursor({ line, ch: ch - 1 });
      } else if (line > 1) {
        const prevLineNumber = line - 1;
        const prevLineText = getLineText(newContent[prevLineNumber]);
        const newCursorCh = prevLineText.length;

        newContent[prevLineNumber] = (prevLineText + currentLineText).split(' ');
        delete newContent[line];

        const renumberedContent: Content = {};
        let i = 1;
        for (const key of Object.keys(newContent).sort((a, b) => parseInt(a) - parseInt(b))) {
          renumberedContent[i++] = newContent[parseInt(key)];
        }

        setContent(renumberedContent);
        setCursor({ line: prevLineNumber, ch: newCursorCh });
      }
    }
    // Enter key
    else if (key === 'Enter') {
      const textBeforeCursor = currentLineText.slice(0, ch);
      const textAfterCursor = currentLineText.slice(ch);

      newContent[line] = textBeforeCursor.split(' ');

      // Insert new line
      const contentWithNewLine: Content = {};
      Object.keys(newContent).forEach(lineNumberStr => {
        const lineNumber = parseInt(lineNumberStr, 10);
        if (lineNumber <= line) {
          contentWithNewLine[lineNumber] = newContent[lineNumber];
        } else {
          contentWithNewLine[lineNumber + 1] = newContent[lineNumber];
        }
      });
      contentWithNewLine[line + 1] = textAfterCursor.split(' ');

      setContent(contentWithNewLine);
      setCursor({ line: line + 1, ch: 0 });
    }
    // Arrow keys
    else if (key === 'ArrowLeft') {
      if (ch > 0) {
        setCursor({ line, ch: ch - 1 });
      } else if (line > 1) {
        const prevLine = line - 1;
        const prevLineLen = getLineText(newContent[prevLine]).length;
        setCursor({ line: prevLine, ch: prevLineLen });
      }
    } else if (key === 'ArrowRight') {
      if (ch < currentLineText.length) {
        setCursor({ line, ch: ch + 1 });
      } else if (newContent[line + 1] !== undefined) {
        setCursor({ line: line + 1, ch: 0 });
      }
    } else if (key === 'ArrowUp') {
      if (line > 1) {
        const prevLine = line - 1;
        const prevLineLen = getLineText(newContent[prevLine]).length;
        setCursor({ line: prevLine, ch: Math.min(ch, prevLineLen) });
      }
    } else if (key === 'ArrowDown') {
      if (newContent[line + 1] !== undefined) {
        const nextLine = line + 1;
        const nextLineLen = getLineText(newContent[nextLine]).length;
        setCursor({ line: nextLine, ch: Math.min(ch, nextLineLen) });
      }
    }
  };

  // Calculate current context for status bar
  const currentLine = cursor.line;
  const currentColumn = cursor.ch + 1; // 1-indexed for display
  const currentLineText = getLineText(content[cursor.line] || ['']);

  // Get current word at cursor position
  const getCurrentWord = (): string => {
    const text = currentLineText;
    if (!text || cursor.ch === 0) return '';

    let start = cursor.ch - 1;
    let end = cursor.ch;

    // Find word boundaries
    while (start >= 0 && text[start] !== ' ') start--;
    while (end < text.length && text[end] !== ' ') end++;
    return text.slice(start + 1, end);
  };

  const currentWord = getCurrentWord();
  const allText = Object.values(content).map(words => getLineText(words)).join('\n');
  const totalChars = allText.length;
  const totalWords = allText.split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    console.log(currentWord, currentLine, currentColumn);
  }, [currentWord, currentLine, currentColumn]);

  return (
    <div className="flex-1 flex justify-center p-8 organic-bg">
      <div className="w-full max-w-4xl">
        <div
          className={`editor-content min-h-[700px] p-12 rounded-xl ${
            isFocused ? 'ring-2 ring-primary/20' : ''
          }`}
        >
          <div
            ref={editorRef}
            tabIndex={0}
            className="outline-none prose prose-lg max-w-none"
            style={{
              minHeight: '600px',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.6',
              color: 'hsl(var(--foreground))',
            }}
            onKeyDown={handleKeyDown}
            onClick={handleEditorClick}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          >
            {Object.entries(content).map(([lineNumber, words]) => {
              const lineNum = parseInt(lineNumber, 10);
              const isCursorLine = lineNum === cursor.line;
              const lineText = getLineText(words);

              return (
                <div key={lineNum} className="flex items-center" data-line-number={lineNum}>
                  <span className="text-gray-500 w-8 select-none flex-shrink-0">{lineNum}</span>
                  <span className="line-text-content">
                    {isCursorLine && isFocused ? (
                      <>
                        <span>{lineText.slice(0, cursor.ch)}</span>
                        <span className="blinking-cursor bg-cyan-400 w-0.5 h-5 inline-block -mb-1"></span>
                        <span>{lineText.slice(cursor.ch)}</span>
                      </>
                    ) : (
                      <span>{lineText}</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Last saved: Just now</span>
            <div className="flex gap-4">
              <span>Words: {totalWords}</span>
              <span>Characters: {totalChars}</span>
              <span>Line: {currentLine}</span>
              <span>Col: {currentColumn}</span>
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

        {/* Display for the internal state */}
        <div className="mt-8 p-4 bg-gray-800 border border-gray-700 rounded-lg w-full">
          <h2 className="text-lg font-semibold text-green-400 mb-2">Internal State</h2>
          <div className="text-sm text-gray-300">
            <p className="mb-2">
              <span className="font-bold">Cursor Position: </span>
              {`{ line: ${cursor.line}, ch: ${cursor.ch} }`}
            </p>
            <div>
              <p className="font-bold mb-1">Editor Content:</p>
              <pre className="bg-gray-900 p-2 rounded-md text-yellow-300 whitespace-pre-wrap break-all">
                {JSON.stringify(content, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .blinking-cursor {
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </div>
  );
};