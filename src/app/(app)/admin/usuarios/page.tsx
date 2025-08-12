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
import { PlusCircle, FilePen, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserForm } from '@/components/user-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/auth-context';
import { useSearch } from '@/context/search-context';
import type { User } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isValid } from 'date-fns';


export default function UsuariosPage() {
  const { user: currentUser, users, addUser, updateUser, deleteUser, fetchUsers } = useAuth();
  const { searchQuery } = useSearch();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleStyling = (role: string) => {
    switch (role) {
      case 'Super Usuario':
        return { variant: 'destructive', className: '' };
      case 'Supervisor':
        return { variant: 'default', className: '' };
      case 'Administrador':
        return { variant: 'secondary', className: 'bg-green-400 text-green-900 hover:bg-green-500' };
      case 'Usuario':
        return { variant: 'secondary', className: 'bg-cyan-200 text-cyan-800 hover:bg-cyan-300' };
      default:
        return { variant: 'outline', className: '' };
    }
  };

  const handleFormSubmit = async (data: any) => {
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
  };

  const handleDeleteUser = async (userId: string) => {
     try {
      await deleteUser(userId);
      toast({ title: "Usuario Eliminado", description: "El usuario ha sido eliminado del sistema." });
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: "No se pudo eliminar el usuario." });
    }
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
    if (!users) return [];
    if (!searchQuery) return users;
    const lowercasedQuery = searchQuery.toLowerCase();
    return users.filter(user =>
      user.name.toLowerCase().includes(lowercasedQuery) ||
      user.username.toLowerCase().includes(lowercasedQuery) ||
      user.role.toLowerCase().includes(lowercasedQuery)
    );
  }, [users, searchQuery]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Usuarios y Roles</h1>
        <p className="text-muted-foreground">Gestiona los usuarios y sus permisos de acceso.</p>
      </div>
      <div className="flex items-center justify-between">
         <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
            setIsFormOpen(isOpen);
            if (!isOpen) {
              setEditingUser(null);
            }
         }}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}</DialogTitle>
            </DialogHeader>
            <UserForm 
              onSubmit={handleFormSubmit}
              defaultValues={editingUser} 
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            Mostrando {filteredUsers.length} de {users?.length || 0} usuarios registrados en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Último Acceso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const roleStyle = getRoleStyling(user.role);
                
                let formattedLastAccess = 'Nunca';
                if (user.last_access) {
                    // Try parsing the date. It might already be a Date object or an ISO string.
                    const date = user.last_access instanceof Date ? user.last_access : parseISO(user.last_access);
                    if (isValid(date)) {
                        formattedLastAccess = format(date, 'dd/MM/yyyy HH:mm');
                    }
                }
                
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={`https://placehold.co/40x40.png?text=${user.name.charAt(0)}`}
                            data-ai-hint="user avatar"
                          />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.username}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleStyle.variant as any} className={roleStyle.className}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{formattedLastAccess}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.status === 'Activo' ? 'secondary' : 'outline'}
                        className={
                          user.status === 'Activo'
                            ? 'bg-green-100 text-green-800'
                            : ''
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                        <FilePen className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
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
                              className="bg-destructive hover:bg-destructive/90"
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
        </CardContent>
      </Card>
    </div>
  );
}
