// operations/ot.ts
import { Content, OTOp, Cursor } from '@/types/ot';
import { flattenContent, textToContent, getAbsolutePosition } from '@/utils/ot';

/**
 * Applies an OT operation to the content
 */
export const applyOTOperation = (content: Content, op: OTOp): Content => {
  const flat = flattenContent(content);
  let updated = '';

  if (op.type === 'insert') {
    updated = flat.slice(0, op.pos) + op.char + flat.slice(op.pos);
  } else if (op.type === 'delete') {
    updated = flat.slice(0, op.pos) + flat.slice(op.pos + 1);
  }

  return textToContent(updated);
};

/**
 * Creates an insert operation
 */
export const createInsertOp = (pos: number, char: string): OTOp => ({
  type: 'insert',
  pos,
  char
});

/**
 * Creates a delete operation
 */
export const createDeleteOp = (pos: number): OTOp => ({
  type: 'delete',
  pos
});

/**
 * Transforms cursor position after applying an operation
 * This is useful for maintaining cursor position when remote operations are applied
 */
export const transformCursor = (cursor: Cursor, op: OTOp, content: Content): Cursor => {
  const cursorAbsPos = getAbsolutePosition(cursor.line, cursor.ch, content);
  
  if (op.type === 'insert') {
    if (op.pos <= cursorAbsPos) {
      // Insert happened before cursor, move cursor forward
      const newContent = applyOTOperation(content, op);
      const flat = flattenContent(newContent);
      let newPos = 0;
      let newLine = 1;
      let newCh = 0;
      
      for (let i = 0; i <= cursorAbsPos; i++) {
        if (flat[newPos] === '\n') {
          newLine++;
          newCh = 0;
        } else {
          newCh++;
        }
        newPos++;
      }
      
      return { line: newLine, ch: newCh };
    }
  } else if (op.type === 'delete') {
    if (op.pos < cursorAbsPos) {
      // Delete happened before cursor, move cursor back
      return { ...cursor, ch: Math.max(0, cursor.ch - 1) };
    } else if (op.pos === cursorAbsPos && cursor.ch > 0) {
      // Delete happened at cursor position
      return { ...cursor, ch: cursor.ch - 1 };
    }
  }
  
  return cursor;
};

/**
 * Composes multiple operations into a single operation (if possible)
 * This is useful for optimizing network traffic
 */
export const composeOperations = (op1: OTOp, op2: OTOp): OTOp[] => {
  // Simple composition for adjacent character insertions
  if (op1.type === 'insert' && op2.type === 'insert' && op1.pos + 1 === op2.pos) {
    return [{
      type: 'insert',
      pos: op1.pos,
      char: op1.char + op2.char
    }];
  }
  
  // For now, return both operations if they can't be composed
  return [op1, op2];
};

/**
 * Operational Transform function for concurrent operations
 * This handles the case where two operations happen simultaneously
 */
export const transform = (op1: OTOp, op2: OTOp): [OTOp, OTOp] => {
  if (op1.type === 'insert' && op2.type === 'insert') {
    if (op1.pos <= op2.pos) {
      return [op1, { ...op2, pos: op2.pos + 1 }];
    } else {
      return [{ ...op1, pos: op1.pos + 1 }, op2];
    }
  }
  
  if (op1.type === 'delete' && op2.type === 'delete') {
    if (op1.pos < op2.pos) {
      return [op1, { ...op2, pos: op2.pos - 1 }];
    } else if (op1.pos > op2.pos) {
      return [{ ...op1, pos: op1.pos - 1 }, op2];
    } else {
      // Same position - keep only one delete
      return [op1, { type: 'delete', pos: -1 }]; // Invalid position means skip
    }
  }
  
  if (op1.type === 'insert' && op2.type === 'delete') {
    if (op1.pos <= op2.pos) {
      return [op1, { ...op2, pos: op2.pos + 1 }];
    } else {
      return [{ ...op1, pos: op1.pos - 1 }, op2];
    }
  }
  
  if (op1.type === 'delete' && op2.type === 'insert') {
    if (op1.pos < op2.pos) {
      return [op1, { ...op2, pos: op2.pos - 1 }];
    } else {
      return [{ ...op1, pos: op1.pos + 1 }, op2];
    }
  }
  
  return [op1, op2];
};