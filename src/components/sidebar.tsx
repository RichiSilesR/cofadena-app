'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Home, Package, Users, Construction, ListTodo, Settings, Truck, Contact, Factory, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import * as React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';

// --- PALETA DE COLORES Y CLASES MODERNAS (Light Mode por defecto, Dark Mode con prefijo) ---

// Color de acento "Celeste Oscuro" para ambos modos
const ACCENT_COLOR_CLASS = 'text-sky-600 dark:text-sky-400';
const ACCENT_ICON_CLASS = 'text-sky-600 dark:text-sky-400';

// Fondos y Bordes
const BG_BASE = 'bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-800';

// Estado Hover
const HOVER_BG = 'hover:bg-gray-100 dark:hover:bg-slate-800/70';
const HOVER_TEXT = 'hover:text-sky-700 dark:hover:text-white';

// Estado Activo
const ACTIVE_BG_CLASS = 'bg-sky-50 dark:bg-slate-800 border-l-4 border-sky-600 dark:border-sky-400';
const ACTIVE_TEXT_CLASS = 'text-sky-700 dark:text-white';

// Texto Base
const TEXT_BASE = 'text-gray-600 dark:text-slate-300'; 
const TEXT_LOGO = 'text-gray-900 dark:text-white';


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
    { href: '/produccion/parametros', label: 'Parámetros', icon: ListTodo, roles: ['Super Usuario', 'Supervisor'] },
    { href: '/produccion/visualizacion', label: 'Visualización', icon: Factory, roles: ['Super Usuario', 'Supervisor'] },
  ];
  const userCanSeeProduccion = produccionNav.some(item => item.roles.includes(user.role));
  const isProduccionPath = produccionNav.some(item => pathname.startsWith(item.href));

  const registrosNav = [
    { href: '/registros/reportes', label: 'Reportes', icon: FileText, roles: ['Super Usuario', 'Administrador', 'Supervisor'] },
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
  const userCanSeeAdmin = adminNav.some(item => adminNav.some(item => item.roles.includes(user.role)));
  const isAdminPath = adminNav.some(item => pathname.startsWith(item.href));

  // Función de ayuda para aplicar estilos
  const getItemClasses = (href: string, isAccordionItem: boolean = false) => {
    const isActive = isAccordionItem ? pathname.startsWith(href) : pathname === href;

    return cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 transition-all font-medium',
      TEXT_BASE,
      HOVER_BG, 
      HOVER_TEXT,
      // Estilo activo
      isActive 
        ? `${ACTIVE_TEXT_CLASS} ${ACTIVE_BG_CLASS}` 
        : '' 
    );
  };

  // Función de ayuda para aplicar estilos del Trigger del Acordeón
  const getAccordionTriggerClasses = (pathCheck: boolean) => {
    return cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:no-underline font-medium',
        TEXT_BASE,
        HOVER_BG,
        HOVER_TEXT,
        // Si el acordeón está abierto o contiene la ruta, aplicar estilos activos
        pathCheck 
          ? `${ACCENT_ICON_CLASS} ${TEXT_LOGO} dark:text-white hover:text-sky-700 dark:hover:text-white [&[data-state=open]>svg]:${ACCENT_ICON_CLASS}` 
          : `hover:text-sky-700 dark:hover:text-white [&[data-state=open]>svg]:${ACCENT_ICON_CLASS}`
      );
  }

  return (
    // CAMBIO: Aplicamos las clases base con soporte para dark mode
    <div className={cn("hidden border-r md:block", BG_BASE)}>
      <div className="flex h-full max-h-screen flex-col gap-2">
        {/* CABECERA: Fondo y borde de cabecera con soporte dark mode */}
        <div className={cn("flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6", BG_BASE)}>
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Image src="/images/logo.jpg" alt="COFADENA Logo" width={32} height={32} />
            <span className={cn("font-headline text-xl", TEXT_LOGO)}>COFADENA</span>
          </Link>
          {/* Botón de Notificaciones */}
          <Button variant="ghost" size="icon" className={cn("ml-auto h-8 w-8 text-gray-400", HOVER_BG)}>
            <Bell className={cn("h-4 w-4", TEXT_BASE)} />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </div>
        
        {/* CUERPO DE NAVEGACIÓN */}
        <div className="flex-1 overflow-y-auto pt-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
            
            {/* Ítems Principales */}
            {mainNav.filter(item => item.roles.includes(user.role)).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={getItemClasses(item.href)}
              >
                <item.icon className={cn("h-4 w-4", (pathname === item.href) && ACCENT_ICON_CLASS)} />
                {item.label}
              </Link>
            ))}

            {/* Acordeón de Producción */}
            {userCanSeeProduccion && (
              <Accordion type="single" collapsible defaultValue={isProduccionPath ? "produccion" : ""} className="w-full">
                <AccordionItem value="produccion" className="border-b-0">
                  <AccordionTrigger className={getAccordionTriggerClasses(isProduccionPath)}>
                    <Factory className={cn("h-4 w-4", isProduccionPath && ACCENT_ICON_CLASS)} />
                    Producción
                  </AccordionTrigger>
                  <AccordionContent className="pl-0 pb-0">
                    <nav className="grid items-start px-2 text-sm font-normal space-y-1 mt-1">
                      {produccionNav.filter(item => item.roles.includes(user.role)).map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(getItemClasses(item.href, true), 'pl-7')}
                        >
                          <item.icon className={cn("h-4 w-4", pathname.startsWith(item.href) && ACCENT_ICON_CLASS)} />
                          {item.label}
                        </Link>
                      ))}
                    </nav>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
            
            {/* Acordeón de Registros */}
            {userCanSeeRegistros && (
              <Accordion type="single" collapsible defaultValue={isRegistrosPath ? "registros" : ""} className="w-full">
                <AccordionItem value="registros" className="border-b-0">
                  <AccordionTrigger className={getAccordionTriggerClasses(isRegistrosPath)}>
                    <Package className={cn("h-4 w-4", isRegistrosPath && ACCENT_ICON_CLASS)} />
                    Registros
                  </AccordionTrigger>
                  <AccordionContent className="pl-0 pb-0">
                    <nav className="grid items-start px-2 text-sm font-normal space-y-1 mt-1">
                      {registrosNav.filter(item => item.roles.includes(user.role)).map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(getItemClasses(item.href, true), 'pl-7')}
                        >
                          <item.icon className={cn("h-4 w-4", pathname.startsWith(item.href) && ACCENT_ICON_CLASS)} />
                          {item.label}
                        </Link>
                      ))}
                    </nav>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            {/* Acordeón de Administración */}
            {userCanSeeAdmin && (
              <Accordion type="single" collapsible defaultValue={isAdminPath ? "admin" : ""} className="w-full">
                <AccordionItem value="admin" className="border-b-0">
                  <AccordionTrigger className={getAccordionTriggerClasses(isAdminPath)}>
                    <Settings className={cn("h-4 w-4", isAdminPath && ACCENT_ICON_CLASS)} />
                    Administración
                  </AccordionTrigger>
                  <AccordionContent className="pl-0 pb-0">
                    <nav className="grid items-start px-2 text-sm font-normal space-y-1 mt-1">
                      {adminNav.filter(item => item.roles.includes(user.role)).map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(getItemClasses(item.href, true), 'pl-7')}
                        >
                          <item.icon className={cn("h-4 w-4", pathname.startsWith(item.href) && ACCENT_ICON_CLASS)} />
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