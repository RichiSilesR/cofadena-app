const s7 = require('nodes7');
const conn = new s7();

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

try {
  const map = require('./s7-mapping');
  if (map && Object.keys(map).length) {
    console.log('Loaded s7-mapping.js, overriding vars');
    vars = map;
  }
} catch (e) { /* ignore if not present */ }

conn.initiateConnection({ host, port: 102, rack: 0, slot: 1 }, (err) => {
  if (err) return console.error('Conexión fallida:', err);
  console.log('Conectado a', host);
  // Use translation callback so we can read by logical names (same as bridge)
  conn.setTranslationCB((tag) => vars[tag] || tag);
  conn.addItems(Object.keys(vars));

  setInterval(() => {
    conn.readAllItems((err, values) => {
      if (err) return console.error('Lectura fallida:', err);
      console.clear();
      console.log(new Date().toLocaleString());
      for (const k of Object.keys(vars)) {
        console.log(`${k} (${vars[k]}):`, values[k]);
      }
    });
  }, 1500);
});
