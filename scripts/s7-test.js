const s7 = require('nodes7');
const conn = new s7();

const ip = process.argv[2] || '192.168.10.3';

const vars = {
  ARIDO1: 'VW0',
  ARIDO2: 'VW2',
  ARIDO3: 'VW4',
  COMP1: 'V8.1',
  PESO: 'VW6',
  INICIO: 'V8.0',
  APAGADO: 'V9.5',
};

conn.initiateConnection({ host: ip, port: 102, rack: 0, slot: 1 }, (err) => {
  if (err) return console.error('Conexión fallida:', err);
  console.log('Conectado a', ip);
  conn.setTranslationCB((tag) => vars[tag] || tag);
  conn.addItems(Object.keys(vars));
  setInterval(() => {
    conn.readAllItems((err, values) => {
      if (err) return console.error('Lectura fallida:', err);
      console.log('Valores:', values);
    });
  }, 2000);
});
