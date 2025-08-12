'use server';
import { getDrivers, createDriver, updateDriver, deleteDriver } from '@/lib/db';
import type { Driver } from '@/lib/data';

export async function fetchDrivers() {
  return await getDrivers();
}

export async function addDriver(driver: Omit<Driver, 'id'>, audit: { user_id?: string; username?: string }) {
  return await createDriver(driver, audit);
}

export async function editDriver(id: string, driver: Partial<Driver>, audit: { user_id?: string; username?: string }) {
  return await updateDriver(id, driver, audit);
}

export async function removeDriver(id: string) {
  return await deleteDriver(id);
}
