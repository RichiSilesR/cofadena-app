'use server';
import { getClients, createClient, updateClient, deleteClient } from '@/lib/db';
import type { Client } from '@/lib/data';

export async function fetchClients() {
  return await getClients();
}

export async function addClient(client: Omit<Client, 'id'>, audit: { user_id?: string; username?: string }) {
  return await createClient(client, audit);
}

export async function editClient(id: string, client: Partial<Client>, audit: { user_id?: string; username?: string }) {
  return await updateClient(id, client, audit);
}

export async function removeClient(id: string) {
  return await deleteClient(id);
}
