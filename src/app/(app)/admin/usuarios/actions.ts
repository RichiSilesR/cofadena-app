'use server';

import { pool, logAudit } from '@/lib/db';
import type { User } from '@/lib/data';
import bcrypt from 'bcryptjs';

// Obtener todos los usuarios
export async function getUsers(): Promise<User[]> {
  try {
    const res = await pool.query('SELECT id, name, username, role, last_access, status FROM users ORDER BY name ASC');
    return res.rows;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}


// Crear un nuevo usuario (recibe la contraseña en texto plano y la hashea aquí)
export async function createUser(user: Omit<User, 'id' | 'last_access' | 'password_hash'> & { password: string, audit?: any }) {
    const { name, username, password, role, status, audit } = user as any;
    try {
        const password_hash = await bcrypt.hash(password, 10);
        const res = await pool.query(
            'INSERT INTO users (name, username, password_hash, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, username, password_hash, role, status]
        );
        const created = res.rows[0];
        if (audit && (audit.user_id || audit.username)) {
          await logAudit({
            user_id: audit.user_id || null,
            username: audit.username || null,
            action_type: 'agregó',
            entity: 'Usuarios',
            entity_id: created.id,
            after_data: created,
            description: `Usuario agregado: ${created.name}`
          });
        }

    } catch (error) {
        console.error('Error creating user:', error);
        throw new Error('No se pudo crear el usuario.');
    }
}


// Editar un usuario
export async function editUser(id: string, user: Partial<Omit<User, 'id' | 'password_hash'>> & { password?: string, audit?: any }) {
    const { password, audit, ...userData } = user;
    const fieldsToUpdate: Record<string, any> = { ...userData };

    if (password) {
        fieldsToUpdate.password_hash = await bcrypt.hash(password, 10);
    }
    const fields = Object.keys(fieldsToUpdate);
    const values = Object.values(fieldsToUpdate);

    if (fields.length === 0) {
        return;
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

    try {
        // Obtener datos antes del cambio
        const beforeRes = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        const beforeData = beforeRes.rows[0];
        const res = await pool.query(
            `UPDATE users SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
            [...values, id]
        );
        const updated = res.rows[0];
        if (audit && (audit.user_id || audit.username)) {
          await logAudit({
            user_id: audit.user_id || null,
            username: audit.username || null,
            action_type: 'actualizó',
            entity: 'Usuarios',
            entity_id: id,
            before_data: beforeData,
            after_data: updated,
            description: `Usuario actualizado: ${updated.name}`
          });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        throw new Error('No se pudo actualizar el usuario.');
    }
}


// Eliminar un usuario
export async function removeUser(id: string, audit?: any) {
    try {
        // Obtener datos antes de eliminar
        const beforeRes = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        const beforeData = beforeRes.rows[0];
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        if (audit && (audit.user_id || audit.username)) {
          await logAudit({
            user_id: audit.user_id || null,
            username: audit.username || null,
            action_type: 'eliminó',
            entity: 'Usuarios',
            entity_id: id,
            before_data: beforeData,
            description: `Usuario eliminado: ${beforeData?.name || ''}`
          });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        throw new Error('No se pudo eliminar el usuario.');
    }
}
