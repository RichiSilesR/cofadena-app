'use server';
import { getMixers, createMixer, updateMixer, deleteMixer } from '@/lib/db';
import type { Mixer } from '@/lib/data';

export async function fetchMixers() {
  return await getMixers();
}

export async function addMixer(mixer: Omit<Mixer, 'id'>, audit: { user_id?: string; username?: string }) {
  return await createMixer(mixer, audit);
}

export async function editMixer(id: string, mixer: Partial<Mixer>, audit: { user_id?: string; username?: string }) {
  return await updateMixer(id, mixer, audit);
}

export async function removeMixer(id: string) {
  return await deleteMixer(id);
}
