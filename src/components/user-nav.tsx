'use client';
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { LogOut, HelpCircle, Moon, Sun } from 'lucide-react';
import { useTheme } from "next-themes";
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

export function UserNav() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) {
    return null;
  }
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  }

  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(user.name)}`} alt={user.name} data-ai-hint="user avatar" />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.username} ({user.role})
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
             <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <div className="flex w-full items-center justify-between">
                    <div className='flex items-center'>
                     {theme === 'dark' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                     <span>Modo Oscuro</span>
                    </div>
                    <Switch
                        checked={theme === 'dark'}
                        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                    />
                </div>
            </DropdownMenuItem>
             <DialogTrigger asChild>
                <DropdownMenuItem>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Ayuda</span>
                </DropdownMenuItem>
             </DialogTrigger>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">Centro de Ayuda</DialogTitle>
          <DialogDescription>Bienvenido al centro de ayuda de COFADENA. Aquí encontrarás respuestas a las preguntas más frecuentes.</DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-6 text-sm max-h-[60vh] overflow-y-auto pr-4">
            <div>
                <h3 className="font-semibold text-primary">¿Cómo funciona la Búsqueda?</h3>
                <p className="text-muted-foreground">La barra de búsqueda en la parte superior es contextual. Esto significa que solo buscará dentro de la sección en la que te encuentres. Por ejemplo, si estás en "Clientes" y buscas "Pérez", solo obtendrás resultados de clientes que coincidan. La búsqueda es flexible y funciona con nombres, números, fechas y más.</p>
            </div>
            <div>
                <h3 className="font-semibold text-primary">Gestión de Proyectos</h3>
                <p className="text-muted-foreground">En la sección "Proyectos", puedes crear, editar y eliminar proyectos. Al crear o editar, el formulario se autocompletará con la información del cliente si lo seleccionas primero. El progreso se actualiza automáticamente a "Completado" cuando llega al 100%, y la fecha de fin se registra en ese momento.</p>
            </div>
             <div>
                <h3 className="font-semibold text-primary">Exportación de Datos</h3>
                <p className="text-muted-foreground">La sección "Proyectos" tiene un botón de "Exportar". Esto te permite descargar la información que ves en la tabla (incluyendo los filtros que hayas aplicado) en formatos CSV (para Excel) y PDF (para documentos profesionales).</p>
            </div>
             <div>
                <h3 className="font-semibold text-primary">Roles de Usuario</h3>
                <p className="text-muted-foreground">El sistema tiene diferentes roles con distintos niveles de permiso. Un "Super Usuario" tiene acceso a todo, mientras que un "Usuario" normal solo puede ver información sin poder modificarla. Esto garantiza la seguridad y la integridad de los datos.</p>
            </div>
             <div>
                <h3 className="font-semibold text-primary">Modo Oscuro</h3>
                <p className="text-muted-foreground">Puedes cambiar entre el modo claro y oscuro usando el interruptor en este mismo menú de usuario. Tu preferencia se guardará en tu navegador para futuras sesiones.</p>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
