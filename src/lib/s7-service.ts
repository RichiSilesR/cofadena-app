import Nodes7 from 'nodes7';

const conn = new Nodes7();

type VariableMap = { [key: string]: string };

const variables: VariableMap = {
  // entradas de aridos (escritura desde UI)
  ARIDO1: 'MW0',
  ARIDO2: 'MW2',
  ARIDO3: 'VW4',
  // compuertas (lectura/visualización)
  COMP1: 'V8.1',
  COMP2: 'V8.2',
  COMP3: 'V8.3',
  COMP4: 'V8.4',
  COMP5: 'V8.5',
  // sensor de peso
  PESO: 'VW6',
  // sistema iniciado/apagado
  INICIO: 'V8.0',
  APAGADO: 'V9.5',
};

let isConnected = false;

export function connect(ip: string, rack = 0, slot = 1) {
  return new Promise<void>((resolve, reject) => {
    conn.initiateConnection({ host: ip, port: 102, rack, slot }, (err: any) => {
      if (err) return reject(err);
      isConnected = true;
      // Añadir variables al cliente
      conn.setTranslationCB((tag: string) => variables[tag] || tag);
      conn.addItems(Object.keys(variables));
      resolve();
    });
  });
}

export function readAll() {
  return new Promise<any>((resolve, reject) => {
    if (!isConnected) return reject(new Error('Not connected'));
    conn.readAllItems((err: any, values: any) => {
      if (err) return reject(err);
      resolve(values);
    });
  });
}

export function write(tag: string, value: any) {
  return new Promise<void>((resolve, reject) => {
    if (!isConnected) return reject(new Error('Not connected'));
    conn.writeItems([tag], [value], (err: any) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export function disconnect() {
  conn.dropConnection();
  isConnected = false;
}

export default {
  connect,
  readAll,
  write,
  disconnect,
};
