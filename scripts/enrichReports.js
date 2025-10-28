// scripts/enrichReports.js
// Lee data/production_reports.json y añade campos legibles client/project/mixer/driver
// Usa funciones de la DB si están disponibles, si no usa datos de src/lib/data.js como fallback.

const fs = require('fs').promises;
const path = require('path');

async function main() {
  const dataDir = path.resolve(process.cwd(), 'data');
  const filePath = path.join(dataDir, 'production_reports.json');
  try {
    await fs.access(filePath);
  } catch (e) {
    console.error('No existe', filePath);
    process.exit(1);
  }

  const txt = await fs.readFile(filePath, 'utf8');
  let arr = [];
  try { arr = JSON.parse(txt || '[]'); } catch (e) { console.error('JSON inválido', e); process.exit(1); }
  if (!Array.isArray(arr)) {
    console.error('El archivo no contiene un array');
    process.exit(1);
  }

  // Intentar cargar helpers DB
  let clientsMap = {};
  let projectsMap = {};
  let mixersMap = {};
  let driversMap = {};
  try {
    const db = require('../src/lib/db');
    if (db && typeof db.getClients === 'function') {
      const clients = await db.getClients();
      clientsMap = (clients || []).reduce((acc, c) => ({ ...acc, [String(c.id)]: c.name }), {});
    }
    if (db && typeof db.getProjects === 'function') {
      const projects = await db.getProjects();
      projectsMap = (projects || []).reduce((acc, p) => ({ ...acc, [String(p.id)]: p.project_name }), {});
    }
    if (db && typeof db.getMixers === 'function') {
      const mixers = await db.getMixers();
      mixersMap = (mixers || []).reduce((acc, m) => ({ ...acc, [String(m.id)]: `${m.alias}${m.plate ? ' (' + m.plate + ')' : ''}` }), {});
    }
    if (db && typeof db.getDrivers === 'function') {
      const drivers = await db.getDrivers();
      driversMap = (drivers || []).reduce((acc, d) => ({ ...acc, [String(d.id)]: d.name }), {});
    }
  } catch (e) {
    console.warn('DB helpers no disponibles, usando fallback');
    try {
      const data = require('../src/lib/data');
      if (data && data.clients) {
        clientsMap = (data.clients || []).reduce((acc, c) => ({ ...acc, [String(c.id)]: c.name }), {});
      }
      if (data && data.projects) {
        projectsMap = (data.projects || []).reduce((acc, p) => ({ ...acc, [String(p.id)]: p.project_name }), {});
      }
      if (data && data.mixers) {
        mixersMap = (data.mixers || []).reduce((acc, m) => ({ ...acc, [String(m.id)]: `${m.alias}${m.plate ? ' (' + m.plate + ')' : ''}` }), {});
      }
      if (data && data.drivers) {
        driversMap = (data.drivers || []).reduce((acc, d) => ({ ...acc, [String(d.id)]: d.name }), {});
      }
    } catch (e2) {
      console.warn('Fallback data no disponible', e2);
    }
  }

  const updated = arr.map(r => ({
    ...r,
    client: r.client ?? (r.client_id ? (clientsMap[String(r.client_id)] || '') : ''),
    project: r.project ?? (r.project_id ? (projectsMap[String(r.project_id)] || '') : ''),
    mixer: r.mixer ?? (r.mixer_id ? (mixersMap[String(r.mixer_id)] || '') : ''),
    driver: r.driver ?? (r.driver_id ? (driversMap[String(r.driver_id)] || '') : ''),
  }));

  await fs.writeFile(filePath, JSON.stringify(updated, null, 2), 'utf8');
  console.log('Archivo actualizado:', filePath);
}

if (require.main === module) {
  main().catch(err => { console.error(err); process.exit(1); });
}
