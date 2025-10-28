"use server";
import { getReports, createReport } from '@/lib/db';
import type { Report } from '@/lib/data';

export async function fetchReports(params: { from?: string; to?: string } = {}) {
  return await getReports(params);
}

export async function addReport(report: Omit<Report, 'id'>, audit: { user_id?: string; username?: string } = {}) {
  return await createReport(report, audit);
}
