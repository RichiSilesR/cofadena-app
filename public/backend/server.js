
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
      await client.connectTCP(PLC_IP, { port: PLC_PORT, timeout: 2000 });
  client.setID(0);
      try {
        console.log('Intentando leer sensorPeso (vw6) en HR 4 (dirección 4), Slave ID 1...');
        const res = await client.readHoldingRegisters(4, 1);
        if (res) {
          console.log('Respuesta completa HR 4:', JSON.stringify(res, null, 2));
          const valor = res.data ? res.data[0] : undefined;
          console.log('Valor sensorPeso (vw6) HR 4:', valor);
        } else {
          console.log('La respuesta de Modbus en HR 4 es undefined o null');
        }
      } catch (err) {
        console.error('Error leyendo sensorPeso (vw6) en HR 4:');
        console.error(err);
      }
      console.log('Conectado al PLC LOGO!');
    }
  } catch (err) {
    console.error('Error de conexión Modbus:', err);
  }
}

async function pollPLC() {
  try {
    await connectPLC();
    let sensorPeso = 0;
    try {
      console.log('Intentando leer sensorPeso (vw6) en HR 4 con Slave ID 0...');
      const res = await client.readHoldingRegisters(4, 1);
      if (res) {
        console.log('Respuesta completa HR 4:', JSON.stringify(res, null, 2));
        sensorPeso = res.data ? res.data[0] : undefined;
        console.log('Valor sensorPeso (vw6) HR 4:', sensorPeso);
      } else {
        console.log('La respuesta de Modbus en HR 4 es undefined o null');
      }
    } catch (err) {
      console.error('Error leyendo sensorPeso (vw6) en HR 4:');
      console.error(err);
    }
    plcState = {
      aridos: [0, 0, 0],
      compuertas: [0, 0, 0, 0, 0],
      sensorPeso,
      iniciado: false,
      apagado: false
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

setInterval(pollPLC, 1000);

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
