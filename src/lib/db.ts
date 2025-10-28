// --- AUDITORÍA ---
/**
 * Registra una acción en el log de auditoría
 * @param {Object} params - Parámetros del log
 * @param {string} params.user_id - ID del usuario
 * @param {string} params.username - Nombre del usuario
 * @param {string} params.action_type - Tipo de acción (create, update, delete, login, etc)
 * @param {string} params.entity - Entidad afectada (projects, clients, users, etc)
 * @param {string} [params.entity_id] - ID de la entidad
 * @param {any} [params.before_data] - Datos antes del cambio
 * @param {any} [params.after_data] - Datos después del cambio
 * @param {string} [params.ip_address] - IP de origen
 * @param {string} [params.description] - Descripción simple
 * @param {any} [params.extra] - Otros datos relevantes
 */
export async function logAudit({ user_id, username, action_type, entity, entity_id, before_data, after_data, ip_address, description, extra }) {
  try {
    await pool.query(
      `INSERT INTO audit_log (user_id, username, action_type, entity, entity_id, before_data, after_data, ip_address, description, extra)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [user_id, username, action_type, entity, entity_id, before_data ? JSON.stringify(before_data) : null, after_data ? JSON.stringify(after_data) : null, ip_address, description, extra ? JSON.stringify(extra) : null]
    );
  } catch (err) {
    // No interrumpir la operación principal
    console.error('Error al registrar auditoría:', err);
  }
}

/**
 * Consulta los logs de auditoría con filtros opcionales
 * @param {Object} filters - Filtros de búsqueda
 * @param {string} [filters.user_id]
 * @param {string} [filters.action_type]
 * @param {string} [filters.entity]
 * @param {string} [filters.entity_id]
 * @param {string} [filters.from]
 * @param {string} [filters.to]
 * @param {string} [filters.query]
 * @returns {Promise<Array>} Lista de logs
 */
export async function getAuditLogs({ user_id, action_type, entity, entity_id, from, to, query } = {}) {
  let sql = 'SELECT * FROM audit_log WHERE 1=1';
  const params = [];
  let idx = 1;
  if (user_id) { sql += ` AND user_id = $${idx++}`; params.push(user_id); }
  if (action_type) { sql += ` AND action_type = $${idx++}`; params.push(action_type); }
  if (entity) { sql += ` AND entity = $${idx++}`; params.push(entity); }
  if (entity_id) { sql += ` AND entity_id = $${idx++}`; params.push(entity_id); }
  if (from) { sql += ` AND created_at >= $${idx++}`; params.push(from); }
  if (to) { sql += ` AND created_at <= $${idx++}`; params.push(to); }
  if (query) { sql += ` AND (username ILIKE $${idx} OR description ILIKE $${idx})`; params.push(`%${query}%`); }
  sql += ' ORDER BY created_at DESC LIMIT 500';
  const res = await pool.query(sql, params);
  return res.rows;
}
// --- CRUD para Mixers ---
export async function getMixers() {
  // Ordenar por el número de internal_code (M-01, M-02, ...)
  const res = await pool.query(`SELECT * FROM mixers ORDER BY CAST(SPLIT_PART(internal_code, '-', 2) AS INTEGER) ASC`);
  return res.rows;
}

import { MixerSchema } from "./validation";

export async function createMixer(mixer, audit = {}) {
  // Validación robusta de datos
  const parsed = MixerSchema.safeParse(mixer);
  if (!parsed.success) {
    // Retornar error de validación para que el frontend lo muestre en el campo correspondiente
    const errorObj = parsed.error.format();
    if (errorObj.plate && errorObj.plate._errors && errorObj.plate._errors.length > 0) {
      return { error: errorObj.plate._errors[0] };
    }
    return { error: 'Datos inválidos: ' + JSON.stringify(errorObj) };
  }
  const { alias, plate, capacity_m3, notes } = parsed.data;
  // Validar placa duplicada
  const plateCheck = await pool.query('SELECT 1 FROM mixers WHERE plate = $1', [mixer.plate]);
  if (plateCheck.rows.length > 0) {
    return {
      error: 'Ya existe un mixer con esa placa. Por favor ingresa una placa única.'
    };
  }
  // Buscar el mayor internal_code actual
  const result = await pool.query("SELECT internal_code FROM mixers WHERE internal_code ~ '^M-\\d+$' ORDER BY CAST(SUBSTRING(internal_code, 3) AS INTEGER) DESC LIMIT 1");
  let nextCode = 'M-01';
  if (result.rows.length > 0) {
    const lastCode = result.rows[0].internal_code;
    const lastNum = parseInt(lastCode.replace('M-', ''), 10);
    nextCode = `M-${String(lastNum + 1).padStart(2, '0')}`;
  }
  const res = await pool.query(
    'INSERT INTO mixers (alias, plate, capacity_m3, internal_code, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [mixer.alias, mixer.plate, mixer.capacity_m3, nextCode, mixer.notes]
  );
  const created = res.rows[0];
  if (audit.user_id || audit.username) {
    await logAudit({
      user_id: audit.user_id || null,
      username: audit.username || null,
      action_type: 'agregó',
      entity: 'Mixers',
      entity_id: created.id,
      after_data: created,
      description: `Mixer agregado: ${created.alias || created.plate}`
    });
  }
  return created;
}

export async function updateMixer(id, mixer, audit = {}) {
  // Validación robusta de datos
  const parsed = MixerSchema.safeParse(mixer);
  if (!parsed.success) {
    return { error: "Datos inválidos: " + JSON.stringify(parsed.error.format()) };
  }
  const { alias, plate, capacity_m3, notes } = parsed.data;
  // Obtener el internal_code actual
  const beforeRes = await pool.query('SELECT * FROM mixers WHERE id = $1', [id]);
  const beforeData = beforeRes.rows[0];
  const internal_code = beforeData.internal_code;
  // Validar placa duplicada (excluyendo el propio registro)
  const plateCheck = await pool.query('SELECT 1 FROM mixers WHERE plate = $1 AND id <> $2', [plate, id]);
  if (plateCheck.rows.length > 0) {
    return { error: 'Ya existe un mixer con esa placa. Por favor ingresa una placa única.' };
  }
  try {
    const res = await pool.query(
      'UPDATE mixers SET alias = $1, plate = $2, capacity_m3 = $3, internal_code = $4, notes = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
      [alias, plate, capacity_m3, internal_code, notes, id]
    );
    const updated = res.rows[0];
    if (audit.user_id || audit.username) {
      await logAudit({
        user_id: audit.user_id || null,
        username: audit.username || null,
        action_type: 'actualizó',
        entity: 'Mixers',
        entity_id: id,
        before_data: beforeData,
        after_data: updated,
        description: `Mixer actualizado: ${updated.alias || updated.plate}`
      });
    }
    return updated;
  } catch (err) {
    if (err.code === '23505') {
      return { error: 'Ya existe un mixer con esa placa. Por favor ingresa una placa única.' };
    }
    return { error: 'Error inesperado al actualizar el mixer.' };
  }
}
export async function deleteMixer(id) {
  await pool.query('DELETE FROM mixers WHERE id = $1', [id]);
  return true;
}

// --- CRUD para Choferes ---
export async function getDrivers() {
  const res = await pool.query('SELECT * FROM drivers ORDER BY name ASC');
  return res.rows;
}

import { DriverSchema } from "./validation";

export async function createDriver(driver, audit = {}) {
  // Validación robusta de datos
  const parsed = DriverSchema.safeParse(driver);
  if (!parsed.success) {
    throw new Error("Datos inválidos: " + JSON.stringify(parsed.error.format()));
  }
  const { name, document, age } = parsed.data;
  const res = await pool.query(
    'INSERT INTO drivers (name, document, age) VALUES ($1, $2, $3) RETURNING *',
    [name, document, age]
  );
  const created = res.rows[0];
  if (audit.user_id || audit.username) {
    await logAudit({
      user_id: audit.user_id || null,
      username: audit.username || null,
      action_type: 'agregó',
      entity: 'Choferes',
      entity_id: created.id,
      after_data: created,
      description: `Chofer agregado: ${created.name}`
    });
  }
  return created;
}

export async function updateDriver(id, driver, audit = {}) {
  // Validación robusta de datos
  const parsed = DriverSchema.safeParse(driver);
  if (!parsed.success) {
    throw new Error("Datos inválidos: " + JSON.stringify(parsed.error.format()));
  }
  const { name, document, age } = parsed.data;
  const beforeRes = await pool.query('SELECT * FROM drivers WHERE id = $1', [id]);
  const beforeData = beforeRes.rows[0];
  const res = await pool.query(
    'UPDATE drivers SET name = $1, document = $2, age = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
    [name, document, age, id]
  );
  const updated = res.rows[0];
  if (audit.user_id || audit.username) {
    await logAudit({
      user_id: audit.user_id || null,
      username: audit.username || null,
      action_type: 'actualizó',
      entity: 'Choferes',
      entity_id: id,
      before_data: beforeData,
      after_data: updated,
      description: `Chofer actualizado: ${updated.name}`
    });
  }
  return updated;
}

export async function deleteDriver(id) {
  await pool.query('DELETE FROM drivers WHERE id = $1', [id]);
  return true;
}

// --- CRUD para Proyectos ---
export async function getProjects() {
  const res = await pool.query(`
    SELECT p.*, c.name as client_name, c.contact as contact_name, c.phone as client_phone
    FROM projects p
    JOIN clients c ON p.client_id = c.id
    ORDER BY p.project_name ASC
  `);
  const projects = res.rows;
  for (const project of projects) {
    // Obtener choferes asignados con nombre
    const driverRes = await pool.query(
      `SELECT d.id as driver_id, d.name as driver_name
       FROM project_drivers pd
       JOIN drivers d ON pd.driver_id = d.id
       WHERE pd.project_id = $1`,
      [project.id]
    );
    project.driver_ids = driverRes.rows.map(row => String(row.driver_id));
    project.driver_names = driverRes.rows.map(row => row.driver_name);
    // Obtener mixers asignados con alias y placa
    const mixerRes = await pool.query(
      `SELECT m.id as mixer_id, m.alias as mixer_alias, m.plate as mixer_placa
       FROM project_mixers pm
       JOIN mixers m ON pm.mixer_id = m.id
       WHERE pm.project_id = $1`,
      [project.id]
    );
    project.mixer_ids = mixerRes.rows.map(row => String(row.mixer_id));
    project.mixer_names = mixerRes.rows.map(row => row.mixer_alias);
  }
  return projects;
}

import { ProjectSchema } from "./validation";

export async function createProject(project) {
  // Validación robusta de datos
  const parsed = ProjectSchema.safeParse(project);
  if (!parsed.success) {
    throw new Error("Datos inválidos: " + JSON.stringify(parsed.error.format()));
  }
  const { project_name, client_id, status, progress, start_date, end_date, notes, user_id, username } = parsed.data;
  const res = await pool.query(
    'INSERT INTO projects (project_name, client_id, status, progress, start_date, end_date, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [project_name, client_id, status, progress, start_date, end_date, notes]
  );
  const newProject = res.rows[0];
  // Guardar vínculos en project_drivers
  if (project.driver_ids && Array.isArray(project.driver_ids)) {
    for (const driverId of project.driver_ids) {
      await pool.query('INSERT INTO project_drivers (project_id, driver_id) VALUES ($1, $2)', [newProject.id, driverId]);
    }
  }
  // Guardar vínculos en project_mixers
  if (project.mixer_ids && Array.isArray(project.mixer_ids)) {
    for (const mixerId of project.mixer_ids) {
      await pool.query('INSERT INTO project_mixers (project_id, mixer_id) VALUES ($1, $2)', [newProject.id, mixerId]);
    }
  }
  newProject.driver_ids = project.driver_ids || [];
  newProject.mixer_ids = project.mixer_ids || [];
  const clientRes = await pool.query('SELECT name, contact, phone FROM clients WHERE id = $1', [newProject.client_id]);
  const client = clientRes.rows[0] || {};
  newProject.client_name = client.name || '';
  newProject.contact_name = client.contact || '';
  newProject.client_phone = client.phone || '';
  // Auditoría
  await logAudit({
    user_id: user_id || null,
    username: username || null,
    action_type: 'create',
    entity: 'projects',
    entity_id: newProject.id,
    after_data: newProject,
    description: `Creación de proyecto: ${newProject.project_name}`
  });
  return newProject;
}

export async function updateProject(id, project) {
  // Validación robusta de datos
  const parsed = ProjectSchema.safeParse(project);
  if (!parsed.success) {
    throw new Error("Datos inválidos: " + JSON.stringify(parsed.error.format()));
  }
  const { project_name, client_id, status, progress, start_date, end_date, notes, user_id, username, driver_ids, mixer_ids } = parsed.data;
  if (!client_id) {
    throw new Error('Debes seleccionar un cliente para el proyecto.');
  }
  // Obtener datos previos para auditoría
  const beforeRes = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
  const beforeData = beforeRes.rows[0];
  const res = await pool.query(
    'UPDATE projects SET project_name = $1, client_id = $2, status = $3, progress = $4, start_date = $5, end_date = $6, notes = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
    [project_name, client_id, status, progress, start_date, end_date, notes, id]
  );
  const updated = res.rows[0];
  // Actualizar choferes
  await pool.query('DELETE FROM project_drivers WHERE project_id = $1', [id]);
  if (driver_ids && Array.isArray(driver_ids)) {
    for (const driverId of driver_ids) {
      await pool.query('INSERT INTO project_drivers (project_id, driver_id) VALUES ($1, $2)', [id, driverId]);
    }
  }
  // Actualizar mixers
  await pool.query('DELETE FROM project_mixers WHERE project_id = $1', [id]);
  if (mixer_ids && Array.isArray(mixer_ids)) {
    for (const mixerId of mixer_ids) {
      await pool.query('INSERT INTO project_mixers (project_id, mixer_id) VALUES ($1, $2)', [id, mixerId]);
    }
  }
  // Refrescar datos de cliente
  const clientRes = await pool.query('SELECT name, contact, phone FROM clients WHERE id = $1', [updated.client_id]);
  const client = clientRes.rows[0] || {};
  updated.client_name = client.name || '';
  updated.contact_name = client.contact || '';
  updated.client_phone = client.phone || '';
  await logAudit({
    user_id: user_id || null,
    username: username || null,
    action_type: 'actualizó',
    entity: 'Proyectos',
    entity_id: id,
    before_data: beforeData,
    after_data: updated,
    description: `Proyecto actualizado: ${updated.project_name}`
  });
  return updated;
}

export async function deleteProject(id) {
  await pool.query('DELETE FROM projects WHERE id = $1', [id]);
  return true;
}
// --- CRUD para Clientes ---
export async function getClients() {
  const res = await pool.query('SELECT * FROM clients ORDER BY name ASC');
  return res.rows;
}

import { ClientSchema } from "./validation";

export async function createClient(client, audit = {}) {
  // Validación robusta de datos
  const parsed = ClientSchema.safeParse(client);
  if (!parsed.success) {
    throw new Error("Datos inválidos: " + JSON.stringify(parsed.error.format()));
  }
  const { name, contact, phone } = parsed.data;
  const { email, address, notes } = client;
  const res = await pool.query(
    'INSERT INTO clients (name, contact, email, phone, address, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [name, contact, email, phone, address, notes]
  );
  const created = res.rows[0];
  if (audit.user_id || audit.username) {
    await logAudit({
      user_id: audit.user_id || null,
      username: audit.username || null,
      action_type: 'agregó',
      entity: 'Clientes',
      entity_id: created.id,
      after_data: created,
      description: `Cliente agregado: ${created.name}`
    });
  }
  return created;
}

export async function updateClient(id, client, audit = {}) {
  // Validación robusta de datos
  const parsed = ClientSchema.safeParse(client);
  if (!parsed.success) {
    throw new Error("Datos inválidos: " + JSON.stringify(parsed.error.format()));
  }
  const { name, contact, phone } = parsed.data;
  const { email, address, notes } = client;
  const beforeRes = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
  const beforeData = beforeRes.rows[0];
  const res = await pool.query(
    'UPDATE clients SET name = $1, contact = $2, email = $3, phone = $4, address = $5, notes = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
    [name, contact, email, phone, address, notes, id]
  );
  const updated = res.rows[0];
  if (audit.user_id || audit.username) {
    await logAudit({
      user_id: audit.user_id || null,
      username: audit.username || null,
      action_type: 'actualizó',
      entity: 'Clientes',
      entity_id: id,
      before_data: beforeData,
      after_data: updated,
      description: `Cliente actualizado: ${updated.name}`
    });
  }
  return updated;
}

// --- Reportes de producción ---
export async function getReports({ from, to } = {}) {
  // Seleccionamos los campos de production_reports y añadimos nombres legibles mediante LEFT JOIN
  let sql = `SELECT pr.id, pr.occurred_at, pr.arido1, pr.arido2, pr.arido3,
                    pr.client_id, pr.project_id, pr.mixer_id, pr.driver_id,
                    c.name AS client, p.project_name AS project,
                    CONCAT(m.alias, COALESCE(' (' || m.plate || ')','')) AS mixer,
                    d.name AS driver,
                    pr.notes, pr.created_at
               FROM production_reports pr
               LEFT JOIN clients c ON pr.client_id = c.id
               LEFT JOIN projects p ON pr.project_id = p.id
               LEFT JOIN mixers m ON pr.mixer_id = m.id
               LEFT JOIN drivers d ON pr.driver_id = d.id
               WHERE 1=1`;
  const params: any[] = [];
  let idx = 1;
  if (from) { sql += ` AND pr.occurred_at >= $${idx++}`; params.push(from); }
  if (to) { sql += ` AND pr.occurred_at <= $${idx++}`; params.push(to); }
  sql += ' ORDER BY pr.occurred_at DESC LIMIT 2000';
  const res = await pool.query(sql, params);
  return res.rows;
}

export async function createReport(report, audit = {}) {
  const {
    occurred_at,
    arido1,
    arido2,
    arido3,
    client_id,
    project_id,
    mixer_id,
    driver_id,
    notes
  } = report;

  // Insertar solamente en las columnas existentes en la tabla
  const insertRes = await pool.query(
    `INSERT INTO production_reports (occurred_at, arido1, arido2, arido3, client_id, project_id, mixer_id, driver_id, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [occuredOrNow(occurred_at), arido1 ?? 0, arido2 ?? 0, arido3 ?? 0, client_id ?? null, project_id ?? null, mixer_id ?? null, driver_id ?? null, notes ?? '']
  );
  const createdId = insertRes.rows[0].id;
  // Recuperar el registro con joins para devolver los nombres legibles
  const selectSql = `SELECT pr.id, pr.occurred_at, pr.arido1, pr.arido2, pr.arido3,
                            pr.client_id, pr.project_id, pr.mixer_id, pr.driver_id,
                            c.name AS client, p.project_name AS project,
                            CONCAT(m.alias, COALESCE(' (' || m.plate || ')','')) AS mixer,
                            d.name AS driver,
                            pr.notes, pr.created_at
                     FROM production_reports pr
                     LEFT JOIN clients c ON pr.client_id = c.id
                     LEFT JOIN projects p ON pr.project_id = p.id
                     LEFT JOIN mixers m ON pr.mixer_id = m.id
                     LEFT JOIN drivers d ON pr.driver_id = d.id
                     WHERE pr.id = $1`;
  const res = await pool.query(selectSql, [createdId]);
  const created = res.rows[0];
  // opción de auditoría si se desea
  if (audit.user_id || audit.username) {
    try {
      await pool.query(
        `INSERT INTO audit_log (user_id, username, action_type, entity, entity_id, after_data, description) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [audit.user_id || null, audit.username || null, 'create', 'production_reports', created.id, JSON.stringify(created), `Reporte creado manualmente`]
      );
    } catch (e) {
      console.warn('No se pudo escribir auditoría para createReport', e);
    }
  }
  return created;
}

function occuredOrNow(val) {
  try {
    if (!val) return new Date().toISOString();
    return new Date(val).toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
}

export async function deleteClient(id) {
  await pool.query('DELETE FROM clients WHERE id = $1', [id]);
  return true;
}
import { Pool } from 'pg';
import { config } from 'dotenv';

config();

if (!process.env.POSTGRES_URL) {
  throw new Error('La variable de entorno POSTGRES_URL no está definida. Asegúrate de tener un archivo .env en la raíz del proyecto.');
}

// Permitir fallback a PGPASSWORD si la connection string no trae contraseña
let poolConfig: any = { connectionString: process.env.POSTGRES_URL };
// Sanear y normalizar la variable POSTGRES_URL: puede venir con prefijo 'POSTGRES_URL=' o comillas
const rawEnv = String(process.env.POSTGRES_URL || '').trim();
let connStr = rawEnv.replace(/^POSTGRES_URL\s*=\s*/i, '').trim();
if ((connStr.startsWith("'") && connStr.endsWith("'")) || (connStr.startsWith('"') && connStr.endsWith('"'))) {
  connStr = connStr.slice(1, -1);
}
poolConfig.connectionString = connStr;
try {
  const url = new URL(connStr);
  const hasPassword = (url.password && url.password.length > 0);
  if (!hasPassword && process.env.PGPASSWORD) {
    // Pasar la password explícita al pool (útil cuando la connection string no incluye password)
    poolConfig.password = process.env.PGPASSWORD;
    console.log('Usando PGPASSWORD como password para la conexión a PostgreSQL');
  } else if (!hasPassword && !process.env.PGPASSWORD) {
    console.warn('La POSTGRES_URL no contiene contraseña y PGPASSWORD no está definida. Si tu servidor PostgreSQL requiere autenticación, define la contraseña en POSTGRES_URL o en la variable PGPASSWORD.');
  }
} catch (err) {
  // Si la URL no es parseable, intentamos dar un mensaje claro y dejamos que pg maneje el connectionString
  console.warn('No se pudo parsear POSTGRES_URL como URL. Se usará el valor sin cambios en pool.connectionString. Asegúrate de que POSTGRES_URL tenga el formato: postgresql://user:pass@host:5432/dbname');
  console.warn('Valor usado para la conexión (ocultando posible password):', (() => {
    try {
      const m = connStr.match(/^(.*?:).*?@(.*)$/);
      if (m) return `${m[1]}****@${m[2]}`;
      return connStr;
    } catch (e) { return connStr; }
  })());
}

export const pool = new Pool(poolConfig);

// Intento de verificación temprana de la conexión para dar mensajes útiles
pool.on('connect', () => {
  console.log('Conectado a la base de datos PostgreSQL.');
});

pool.on('error', (err) => {
  console.error('Error inesperado en el cliente de la base de datos', err);
  process.exit(-1);
});

// Ejecutar una consulta de verificación inmediata para fallar rápido y dar guía
(async () => {
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      client.release();
      console.log('Verificación de conexión a PostgreSQL: OK');
    } catch (innerErr) {
      client.release();
      // Detectar error de autenticación SCRAM y dar mensaje claro
      const msg = String(innerErr && innerErr.message ? innerErr.message : innerErr);
      // Si el error indica host no encontrado (ENOTFOUND), extraer el hostname y dar guía
      if (innerErr && innerErr.code === 'ENOTFOUND') {
        const host = innerErr.hostname || (() => {
          try {
            const r = poolConfig.connectionString;
            const u = new URL(r);
            return u.hostname;
          } catch (e) {
            // intentar extraer entre @ y :
            const m = String(poolConfig.connectionString).match(/@(.*?):/);
            return m ? m[1] : '<host desconocido>';
          }
        })();
        console.error(`
ERROR: No se pudo resolver el host de PostgreSQL: ${host}
Mensaje original:`, innerErr);
        console.error('Revisa que el hostname en POSTGRES_URL sea correcto y que tu máquina pueda resolverlo (ping, /etc/hosts, DNS).');
      }
      if (msg.includes('SCRAM') || msg.includes('client password must be a string') || msg.toLowerCase().includes('authentication')) {
        console.error('\nERROR: Falló la autenticación con PostgreSQL. Mensaje original:\n', innerErr);
        console.error('\nPosibles causas y soluciones:');
        console.error('- La cadena en POSTGRES_URL no contiene contraseña. Si tu servidor requiere autenticación, añade la contraseña en el connection string:');
        console.error("  POSTGRES_URL='postgresql://usuario:password@host:5432/dbname'");
        console.error("  O exporta la contraseña en PGPASSWORD: $env:PGPASSWORD='tu_password' (PowerShell) y asegúrate de arrancar el servidor en la misma sesión).");
        console.error('- Si tu Postgres está configurado para autenticación trust en host local, asegúrate de que el archivo pg_hba.conf lo permita.');
        console.error('- Si prefieres que la app no falle al arrancar, configura la variable de entorno correctamente o adapta pg_hba.conf.');
      }
      // Re-lanzar el error para que el proceso lo note y puedas verlo
      throw innerErr;
    }
  } catch (err) {
    console.error('No se pudo verificar la conexión a PostgreSQL al arrancar:', err);
    // Salir con código 1 para que sea evidente en logs; evita seguir con el servidor sin DB operativa
    process.exit(1);
  }
})();
