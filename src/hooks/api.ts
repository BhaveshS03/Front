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

export const sendMessage = (message : string, line: Number, col: Number) => {
    if(ws.OPEN === ws.readyState){
    ws.send(JSON.stringify({
        from: name,
        text: message,
        lineNo: line,
        pos: col
      }));
    }
    console.log(message, line);
    return 0;
}
