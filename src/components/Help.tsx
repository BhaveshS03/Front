// import React, { useState, useEffect, useRef } from 'react';

// // Helper function to get the full text of a line from its word array
// const getLineText = (lineWords) => (lineWords || []).join(' ');

// // The main application component
// export default function App() {
//   // State for the editor's content, structured as { lineNumber: [word1, word2], ... }
//   const [editorContent, setEditorContent] = useState({ 1: [''] });
//   // State for the cursor's position { line: number, ch: characterIndex }
//   const [cursorPosition, setCursorPosition] = useState({ line: 1, ch: 0 });
//   // State to track if the editor is focused, to show/hide the blinking cursor
//   const [isFocused, setIsFocused] = useState(false);
  
//   const editorRef = useRef(null);
//   const lineRef = useRef({});

//   // Effect to handle initial focus
//   useEffect(() => {
//     const editor = editorRef.current;
//     if (!editor) return;
//     editor.focus();
//   }, []);

//   // --- Mouse Click Handler ---
//   const handleEditorClick = (e) => {
//     const editorDiv = editorRef.current;
//     if (!editorDiv) return;

//     // Find the clicked line element by traversing up from the event target
//     let targetLineElement = e.target;
//     while (targetLineElement && targetLineElement !== editorDiv && !targetLineElement.dataset.lineNumber) {
//         targetLineElement = targetLineElement.parentElement;
//     }

//     // Exit if a line element wasn't clicked
//     if (!targetLineElement || !targetLineElement.dataset.lineNumber) return;

//     const lineNumber = parseInt(targetLineElement.dataset.lineNumber, 10);
//     const lineText = getLineText(editorContent[lineNumber]);
    
//     // Find the span that holds the text content for measurement
//     const textSpan = targetLineElement.querySelector('.line-text-content');
//     if (!textSpan) return;

//     const rect = textSpan.getBoundingClientRect();
//     const relativeX = e.clientX - rect.left;

//     // --- Calculate Character Index via Measurement ---
//     // Create a temporary, hidden element to measure text widths accurately
//     const measurer = document.createElement('span');
//     measurer.style.visibility = 'hidden';
//     measurer.style.position = 'absolute';
//     // Copy font styles from the actual text span for accurate measurement
//     measurer.style.font = window.getComputedStyle(textSpan).font;
//     measurer.style.letterSpacing = window.getComputedStyle(textSpan).letterSpacing;
//     measurer.style.whiteSpace = 'pre'; // Use 'pre' to respect spaces
//     document.body.appendChild(measurer);

//     let bestMatchIndex = 0;
//     let minDiff = Infinity;

//     // Iterate through each possible cursor position (including after the last character)
//     for (let i = 0; i <= lineText.length; i++) {
//         measurer.textContent = lineText.substring(0, i);
//         const width = measurer.offsetWidth;
//         const diff = Math.abs(relativeX - width);

//         // If this position is a better match, update it
//         if (diff < minDiff) {
//             minDiff = diff;
//             bestMatchIndex = i;
//         }
//     }

//     // Clean up the temporary measurement element
//     document.body.removeChild(measurer);

//     // Update the cursor state and focus the editor
//     setCursorPosition({ line: lineNumber, ch: bestMatchIndex });
//     editorDiv.focus();
//   };


//   // --- Keyboard Event Handler ---
//   const handleKeyDown = (e) => {
//     e.preventDefault(); // Prevent default browser actions for handled keys
    
//     const { key } = e;
//     const { line, ch } = cursorPosition;

//     // Create deep copies for immutable updates
//     const newContent = JSON.parse(JSON.stringify(editorContent));
//     let currentLineWords = newContent[line] || [''];
//     let currentLineText = getLineText(currentLineWords);
    
//     // --- Character Input ---
//     if (key.length === 1) {
//       const newText = currentLineText.slice(0, ch) + key + currentLineText.slice(ch);
//       newContent[line] = newText.split(' ');
//       setEditorContent(newContent);
//       setCursorPosition({ line, ch: ch + 1 });
//     } 
//     // --- Backspace Key ---
//     else if (key === 'Backspace') {
//       if (ch > 0) {
//         // Delete character within the line
//         const newText = currentLineText.slice(0, ch - 1) + currentLineText.slice(ch);
//         newContent[line] = newText.split(' ');
//         setEditorContent(newContent);
//         setCursorPosition({ line, ch: ch - 1 });
//       } else if (line > 1) {
//         // Merge with the previous line
//         const prevLineNumber = line - 1;
//         const prevLineText = getLineText(newContent[prevLineNumber]);
//         const newCursorCh = prevLineText.length;
        
//         // Combine words and remove the current line
//         newContent[prevLineNumber] = (prevLineText + currentLineText).split(' ');
//         delete newContent[line];

//         // Re-number subsequent lines
//         const renumberedContent = {};
//         let i = 1;
//         for (const key of Object.keys(newContent).sort((a,b) => a-b)) {
//             renumberedContent[i++] = newContent[key];
//         }

//         setEditorContent(renumberedContent);
//         setCursorPosition({ line: prevLineNumber, ch: newCursorCh });
//       }
//     } 
//     // --- Enter Key ---
//     else if (key === 'Enter') {
//         const textBeforeCursor = currentLineText.slice(0, ch);
//         const textAfterCursor = currentLineText.slice(ch);

