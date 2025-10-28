const s7 = require('nodes7');
const http = require('http');
const WebSocket = require('ws');
const url = require('url');

const host = process.argv[2] || '192.168.10.3';

let vars = {
  ARIDO1: 'MW0',
  ARIDO2: 'VW2',
  ARIDO3: 'VW4',
  COMP1: 'V8.1',
  COMP2: 'V8.2',
  COMP3: 'V8.3',
  COMP4: 'V8.4',
  COMP5: 'V8.5',
  PESO: 'VW6',
  INICIO: 'V8.0',
  APAGADO: 'V9.5',
};

// if mapping file exists, use it
try {
  const map = require('./s7-mapping');
  if (map && Object.keys(map).length) {
    console.log('Loaded s7-mapping.js, overriding vars');
    vars = map;
  }
} catch (e) { /* ignore if not present */ }

const conn = new s7();
let addrs = Object.values(vars);

function startBridge() {
  conn.initiateConnection({ host, port: 102, rack: 0, slot: 1 }, (err) => {
    if (err) return console.error('S7 connection failed:', err);
    console.log('S7 connected to', host);
  // Use translation callback so nodes7 can translate logical names to the addresses
  conn.setTranslationCB((tag) => vars[tag] || tag);
  conn.addItems(Object.keys(vars));

    // WebSocket server
    const wss = new WebSocket.Server({ port: 4000 });
    wss.on('connection', (ws) => {
      console.log('WS client connected');
    });

    // HTTP server for writes
    const server = http.createServer((req, res) => {
      const parsed = url.parse(req.url, true);
      if (req.method === 'POST' && parsed.pathname === '/write') {
        let body = '';
        req.on('data', (chunk) => body += chunk);
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const { tag, value } = data;
            if (!vars[tag]) return res.end(JSON.stringify({ error: 'Unknown tag' }));
            // Validation rules
            if (['ARIDO1','ARIDO2','ARIDO3'].includes(tag)) {
              const num = Number(value);
              if (isNaN(num) || num < 0 || num > 100) return res.end(JSON.stringify({ error: 'Arido value must be 0-100' }));
            }
            if (tag === 'INICIO') {
              // allow INICIO only if some arido > 0 (read logical tag values)
              const vals = await new Promise((r) => conn.readAllItems((err, v) => r(v)));
              const a1 = vals['ARIDO1'] || 0;
              const a2 = vals['ARIDO2'] || 0;
              const a3 = vals['ARIDO3'] || 0;
              if (!(Number(a1) > 0 || Number(a2) > 0 || Number(a3) > 0)) return res.end(JSON.stringify({ error: 'Cannot start: no arido value set' }));
            }
            conn.writeItems([vars[tag]], [value], (err) => {
              if (err) return res.end(JSON.stringify({ error: err.toString() }));
              return res.end(JSON.stringify({ ok: true }));
            });
          } catch (e) { res.end(JSON.stringify({ error: e.toString() })); }
        });
      } else {
        res.end('OK');
      }
    });
    server.listen(4001, () => console.log('HTTP write API on :4001'));

    setInterval(() => {
      conn.readAllItems((err, values) => {
        if (err) return console.error('Read error:', err);
        const payload = {};
        for (const k of Object.keys(vars)) {
          payload[k] = values[k];
        }
        // broadcast
        wss.clients.forEach((c) => {
          if (c.readyState === WebSocket.OPEN) c.send(JSON.stringify(payload));
        });
      });
    }, 1000);
  });
}

startBridge();
