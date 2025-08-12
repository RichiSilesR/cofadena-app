'use client';

import { Sidebar } from '@/components/sidebar';
import { UserNav } from '@/components/user-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';
import { Bell, Search } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { useSearch } from '@/context/search-context';
import { AppDataProvider } from '@/context/app-data-context';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isCheckingAuth } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    // Si la verificación de autenticación ha terminado y no se encontró un usuario,
    // redirigimos forzosamente a la página de login.
    if (!isCheckingAuth && !user) {
      router.replace('/login');
    }
  }, [user, isCheckingAuth, router]);

  // Resetear la búsqueda al cambiar de página para evitar filtros inconsistentes.
  React.useEffect(() => {
    setSearchQuery('');
  }, [pathname, setSearchQuery]);

  const pathsToHideSearch = ['/dashboard', '/produccion'];
  const showSearchBar = !pathsToHideSearch.includes(pathname);

  // **GUARDIÁN DE SEGURIDAD CRÍTICO**
  // No renderizar absolutamente nada del contenido protegido hasta que el estado de
  // autenticación haya sido verificado.
  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Verificando sesión...</p>
      </div>
    );
  }

  // Si después de la verificación no hay usuario, la redirección del useEffect se encargará.
  // Devolver null aquí asegura que no haya un "parpadeo" del contenido protegido.
  if (!user) {
    return null;
  }

  // Solo si la verificación ha terminado y SÍ hay un usuario, se renderiza el layout.
  return (
    <AppDataProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <div className="w-full flex-1">
              {showSearchBar && (
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Búsqueda..."
                      className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </form>
              )}
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Alternar notificaciones</span>
            </Button>
            <UserNav />
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/20">
            {children}
          </main>
          <footer className="border-t text-center p-4 text-xs text-muted-foreground bg-background">
            <p>© 2025 COFADENA HORMIGON BOLIVIA</p>
          </footer>
        </div>
      </div>
    </AppDataProvider>
  );
}