//         // Update current line
//         newContent[line] = textBeforeCursor.split(' ');

//         // Create new content object with the new line inserted
//         const contentWithNewLine = {};
//         Object.keys(newContent).forEach(lineNumberStr => {
//             const lineNumber = parseInt(lineNumberStr, 10);
//             if (lineNumber <= line) {
//                 contentWithNewLine[lineNumber] = newContent[lineNumber];
//             } else {
//                 contentWithNewLine[lineNumber + 1] = newContent[lineNumber];
//             }
//         });
//         contentWithNewLine[line + 1] = textAfterCursor.split(' ');
        
//         setEditorContent(contentWithNewLine);
//         setCursorPosition({ line: line + 1, ch: 0 });
//     }
//     // --- Arrow Keys ---
//     else if (key === 'ArrowLeft') {
//       if (ch > 0) {
//         setCursorPosition({ line, ch: ch - 1 });
//       } else if (line > 1) {
//         // Move to the end of the previous line
//         const prevLine = line - 1;
//         const prevLineLen = getLineText(newContent[prevLine]).length;
//         setCursorPosition({ line: prevLine, ch: prevLineLen });
//       }
//     } else if (key === 'ArrowRight') {
//       if (ch < currentLineText.length) {
//         setCursorPosition({ line, ch: ch + 1 });
//       } else if (newContent[line + 1] !== undefined) {
//         // Move to the start of the next line
//         setCursorPosition({ line: line + 1, ch: 0 });
//       }
//     } else if (key === 'ArrowUp') {
//         if (line > 1) {
//             const prevLine = line - 1;
//             const prevLineLen = getLineText(newContent[prevLine]).length;
//             setCursorPosition({ line: prevLine, ch: Math.min(ch, prevLineLen) });
//         }
//     } else if (key === 'ArrowDown') {
//         if (newContent[line + 1] !== undefined) {
//             const nextLine = line + 1;
//             const nextLineLen = getLineText(newContent[nextLine]).length;
//             setCursorPosition({ line: nextLine, ch: Math.min(ch, nextLineLen) });
//         }
//     }
//   };

//   // --- JSX Rendering ---
//   return (
//     <div className="bg-gray-900 text-gray-100 min-h-screen p-4 sm:p-8 flex flex-col items-center font-mono">
//       <div className="w-full max-w-4xl">
//         <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-4 text-center">React Custom DOM Editor</h1>
//         <p className="text-gray-400 mb-6 text-center">Click on the editor below or use your keyboard to start typing.</p>
        
//         {/* The visible editor area */}
//         <div
//           ref={editorRef}
//           tabIndex={0}
//           className="bg-gray-800 border-2 border-gray-600 rounded-lg p-4 w-full h-96 overflow-y-auto focus:outline-none focus:border-cyan-500 transition-colors duration-300 whitespace-pre-wrap leading-relaxed cursor-text"
//           onKeyDown={handleKeyDown}
//           onClick={handleEditorClick}
//           onFocus={() => setIsFocused(true)}
//           onBlur={() => setIsFocused(false)}
//         >
//           {Object.entries(editorContent).map(([lineNumber, words]) => {
//             const lineNum = parseInt(lineNumber, 10);
//             const isCursorLine = lineNum === cursorPosition.line;
//             const lineText = getLineText(words);

//             return (
//               <div key={lineNum} className="flex items-center" data-line-number={lineNum}>
//                 <span className="text-gray-500 w-8 select-none flex-shrink-0">{lineNum}</span>
//                 <span className="line-text-content">
//                   {isCursorLine && isFocused ? (
//                     <>
//                       <span>{lineText.slice(0, cursorPosition.ch)}</span>
//                       <span className="blinking-cursor bg-cyan-400 w-0.5 h-5 inline-block -mb-1"></span>
//                       <span>{lineText.slice(cursorPosition.ch)}</span>
//                     </>
//                   ) : (
//                     <span>{lineText}</span>
//                   )}
//                 </span>
//               </div>
//             );
//           })}
//         </div>

//         {/* Display for the internal state */}
//         <div className="mt-8 p-4 bg-gray-800 border border-gray-700 rounded-lg w-full">
//             <h2 className="text-lg font-semibold text-green-400 mb-2">Internal State</h2>
//             <div className="text-sm text-gray-300">
//                 <p className="mb-2">
//                     <span className="font-bold">Cursor Position: </span>
//                     {`{ line: ${cursorPosition.line}, ch: ${cursorPosition.ch} }`}
//                 </p>
//                 <div>
//                     <p className="font-bold mb-1">Editor Content:</p>
//                     <pre className="bg-gray-900 p-2 rounded-md text-yellow-300 whitespace-pre-wrap break-all">
//                         {JSON.stringify(editorContent, null, 2)}
//                     </pre>
//                 </div>
//             </div>
//         </div>
//       </div>
//       <style>{`
//         @keyframes blink {
//           0%, 100% { opacity: 1; }
//           50% { opacity: 0; }
//         }
//         .blinking-cursor {
//           animation: blink 1s step-end infinite;
//         }
//       `}</style>
//     </div>
//   );
// }
