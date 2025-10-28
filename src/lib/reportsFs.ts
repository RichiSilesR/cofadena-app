import fs from 'fs/promises';
import path from 'path';

const dataDir = path.resolve(process.cwd(), 'data');
const filePath = path.join(dataDir, 'production_reports.json');

async function ensureFile() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    try {
      await fs.access(filePath);
    } catch (e) {
      await fs.writeFile(filePath, '[]', 'utf8');
    }
  } catch (err) {
    throw new Error('No se pudo asegurar el archivo de reportes: ' + String(err));
  }
}

async function readAll() {
  await ensureFile();
  const txt = await fs.readFile(filePath, 'utf8');
  try {
    const arr = JSON.parse(txt || '[]');
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch (err) {
    // Corrupted file: rename and start fresh
    const backup = filePath + '.corrupt.' + Date.now();
    await fs.rename(filePath, backup).catch(() => {});
    await fs.writeFile(filePath, '[]', 'utf8');
    return [];
  }
}

async function writeAll(arr: any[]) {
  const tmp = filePath + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(arr, null, 2), 'utf8');
  await fs.rename(tmp, filePath);
}

function makeId() {
  try {
    // Node 14+ has crypto.randomUUID in newer versions
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const crypto = require('crypto');
    if (crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  } catch (e) {
    // fallthrough
  }
  return `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

export async function getReports({ from, to } = {}) {
  const all = await readAll();
  let rows = all.slice();
  if (from) {
    const f = new Date(from).toISOString();
    rows = rows.filter((r: any) => (r.occurred_at || r.created_at || '') >= f);
  }
  if (to) {
    const t = new Date(to).toISOString();
    rows = rows.filter((r: any) => (r.occurred_at || r.created_at || '') <= t);
  }
  rows.sort((a: any, b: any) => (b.occurred_at || b.created_at || '').localeCompare(a.occurred_at || a.created_at || ''));
  // Intentar enriquecer con nombres legibles si no existen
  // Usamos los helpers de la DB si están disponibles (getClients, getProjects, getMixers, getDrivers)
  let clientsMap: Record<string, string> = {};
  let projectsMap: Record<string, string> = {};
  let mixersMap: Record<string, string> = {};
  let driversMap: Record<string, string> = {};
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const db = require('./db');
    if (db && typeof db.getClients === 'function') {
      const clients = await db.getClients();
      clientsMap = (clients || []).reduce((acc: any, c: any) => ({ ...acc, [String(c.id)]: c.name }), {});
    }
    if (db && typeof db.getProjects === 'function') {
      const projects = await db.getProjects();
      projectsMap = (projects || []).reduce((acc: any, p: any) => ({ ...acc, [String(p.id)]: p.project_name }), {});
    }
    if (db && typeof db.getMixers === 'function') {
      const mixers = await db.getMixers();
      mixersMap = (mixers || []).reduce((acc: any, m: any) => ({ ...acc, [String(m.id)]: `${m.alias}${m.plate ? ' (' + m.plate + ')' : ''}` }), {});
    }
    if (db && typeof db.getDrivers === 'function') {
      const drivers = await db.getDrivers();
      driversMap = (drivers || []).reduce((acc: any, d: any) => ({ ...acc, [String(d.id)]: d.name }), {});
    }
  } catch (e) {
    // ignore, puede que no tengamos DB disponible
  }

  const enriched = rows.slice(0, 2000).map((r: any) => {
    return {
      ...r,
      client: r.client ?? (r.client_id ? (clientsMap[String(r.client_id)] ?? '') : ''),
      project: r.project ?? (r.project_id ? (projectsMap[String(r.project_id)] ?? '') : ''),
      mixer: r.mixer ?? (r.mixer_id ? (mixersMap[String(r.mixer_id)] ?? '') : ''),
      driver: r.driver ?? (r.driver_id ? (driversMap[String(r.driver_id)] ?? '') : ''),
    };
  });

  return enriched;
}

export async function createReport(report: any) {
  const now = new Date().toISOString();
  const created = {
    id: makeId(),
    occurred_at: report.occurred_at ? new Date(report.occurred_at).toISOString() : now,
    arido1: report.arido1 ?? null,
    arido2: report.arido2 ?? null,
    arido3: report.arido3 ?? null,
    client_id: report.client_id ?? null,
    project_id: report.project_id ?? null,
    mixer_id: report.mixer_id ?? null,
    driver_id: report.driver_id ?? null,
    // nombres legibles (si vienen del frontend)
    client: report.client ?? report.client_name ?? null,
    project: report.project ?? report.project_name ?? null,
    mixer: report.mixer ?? report.mixer_name ?? null,
    driver: report.driver ?? report.driver_name ?? null,
    notes: report.notes ?? '',
    created_at: now
  };
  const all = await readAll();
  all.push(created);
  await writeAll(all);
  return created;
}

export default { getReports, createReport };
