import { getAuditLogs } from '@/lib/db';
import AuditoriaClient from './AuditoriaClient';
import { cookies } from 'next/headers';

export default async function AuditoriaPage() {
  // Leer el token de la cookie y decodificar el usuario y rol
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;
  let user = null;
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const payloadJson = JSON.parse(decodeURIComponent(escape(atob(payloadB64))));
        user = { id: payloadJson.id, name: payloadJson.username, role: payloadJson.role };
      }
    } catch {}
  }
  if (!user || user.role !== 'Super Usuario') {
    return <div className="p-8 text-center text-lg font-bold text-red-700">Acceso restringido solo a Súper Usuarios.</div>;
  }
  // Carga inicial de logs para SSR (opcional, puede dejarse vacío si se prefiere solo cliente)
  const logs = await getAuditLogs({});
  return <AuditoriaClient user={user} initialLogs={logs} />;
}
