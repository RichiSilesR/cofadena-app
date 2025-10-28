'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, FilePen, Trash2, Users as UsersIcon } from 'lucide-react'; 
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserForm } from '@/components/user-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/auth-context'; // Debe proveer users y fetchUsers
import { useSearch } from '@/context/search-context';
import type { User } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils'; 

// --- PALETA DE COLORES PROFESIONAL (CELESTE OSCURO/CYAN) ---
const ACCENT_COLOR_TEXT = 'text-sky-500 dark:text-sky-400';
const ACCENT_BUTTON = 'bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600';
const PAGE_BG = 'bg-gray-50 dark:bg-slate-900'; 
const CARD_BG = 'bg-white dark:bg-slate-800 shadow-xl dark:border dark:border-slate-700';
const TEXT_MUTED = 'text-gray-500 dark:text-slate-400';
const TEXT_PRIMARY = 'text-gray-900 dark:text-white';


export default function UsuariosPage() {
  const { user: currentUser, users, addUser, updateUser, deleteUser, fetchUsers, loading: authLoading } = useAuth();
  const { searchQuery } = useSearch();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [isLocalLoading, setIsLocalLoading] = React.useState(true); // Estado de carga local
  const { toast } = useToast();

  // FIX CLAVE: Cargar los datos y detener el estado de carga local
  React.useEffect(() => {
    let isMounted = true;
    
    // Función asíncrona para manejar la carga y el estado
    const loadUsers = async () => {
      try {
        await fetchUsers();
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        // Opcional: mostrar un toast de error al usuario
        toast({ variant: 'destructive', title: "Error de Conexión", description: "No se pudieron cargar los datos de usuarios." });
      } finally {
        // Detener el loading local solo si el componente sigue montado
        if (isMounted) {
            setIsLocalLoading(false);
        }
      }
    };
    
    loadUsers();

    // Función de limpieza de React
    return () => {
        isMounted = false;
    };
  }, [fetchUsers, toast]); // fetchUsers y toast deben ser estables (useCallback/useMemo)

  // Función de estilo moderna y con soporte para dark mode
  const getRoleStyling = (role: string) => {
    switch (role) {
      case 'Super Usuario':
        return { variant: 'destructive', className: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600' };
      case 'Administrador':
        return { variant: 'secondary', className: 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600' };
      case 'Supervisor':
        return { variant: 'default', className: 'bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600' };
      case 'Usuario':
        return { variant: 'secondary', className: 'bg-gray-400 text-gray-800 hover:bg-gray-500 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500' };
      default:
        return { variant: 'outline', className: 'border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-400' };
    }
  };

  const handleFormSubmit = async (data: any) => {
    // Puedes reusar isLocalLoading o agregar un loading específico para el formulario
    // setIsLocalLoading(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, data);
        toast({ title: "Usuario Actualizado", description: "El usuario ha sido actualizado correctamente." });
      } else {
        await addUser(data);
        toast({ title: "Usuario Creado", description: "El nuevo usuario ha sido añadido al sistema." });
      }
      setIsFormOpen(false);
      setEditingUser(null);
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: "No se pudo guardar el usuario." });
    }
    // finally { setIsLocalLoading(false); }
  };

  const handleDeleteUser = async (userId: string) => {
      // setIsLocalLoading(true);
      try {
      await deleteUser(userId);
      toast({ title: "Usuario Eliminado", description: "El usuario ha sido eliminado del sistema." });
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: "No se pudo eliminar el usuario." });
    }
    // finally { setIsLocalLoading(false); }
  };
  
  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  }

  const openCreateDialog = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  }

  const filteredUsers = React.useMemo(() => {
    const list = users || []; // Usar array vacío si 'users' es null o undefined
    if (!searchQuery) return list;
    const lowercasedQuery = searchQuery.toLowerCase();
    return list.filter(user =>
      user.name.toLowerCase().includes(lowercasedQuery) ||
      user.username.toLowerCase().includes(lowercasedQuery) ||
      user.role.toLowerCase().includes(lowercasedQuery)
    );
  }, [users, searchQuery]);

  // MOSTRAR CARGANDO: Si el loading local está activo O la lista de usuarios es null/undefined
  if (isLocalLoading || !users) {
    return (
        <div className={cn("flex flex-col gap-8 p-6 sm:p-8 min-h-screen items-center justify-center", PAGE_BG)}>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sky-500" />
            <p className={cn("text-lg", TEXT_MUTED)}>Cargando datos de usuarios...</p>
        </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-8 p-6 sm:p-8 min-h-screen", PAGE_BG)} aria-label="Gestión de Usuarios y Roles" role="main">
      
      {/* Encabezado y Acciones */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <UsersIcon className={cn("w-8 h-8", ACCENT_COLOR_TEXT)} />
            <div>
                <h1 className={cn("text-3xl font-bold font-headline", TEXT_PRIMARY)}>Usuarios y Roles</h1>
                <p className={cn("text-muted-foreground", TEXT_MUTED)}>
                    Gestiona los usuarios y sus permisos de acceso.
                </p>
            </div>
        </div>
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) {
            setEditingUser(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className={ACCENT_BUTTON}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className={TEXT_PRIMARY}>{editingUser ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}</DialogTitle>
            </DialogHeader>
            <UserForm 
              onSubmit={handleFormSubmit}
              defaultValues={editingUser} 
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Usuarios */}
      <Card className={CARD_BG}>
        <CardHeader>
          <CardTitle className={cn("text-xl font-semibold", TEXT_PRIMARY)}>Lista de Usuarios</CardTitle>
          <CardDescription className={TEXT_MUTED}>
            Mostrando <strong className="font-semibold">{filteredUsers.length}</strong> de {users.length} usuarios registrados en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table aria-label="Tabla de usuarios y roles">
              <TableHeader>
                <TableRow className="bg-gray-100 dark:bg-slate-700/50 border-b dark:border-slate-700">
                  <TableHead className={cn("font-semibold", TEXT_PRIMARY)}>Nombre</TableHead>
                  <TableHead className={cn("font-semibold", TEXT_PRIMARY)}>Rol</TableHead>
                  <TableHead className={cn("font-semibold", TEXT_PRIMARY)}>Último Acceso</TableHead>
                  <TableHead className={cn("font-semibold", TEXT_PRIMARY)}>Estado</TableHead>
                  <TableHead className={cn("text-right font-semibold", TEXT_PRIMARY)}>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const roleStyle = getRoleStyling(user.role);
                  
                  let formattedLastAccess = 'Nunca';
                  if (user.last_access) {
                      const date = user.last_access instanceof Date ? user.last_access : parseISO(user.last_access);
                      if (isValid(date)) {
                          formattedLastAccess = format(date, 'dd/MM/yyyy HH:mm');
                      }
                  }
                  
                  return (
                    <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-gray-200 dark:border-slate-700">
                            <AvatarImage
                              src={`https://placehold.co/40x40.png?text=${user.name.charAt(0)}`}
                              alt={`Avatar de ${user.name}`}
                            />
                            <AvatarFallback className={cn("bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-300 font-bold")}>
                                {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className={cn("font-medium", TEXT_PRIMARY)}>{user.name}</div>
                            <div className={cn("text-sm", TEXT_MUTED)}>
                              {user.username}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                            variant={roleStyle.variant as any} 
                            className={roleStyle.className}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className={TEXT_PRIMARY}>{formattedLastAccess}</TableCell>
                      <TableCell>
                        <Badge
                          variant={user.status === 'Activo' ? 'default' : 'outline'}
                          className={
                            cn(user.status === 'Activo'
                              ? 'bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500'
                              : 'border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-400'
                            )
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openEditDialog(user)}
                            className={cn("text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 hover:bg-gray-100 dark:hover:bg-slate-700")}
                        >
                          <FilePen className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-600 hover:bg-gray-100 dark:hover:bg-slate-700"
                              // Evita que un Super Usuario se borre a sí mismo
                              disabled={user.role === 'Super Usuario' && user.id === currentUser?.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                ¿Estás seguro de que quieres eliminar a este usuario?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente al usuario <strong>{user.name}</strong> del
                                sistema.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}