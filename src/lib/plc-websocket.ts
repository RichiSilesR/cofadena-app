// Cliente WebSocket para conectar Next.js con Node-RED y recibir datos PLC en tiempo real

export function connectPLCWebSocket(onData: (data: any) => void) {
  // Usar la ruta relativa para el WebSocket del proxy Next.js
  const wsUrl = window.location.protocol.replace('http', 'ws') + '//' + window.location.host + '/ws';
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('Conectado a Node-RED WebSocket');
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onData(data);
    } catch (err) {
      console.error('Error al parsear datos PLC:', err);
    }
  };

  ws.onerror = (err) => {
    console.error('Error WebSocket PLC:', err);
  };

  ws.onclose = () => {
    console.warn('WebSocket PLC cerrado');
  };

  return ws;
}
