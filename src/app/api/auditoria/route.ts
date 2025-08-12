import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/db';

export async function POST(req: NextRequest) {
  const filters = await req.json();
  const logs = await getAuditLogs(filters);
  return NextResponse.json({ logs });
}
