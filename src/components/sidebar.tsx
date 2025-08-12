'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Home, Package, Users, Construction, ListTodo, Settings, Truck, Contact, Factory } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import * as React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  if (!user) {
    return null; // O un esqueleto de carga
  }

  const mainNav = [
    { href: '/dashboard', label: 'Inicio', icon: Home, roles: ['Super Usuario', 'Administrador', 'Supervisor', 'Usuario'] },
  ];

  const produccionNav = [
    { href: '/produccion/parametros', label: 'Parámetros', icon: Settings, roles: ['Super Usuario', 'Supervisor'] },
    { href: '/produccion/visualizacion', label: 'Visualización', icon: ListTodo, roles: ['Super Usuario', 'Supervisor'] },
  ];
  const userCanSeeProduccion = produccionNav.some(item => item.roles.includes(user.role));
  const isProduccionPath = produccionNav.some(item => pathname.startsWith(item.href));

  const registrosNav = [
      { href: '/registros/clientes', label: 'Clientes', icon: Contact, roles: ['Super Usuario', 'Administrador', 'Supervisor'] },
      { href: '/registros/mixers', label: 'Mixers', icon: Truck, roles: ['Super Usuario', 'Administrador', 'Supervisor'] },
      { href: '/registros/choferes', label: 'Choferes', icon: Contact, roles: ['Super Usuario', 'Administrador', 'Supervisor'] },
      { href: '/proyectos', label: 'Proyectos', icon: Construction, roles: ['Super Usuario', 'Administrador', 'Supervisor', 'Usuario'] },

  ];

  const adminNav = [
      { href: '/admin/usuarios', label: 'Usuarios y Roles', icon: Users, roles: ['Super Usuario'] },
      { href: '/admin/configuracion', label: 'Configuración', icon: Settings, roles: ['Super Usuario'] },
      { href: '/admin/auditoria', label: 'Auditoría', icon: Settings, roles: ['Super Usuario'] },
  ];

  const userCanSeeRegistros = registrosNav.some(item => item.roles.includes(user.role));
  const isRegistrosPath = registrosNav.some(item => pathname.startsWith(item.href));
  const userCanSeeAdmin = adminNav.some(item => item.roles.includes(user.role));
  const isAdminPath = adminNav.some(item => pathname.startsWith(item.href));

  return (
    <div className="hidden border-r bg-background md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
             <Image src="/images/logo.jpg" alt="COFADENA Logo" width={32} height={32} />
            <span className="font-headline text-xl">COFADENA</span>
          </Link>
          <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {mainNav.filter(item => item.roles.includes(user.role)).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  pathname === item.href && 'bg-muted text-primary'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}

            {userCanSeeProduccion && (
              <Accordion type="single" collapsible defaultValue={isProduccionPath ? "produccion" : ""} className="w-full">
                  <AccordionItem value="produccion" className="border-b-0">
                      <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:no-underline [&[data-state=open]>svg]:text-primary">
                           <Factory className="h-4 w-4" />
                           Producción
                      </AccordionTrigger>
                      <AccordionContent className="pl-4">
                           <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                              {produccionNav.filter(item => item.roles.includes(user.role)).map((item) => (
                                  <Link
                                      key={item.href}
                                      href={item.href}
                                      className={cn(
                                      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                                      pathname.startsWith(item.href) && 'bg-muted text-primary'
                                      )}
                                  >
                                      <item.icon className="h-4 w-4" />
                                      {item.label}
                                  </Link>
                              ))}
                           </nav>
                      </AccordionContent>
                  </AccordionItem>
              </Accordion>
            )}
            
            {userCanSeeRegistros && (
              <Accordion type="single" collapsible defaultValue={isRegistrosPath ? "registros" : ""} className="w-full">
                  <AccordionItem value="registros" className="border-b-0">
                      <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:no-underline [&[data-state=open]>svg]:text-primary">
                           <Package className="h-4 w-4" />
                           Registros
                      </AccordionTrigger>
                      <AccordionContent className="pl-4">
                           <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                              {registrosNav.filter(item => item.roles.includes(user.role)).map((item) => (
                                  <Link
                                      key={item.href}
                                      href={item.href}
                                      className={cn(
                                      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                                      pathname.startsWith(item.href) && 'bg-muted text-primary'
                                      )}
                                  >
                                      <item.icon className="h-4 w-4" />
                                      {item.label}
                                  </Link>
                              ))}
                           </nav>
                      </AccordionContent>
                  </AccordionItem>
              </Accordion>
            )}

            {userCanSeeAdmin && (
              <Accordion type="single" collapsible defaultValue={isAdminPath ? "admin" : ""} className="w-full">
                  <AccordionItem value="admin" className="border-b-0">
                      <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:no-underline [&[data-state=open]>svg]:text-primary">
                           <Settings className="h-4 w-4" />
                           Administración
                      </AccordionTrigger>
                      <AccordionContent className="pl-4">
                           <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                              {adminNav.filter(item => item.roles.includes(user.role)).map((item) => (
                                  <Link
                                      key={item.href}
                                      href={item.href}
                                      className={cn(
                                      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                                      pathname.startsWith(item.href) && 'bg-muted text-primary'
                                      )}
                                  >
                                      <item.icon className="h-4 w-4" />
                                      {item.label}
                                  </Link>
                              ))}
                           </nav>
                      </AccordionContent>
                  </AccordionItem>
              </Accordion>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
