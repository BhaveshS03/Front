// utils/ot.ts
import { Content, OTOp } from '@/types/ot';

/**
 * Helper function to get the full text of a line from its word array
 */
export const getLineText = (lineWords: string[] | undefined): string => 
  (lineWords || []).join(' ');

/**
 * Converts the content structure to a flat string representation
 */
export const flattenContent = (content: Content): string => {
  return Object.values(content).map(getLineText).join('\n');
};

/**
 * Converts line/character position to absolute position in flat text
 */
export const getAbsolutePosition = (line: number, ch: number, content: Content): number => {
  let pos = 0;
  for (let i = 1; i < line; i++) {
    pos += getLineText(content[i] || []).length + 1; // +1 for '\n'
  }
  return pos + ch;
};

/**
 * Converts absolute position back to line/character coordinates
 */
export const getLineCharFromAbsolute = (pos: number, content: Content): { line: number; ch: number } => {
  let currentPos = 0;
  
  for (const [lineNumStr, words] of Object.entries(content)) {
    const lineNum = parseInt(lineNumStr, 10);
    const lineText = getLineText(words);
    const lineLength = lineText.length;
    
    if (currentPos + lineLength >= pos) {
      return { line: lineNum, ch: pos - currentPos };
    }
    
    currentPos += lineLength + 1; // +1 for newline
  }
  
  // If position is beyond content, return end of last line
  const lastLineNum = Math.max(...Object.keys(content).map(Number));
  const lastLineText = getLineText(content[lastLineNum] || []);
  return { line: lastLineNum, ch: lastLineText.length };
};

/**
 * Converts flat text back to content structure
 */
export const textToContent = (text: string): Content => {
  const lines = text.split('\n');
  const newContent: Content = {};
  
  lines.forEach((lineText, i) => {
    newContent[i + 1] = lineText ? lineText.split(' ') : [''];
  });
  
  return newContent;
};