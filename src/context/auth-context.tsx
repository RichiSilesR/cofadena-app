'use client';

import * as React from 'react';
import type { User } from '@/lib/data';
import { login as serverLogin, type UserLogin } from '@/app/login/actions';
import { getUsers, createUser, editUser, removeUser } from '@/app/(app)/admin/usuarios/actions';

type SafeUser = Omit<User, 'password' | 'password_hash'>;

interface AuthContextType {
  user: SafeUser | null;
  users: User[];
  isCheckingAuth: boolean;
  login: (username: string, pass: string) => Promise<UserLogin>;
  logout: () => void;
  addUser: (user: Omit<User, 'id'| 'last_access' | 'password_hash'> & { password: string }) => Promise<void>;
  updateUser: (id: string, updatedUser: Partial<Omit<User, 'id' | 'password_hash'>> & { password?: string }) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  fetchUsers: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<SafeUser | null>(null);
  const [users, setUsers] = React.useState<User[]>([]);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);


  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        // Leer JWT desde la cookie
        const match = document.cookie.match(/auth-token=([^;]+)/);
        if (match) {
          const token = match[1];
          const parts = token.split('.');
          if (parts.length === 3) {
            const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const payloadJson = JSON.parse(decodeURIComponent(escape(atob(payloadB64))));
            if (payloadJson.exp && Date.now() / 1000 < payloadJson.exp) {
              setUser({
                id: payloadJson.id,
                name: payloadJson.username,
                role: payloadJson.role,
                // ...otros campos si los necesitas
              });
              setIsCheckingAuth(false);
              return;
            }
          }
        }
        setUser(null);
      } catch (error) {
        setUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Failed to fetch users", error);
      setUsers([]);
    }
  };

  const login = async (username: string, pass: string): Promise<UserLogin> => {
    const result = await serverLogin(username, pass);

    if (result.success && result.user) {
      setUser(result.user);
      localStorage.setItem('current_user', JSON.stringify(result.user));
    } else {
      setUser(null);
      localStorage.removeItem('current_user');
    }
    
    return result;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('current_user');
    // Eliminar la cookie de autenticación
    if (typeof document !== 'undefined') {
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    }
  };
  
  const addUser = async (newUser: Omit<User, 'id' | 'last_access' | 'password_hash' > & {password: string} ) => {
    const userWithStatus = { ...newUser, status: 'Activo' as const };
    const audit = user ? { user_id: user.id, username: user.name } : {};
    await createUser({ ...userWithStatus, audit });
    await fetchUsers();
  };

  const updateUser = async (id: string, updatedData: Partial<Omit<User, 'id' | 'password_hash'>> & { password?: string }) => {
     const audit = user ? { user_id: user.id, username: user.name } : {};
     await editUser(id, { ...updatedData, audit });
     await fetchUsers();
     if (user && user.id === id) {
        // Solo actualizar nombre y rol en la sesión actual
        const { name, role } = updatedData;
        const updatedSessionUser = { ...user, name: name || user.name, role: role || user.role };
        setUser(updatedSessionUser);
        localStorage.setItem('current_user', JSON.stringify(updatedSessionUser));
     }
  };

  const deleteUser = async (id: string) => {
    const audit = user ? { user_id: user.id, username: user.name } : {};
    await removeUser(id, audit);
    await fetchUsers();
  };

  return (
    <AuthContext.Provider value={{ user, users, isCheckingAuth, login, logout, addUser, updateUser, deleteUser, fetchUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
