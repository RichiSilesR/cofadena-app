'use server';

import { pool } from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { User } from '@/lib/data';
import bcrypt from 'bcryptjs';

// Esta interfaz se usa para tipar la respuesta del Server Action.
export interface UserLogin {
  success: boolean;
  user?: Omit<User, 'password_hash'>;
  error?: string;
}

export async function login(username: string, pass: string): Promise<UserLogin> {
  try {
    const res = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (res.rows.length === 0) {
      console.log(`Login attempt failed: User "${username}" not found.`);
      return { success: false, error: 'Usuario o contraseña incorrectos.' };
    }
    
    const foundUser: User = res.rows[0];

    if (!foundUser.password_hash) {
      console.log(`Login attempt failed: User "${username}" has no password hash.`);
      return { success: false, error: 'Cuenta no configurada correctamente.' };
    }
    
    if (foundUser.status !== 'Activo') {
        console.log(`Login attempt failed: User "${username}" is inactive.`);
        return { success: false, error: 'La cuenta de usuario está inactiva.' };
    }

    // Solución Definitiva: Limpiar el hash antes de comparar.
    const passwordMatch = await bcrypt.compare(pass, foundUser.password_hash.trim());
    
    if (passwordMatch) {
      // Éxito: Actualiza el último acceso y devuelve el usuario.
      await pool.query('UPDATE users SET last_access = NOW() WHERE id = $1', [foundUser.id]);
      
      const { password_hash, ...safeUser } = foundUser;
      
      // Generar JWT seguro
      const secret = process.env.JWT_SECRET || 'supersecretkey';
      const token = jwt.sign({ id: foundUser.id, username: foundUser.username, role: foundUser.role }, secret, {
        expiresIn: '7d'
      });
      // Guardar JWT en cookie segura (API asíncrona)
      const cookieStore = await cookies();
      cookieStore.set('auth-token', token, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: true,
        maxAge: 60 * 60 * 24 * 7 // 7 días
      });
      return { 
        success: true, 
        user: {
          ...safeUser,
          last_access: new Date().toISOString() // Devolvemos la fecha actual como último acceso
        }
      };
    } else {
      // Fallo: Contraseña incorrecta.
      console.log(`Login attempt failed: Incorrect password for user "${username}".`);
      return { success: false, error: 'Usuario o contraseña incorrectos.' };
    }
      
  } catch (error) {
    console.error('Error durante el login:', error);
    if (error instanceof Error) {
        return { success: false, error: `Error del servidor: ${error.message}` };
    }
    return { success: false, error: 'Error del servidor al intentar iniciar sesión.' };
  }
}
