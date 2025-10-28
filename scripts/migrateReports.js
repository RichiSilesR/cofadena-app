// Simple migration script: GET /api/reports then POST bulk to /api/reports
// Usage: node scripts/migrateReports.js

const fetch = global.fetch || require('node-fetch');
const BASE = process.env.BASE_URL || 'http://localhost:3000';

(async () => {
  try {
    console.log('Obteniendo reportes desde', `${BASE}/api/reports`);
    const get = await fetch(`${BASE}/api/reports`);
    if (!get.ok) {
      console.error('GET /api/reports falló:', get.status, await get.text());
      process.exit(1);
    }
    const json = await get.json();
    const reports = json.data || [];
    console.log(`Reportes obtenidos: ${reports.length}`);
    if (!reports.length) {
      console.log('No hay reportes para migrar. Saliendo.');
      return;
    }

    console.log('Enviando bulk POST a', `${BASE}/api/reports`);
    const post = await fetch(`${BASE}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reports)
    });
    if (!post.ok) {
      console.error('Bulk POST falló:', post.status, await post.text());
      process.exit(1);
    }
    const resp = await post.json();
    console.log('Bulk POST OK. Insertados:', resp.data?.length ?? 'unknown');
  } catch (err) {
    console.error('Error en migration script:', err);
    process.exit(1);
  }
})();
