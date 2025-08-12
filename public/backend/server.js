
// Backend Node.js para SCADA/IoT: Modbus TCP + WebSocket + Express + CORS
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const ModbusRTU = require('modbus-serial');

// Configuración PLC LOGO!
const PLC_IP = '192.168.10.3';
const PLC_PORT = 502;
const client = new ModbusRTU();

const app = express();
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:9002'], credentials: true }));

// Endpoint REST de prueba
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok' });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

let plcState = {
  aridos: [0, 0, 0],
  compuertas: [0, 0, 0, 0, 0],
  sensorPeso: 0,
  iniciado: false,
  apagado: false
};

async function connectPLC() {
  try {
    if (!client.isOpen) {
      await client.connectTCP(PLC_IP, { port: PLC_PORT });
      client.setID(1);
      console.log('Conectado al PLC LOGO!');
    }
  } catch (err) {
    console.error('Error de conexión Modbus:', err.message);
  }
}

async function pollPLC() {
  try {
    await connectPLC();
    const aridos = [];
    for (let i = 0; i < 3; i++) {
      const res = await client.readHoldingRegisters(i * 2, 1);
      aridos.push(res.data[0]);
    }
    const sensorPeso = (await client.readHoldingRegisters(6, 1)).data[0];
    const coils = await client.readCoils(8, 7);
    plcState = {
      aridos,
      compuertas: coils.data.slice(1, 6),
      sensorPeso,
      iniciado: coils.data[0],
      apagado: coils.data[6]
    };
    wss.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'plc-update', data: plcState }));
      }
    });
  } catch (err) {
    console.error('Error leyendo PLC:', err.message);
  }
}

setInterval(pollPLC, 500);

wss.on('connection', ws => {
  console.log('Cliente WebSocket conectado');
  ws.on('message', async msg => {
    try {
      const { type, data } = JSON.parse(msg);
      if (type === 'set-arido') {
        await client.writeRegister(data.index * 2, data.value);
      } else if (type === 'set-iniciar') {
        await client.writeCoil(8, data ? 1 : 0);
      } else if (type === 'set-compuerta') {
        await client.writeCoil(9 + data.index, data.value ? 1 : 0);
      }
    } catch (err) {
      console.error('Error comando WebSocket:', err.message);
    }
  });
  ws.on('close', () => {
    console.log('Cliente WebSocket desconectado');
  });
  ws.send(JSON.stringify({ type: 'plc-update', data: plcState }));
});

server.listen(4000, () => {
  console.log('Backend SCADA/IoT escuchando HTTP y WebSocket en puerto 4000 (path /ws)');
});
