const s7 = require('nodes7');
const conn = new s7();

const host = process.argv[2] || '192.168.10.3';

const tagsToProbe = ['VW0', 'VW2', 'VW4', 'VW6', 'V8.0', 'V8.1', 'V8.2', 'V8.3', 'V8.4', 'V8.5', 'V9.5'];

// Common address patterns to try for each logical name
const patterns = [
  (t) => t, // try as-is
  (t) => t.replace(/^VW/, 'MW'), // VW0 -> MW0
  (t) => t.replace(/^VW/, 'DB1,DBW'), // VW0 -> DB1,DBW0
  (t) => t.replace(/^V8\.(\d+)/, 'M$1'), // V8.1 -> M1
  (t) => t.replace(/^V8\.(\d+)/, 'Q$1'),
  (t) => t.replace(/^V/, 'M'),
  (t) => t.replace(/^VW/, 'VB'),
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function probe() {
  console.log('Conectando a', host);
  conn.initiateConnection({ host, port: 102, rack: 0, slot: 1 }, async (err) => {
    if (err) return console.error('Conexión fallida:', err);
    console.log('Conectado. Intentando sondeo de tags...');

    for (const tag of tagsToProbe) {
      let found = false;
      for (const p of patterns) {
        const addr = p(tag);
        // set translation to map probeTag -> addr
        conn.setTranslationCB((t) => (t === 'PROBE' ? addr : t));
        try {
          conn.addItems(['PROBE']);
        } catch (e) {
          // ignore
        }
        await sleep(200);
        await new Promise((res) => {
          conn.readAllItems((err, values) => {
            if (!err && values && Object.keys(values).length) {
              console.log(`Tag ${tag} probó ${addr} -> OK =>`, values);
              found = true;
            }
            // cleanup items
            try { conn.dropItems(['PROBE']); } catch (e) {}
            res();
          });
        });
        if (found) break;
      }
      if (!found) console.log(`No se encontró dirección válida para ${tag}`);
    }

    console.log('Sondeo finalizado. Desconectando.');
    conn.dropConnection();
  });
}

probe();
