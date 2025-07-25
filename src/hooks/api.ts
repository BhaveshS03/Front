const name = 'Anonymous';

const ws = new WebSocket('ws://localhost:8000/ws/general'); // Or 'wss://' for secure connections

ws.onopen = () => {
  console.log("✅ Connected to lobby");
  ws.send(JSON.stringify({
    type: "name",
    from: name
  }));
}

ws.onmessage = (event) => {
    let data = JSON.parse(event.data);
    console.log(`\n📨 ${data.from || 'Server'}: ${data.text}`);
};

ws.onclose= () => {
  console.log('❌ Disconnected from server');
};

ws.onerror =(err) => {
  console.error('🚨 WebSocket error:', err);
};

type OTInsert = { type: 'insert'; pos: number; char: string };
type OTDelete = { type: 'delete'; pos: number };
type OTOperation = OTInsert | OTDelete;

export const sendMessage = (op: OTOperation): void => {
  if (ws.readyState === WebSocket.OPEN) {
    const payload = {
      from: name,
      ...op
    };

    ws.send(JSON.stringify(payload));
    console.log("Sent OT message:", payload);
  } else {
    console.warn("WebSocket not open. Cannot send message:", op);
  }
};

export const recvMessage = (handleRemoteOp: (op: OTOperation) => void): void => {
  ws.addEventListener('message', (event) => {
    let data: any;
    try {
      data = JSON.parse(event.data);
    } catch {
      console.warn('Invalid JSON received:', event.data);
      return;
    }

    // Filter out non-OT messages (like chat or "name" handshake)
    if (data.type === 'insert' || data.type === 'delete') {
      const op: OTOperation = {
        type: data.type,
        pos: data.pos,
        // only OTInsert has 'char'
        ...(data.type === 'insert' ? { char: data.char } : {})
      } as OTOperation;

      console.log(`📥 Received OT ${op.type} @${op.pos}`, op);
      handleRemoteOp(op);
    } else {
      // fallback to old behavior for text/chat messages
      console.log(`\n📨 ${data.from || 'Server'}: ${data.text}`);
    }
  });
};

