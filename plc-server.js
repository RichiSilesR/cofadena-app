const express = require('express');
const bodyParser = require('body-parser');
const Snap7 = require('node-snap7'); 
const app = express();
const port = 3000;

// Configuración del PLC
const plc = new Snap7.S7Client();
const S7Client = Snap7.S7Client;
// ¡IMPORTANTE! Tu IP confirmada:
const PLC_IP = '192.168.10.3'; 
const PLC_RACK = 0;
const PLC_SLOT = 0;

// --- DIRECCIONES DE MEMORIA (DB1) ---
const ADDRESSES = {
    INICIAR: 'DB1,X8.0', // Pulso para iniciar
    RESET: 'DB1,X9.7',   // Pulso para resetear
    CONSIGNA_W0: 0,      // Árido 1 (VW0)
    CONSIGNA_W2: 2,      // Árido 2 (VW2)
    CONSIGNA_W4: 4,      // Árido 3 (VW4)
    MANUAL_JOG: 'DB1,X10.1' // <--- ¡NUEVA DIRECCIÓN CORREGIDA!
};

app.use(bodyParser.json());

// Conexión al PLC al iniciar el servidor
plc.ConnectTo(PLC_IP, PLC_RACK, PLC_SLOT, (err) => {
    if (err) {
        console.error(`❌ Error de conexión al PLC: ${plc.ErrorText(err)}`);
    } else {
        console.log(`✅ Conexión con PLC LOGO! establecida en ${PLC_IP}.`);
    }
});

// --- FUNCIONES DE COMUNICACIÓN S7 ---

/**
 * Función que escribe un pulso (TRUE por 100ms, luego FALSE) a un bit del PLC.
 * (Usado para INICIAR y RESET)
 */
function sendPulse(address, durationMs = 100) {
    if (!plc.connected) return console.error('PLC desconectado. No se puede enviar pulso.');

    const parts = address.split('X')[1].split('.');
    const byte = parseInt(parts[0]); 
    const bit = parseInt(parts[1]); 

    // 1. Escribir TRUE
    plc.writeBit(S7Client.S7AreaDB, 1, byte, bit, 1, (err) => {
        if (err) return console.error(`Error TRUE en ${address}:`, plc.ErrorText(err));
        
        // 2. Programar FALSE
        setTimeout(() => {
            plc.writeBit(S7Client.S7AreaDB, 1, byte, bit, 0, (err) => {
                if (err) return console.error(`Error FALSE en ${address}:`, plc.ErrorText(err));
                console.log(`Pulso completo para ${address} enviado.`);
            });
        }, durationMs);
    });
}

// ----------------------------------------------------------------------
// --- ENDPOINTS HTTP DE LA API ---
// ----------------------------------------------------------------------

// Endpoint para INICIAR
app.post('/api/start', (req, res) => {
    sendPulse(ADDRESSES.INICIAR);
    res.send({ status: 'Pulso de INICIAR enviado.' });
});

// Endpoint para RESET
app.post('/api/reset', (req, res) => {
    sendPulse(ADDRESSES.RESET);
    res.send({ status: 'Pulso de RESET enviado.' });
});

// --- ENDPOINT CRUCIAL: CONTROL MANUAL (DB1,X10.1) ---
app.post('/api/manual', (req, res) => {
    // action será 'on' (para TRUE) o 'off' (para FALSE), enviado desde el frontend
    const { action } = req.body; 
    
    if (!plc.connected) {
        return res.status(503).send({ error: 'PLC desconectado. No se puede controlar.' });
    }

    // Dirección DB1,X10.1 -> byte=10, bit=1
    const parts = ADDRESSES.MANUAL_JOG.split('X')[1].split('.');
    const byte = parseInt(parts[0]); 
    const bit = parseInt(parts[1]); 

    // El valor a escribir: 1 (TRUE) si es 'on', 0 (FALSE) si es 'off'
    const value = (action === 'on' || action === true) ? 1 : 0; 
    
    plc.writeBit(S7Client.S7AreaDB, 1, byte, bit, value, (err) => {
        if (err) {
            console.error(`Error al escribir ${ADDRESSES.MANUAL_JOG} a ${value}:`, plc.ErrorText(err));
            return res.status(500).send({ error: 'Error del PLC.' });
        }
        console.log(`Bit ${ADDRESSES.MANUAL_JOG} establecido a ${action.toUpperCase()} (${value}).`);
        res.send({ status: `Control manual configurado a ${action}.` });
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`\nServidor Node.js escuchando en http://localhost:${port}`);
});