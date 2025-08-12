import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AuditoriaSidebarItem() {
  return (
    <Link href="/admin/auditoria" className="flex items-center gap-2 px-4 py-2 rounded hover:bg-blue-50 transition-colors">
      <ShieldCheck className="w-5 h-5 text-blue-700" />
      <span className="font-semibold text-blue-900">Auditoría</span>
    </Link>
  );
}
