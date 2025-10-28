import { NextResponse } from 'next/server';

// Intento seguro de usar los helpers de BD. Si no están disponibles, responderemos con 503 y
// un mensaje claro para que el desarrollador configure POSTGRES_URL correctamente.
// Usamos persistencia basada en archivo para reportes (más robusto en entornos locales).
// Si en el futuro quieres volver a usar la BD, se puede re-introducir la dependencia.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const reportsFs = require('@/lib/reportsFs');
const getReports = reportsFs.getReports;
const createReport = reportsFs.createReport;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const rows = await getReports({ from, to });
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error('Error leyendo production_reports:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (Array.isArray(body)) {
      const inserted: any[] = [];
      try {
        for (const b of body) {
          const toCreate = {
            occurred_at: b.occurred_at || new Date().toISOString(),
            arido1: b.arido1 ?? null,
            arido2: b.arido2 ?? null,
            arido3: b.arido3 ?? null,
            client_id: b.clientId ?? b.client_id ?? null,
            project_id: b.projectId ?? b.project_id ?? null,
            mixer_id: b.mixerId ?? b.mixer_id ?? null,
            driver_id: b.driverId ?? b.driver_id ?? null,
            // opcionales: nombres legibles enviados por frontend
            client: b.client ?? b.client_name ?? null,
            project: b.project ?? b.project_name ?? null,
            mixer: b.mixer ?? b.mixer_name ?? null,
            driver: b.driver ?? b.driver_name ?? null,
            notes: b.notes ?? ''
          };
          const created = await createReport(toCreate);
          inserted.push(created);
        }
        return NextResponse.json({ data: inserted }, { status: 201 });
      } catch (err) {
        console.error('Error insertando bulk production_reports:', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
      }
    }

    // single object
    const toCreate = {
      occurred_at: body.occurred_at || new Date().toISOString(),
      arido1: body.arido1 ?? null,
      arido2: body.arido2 ?? null,
      arido3: body.arido3 ?? null,
      client_id: body.clientId ?? body.client_id ?? null,
      project_id: body.projectId ?? body.project_id ?? null,
      mixer_id: body.mixerId ?? body.mixer_id ?? null,
      driver_id: body.driverId ?? body.driver_id ?? null,
      // nombres legibles opcionales
      client: body.client ?? body.client_name ?? null,
      project: body.project ?? body.project_name ?? null,
      mixer: body.mixer ?? body.mixer_name ?? null,
      driver: body.driver ?? body.driver_name ?? null,
      notes: body.notes ?? ''
    };
    try {
      const saved = await createReport(toCreate);
      return NextResponse.json({ data: saved }, { status: 201 });
    } catch (err) {
      console.error('Error insertando production_reports:', err);
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
