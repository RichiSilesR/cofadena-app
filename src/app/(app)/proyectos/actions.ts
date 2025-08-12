'use server';
import { getProjects, createProject, updateProject, deleteProject } from '@/lib/db';

export async function fetchProjects() {
  return await getProjects();
}

export async function addProject(project) {
  return await createProject(project);
}

export async function editProject(id, project) {
  return await updateProject(id, project);
}

export async function removeProject(id) {
  return await deleteProject(id);
}
