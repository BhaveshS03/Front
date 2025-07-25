// hooks/useOT.ts
import { useState, useEffect, useCallback } from 'react';
import { Content, OTOp, Cursor } from '@/types/ot';
import { applyOTOperation, transformCursor } from '@/lib/ot';
import { sendMessage, recvMessage } from '@/hooks/api';

export const useOTEditor = (initialContent: Content = { 1: [''] }) => {
  const [content, setContent] = useState<Content>(initialContent);
  const [cursor, setCursor] = useState<Cursor>({ line: 1, ch: 0 });
  const [pendingOps, setPendingOps] = useState<OTOp[]>([]);

  // Handle remote operations
  const handleRemoteOp = useCallback((op: OTOp) => {
    setContent(prev => {
      const newContent = applyOTOperation(prev, op);
      // Transform cursor position if needed
      setCursor(currentCursor => transformCursor(currentCursor, op, prev));
      return newContent;
    });
  }, []);

  // Set up message receiving
  useEffect(() => {
    recvMessage(handleRemoteOp);
  }, [handleRemoteOp]);

  // Send operation to remote
  const sendOp = useCallback((op: OTOp) => {
    setPendingOps(prev => [...prev, op]);
    sendMessage(op);
  }, []);

  // Apply local operation
  const applyLocalOp = useCallback((op: OTOp) => {
    setContent(prev => applyOTOperation(prev, op));
    sendOp(op);
  }, [sendOp]);

  // Acknowledge operation (remove from pending when server confirms)
  const acknowledgeOp = useCallback((op: OTOp) => {
    setPendingOps(prev => prev.filter((pendingOp, index) => index !== 0));
  }, []);

  return {
    content,
    setContent,
    cursor,
    setCursor,
    applyLocalOp,
    pendingOps,
    acknowledgeOp
  };
};