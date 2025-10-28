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
  
  // 1. MEMOIZAR fetchUsers: FUNCIÓN CLAVE PARA EVITAR LOOPS
  // Esta función es estable y no cambia en cada render del proveedor.
  const fetchUsers = React.useCallback(async () => {
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Failed to fetch users", error);
      setUsers([]);
    }
  }, [setUsers]); // setUsers es estable (viene de useState)

  // 2. useEffect PRINCIPAL: Solo maneja la autenticación
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
            // Nota: Este método de decodificación puede fallar con algunos caracteres.
            // Es mejor usar una librería de JWT si es posible, pero se mantiene la lógica original.
            const payloadJson = JSON.parse(decodeURIComponent(escape(atob(payloadB64))));
            if (payloadJson.exp && Date.now() / 1000 < payloadJson.exp) {
              setUser({
                id: payloadJson.id,
                name: payloadJson.username,
                role: payloadJson.role,
                // Agrega otros campos de SafeUser aquí si existen en el token
              });
              setIsCheckingAuth(false);
              return;
            }
          }
        }
        setUser(null);
      } catch (error) {
        // console.error("Error checking auth", error);
        setUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
    // 🛑 IMPORTANTE: Se elimina la llamada directa a fetchUsers() aquí. 
    // Ahora la página 'UsuariosPage' es la responsable de llamar a fetchUsers()
    // usando la versión memoizada (estable) que exportamos.
  }, []);
  
  // 3. MEMOIZAR las demás funciones para garantizar estabilidad y evitar re-renders innecesarios
  const login = React.useCallback(async (username: string, pass: string): Promise<UserLogin> => {
    const result = await serverLogin(username, pass);

    if (result.success && result.user) {
      // El JWT en la cookie se maneja en el server action, aquí solo actualizamos el estado local
      setUser(result.user);
      // Nota: Evita usar localStorage para datos sensibles. Si necesitas persistencia, 
      // confía solo en el token de la cookie.
    } else {
      setUser(null);
    }
    
    return result;
  }, []);

  const logout = React.useCallback(() => {
    setUser(null);
    // Eliminar la cookie de autenticación
    if (typeof document !== 'undefined') {
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    }
  }, []);
  
  // Dependencias: fetchUsers
  const addUser = React.useCallback(async (newUser: Omit<User, 'id' | 'last_access' | 'password_hash' > & {password: string} ) => {
    const userWithStatus = { ...newUser, status: 'Activo' as const };
    const audit = user ? { user_id: user.id, username: user.name } : {};
    await createUser({ ...userWithStatus, audit });
    await fetchUsers(); // Llama a la versión memoizada
  }, [user, fetchUsers]); 

  // Dependencias: user, fetchUsers, setUser
  const updateUser = React.useCallback(async (id: string, updatedData: Partial<Omit<User, 'id' | 'password_hash'>> & { password?: string }) => {
    const audit = user ? { user_id: user.id, username: user.name } : {};
    await editUser(id, { ...updatedData, audit });
    await fetchUsers(); // Llama a la versión memoizada
    if (user && user.id === id) {
      // Solo actualizar nombre y rol en la sesión actual
      const { name, role } = updatedData;
      const updatedSessionUser = { ...user, name: name || user.name, role: role || user.role };
      setUser(updatedSessionUser);
      // Nota: Si usas Next.js, deberías actualizar la sesión a través de server actions 
      // y revalidar las cookies para mayor seguridad y consistencia.
    }
  }, [user, fetchUsers, setUser]);

  // Dependencias: user, fetchUsers
  const deleteUser = React.useCallback(async (id: string) => {
    const audit = user ? { user_id: user.id, username: user.name } : {};
    await removeUser(id, audit);
    await fetchUsers(); // Llama a la versión memoizada
  }, [user, fetchUsers]);

  // 4. Se asegura que el valor del contexto use las funciones memoizadas
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
