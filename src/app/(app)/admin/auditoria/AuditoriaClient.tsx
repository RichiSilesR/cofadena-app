"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
// Importa utilidades
import { cn } from '@/lib/utils'; // Necesaria para combinar clases condicionalmente

// Componentes UI de Shadcn
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
// Iconos y utilidades de fecha
import { Calendar as CalendarIcon, Filter, Search, RotateCcw, Shield, LayoutList } from 'lucide-react'; 
import { es } from 'date-fns/locale';
import { format } from 'date-fns';

// --- PALETA DE COLORES PROFESIONAL (CELESTE OSCURO/CYAN) ---
const ACCENT_COLOR_TEXT = 'text-sky-500 dark:text-sky-400';
const ACCENT_BUTTON = 'bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600';
const PAGE_BG = 'bg-gray-50 dark:bg-slate-900'; 
const CARD_BG = 'bg-white dark:bg-slate-800 shadow-xl dark:border dark:border-slate-700';
const TEXT_MUTED = 'text-gray-500 dark:text-slate-400';
const TEXT_PRIMARY = 'text-gray-900 dark:text-white';
const TABLE_HEADER_BG = 'bg-gray-100 dark:bg-slate-700/50 border-b dark:border-slate-700';
const TABLE_ROW_HOVER = 'hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors';

export default function AuditoriaClient({ user, initialLogs }: { user: any, initialLogs: any[] }) {
  const { user: contextUser } = useAuth();
  const [logs, setLogs] = useState(initialLogs || []);
  const [filters, setFilters] = useState({ query: '', from: '', to: '', action_type: '', entity: '' });
  const [date, setDate] = useState<{ from?: Date; to?: Date }>({});
  const [loading, setLoading] = useState(false);

  // Sincroniza el filtro de fechas visual con los filtros de backend
  useEffect(() => {
    let from = date?.from ? format(date.from, 'yyyy-MM-dd') : '';
    let to = date?.to ? format(date.to, 'yyyy-MM-dd') : '';
    setFilters(f => ({ ...f, from, to }));
    // eslint-disable-next-line
  }, [date]);

  // Lógica de fetch para aplicar filtros
  useEffect(() => {
    if (!contextUser || contextUser.role !== 'Super Usuario') return;
    setLoading(true);
    fetch('/api/auditoria', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters),
    })
      .then(res => res.json())
      .then(data => setLogs(data.logs || []))
      .finally(() => setLoading(false));
  }, [filters, contextUser]);

  // Comprobación de acceso
  if (!contextUser || contextUser.role !== 'Super Usuario') {
    return (
      <div className={cn("p-8 text-center text-xl font-extrabold text-red-600", PAGE_BG)}>
        🚨 Acceso restringido solo a Súper Usuarios. 🚨
      </div>
    );
  }

  // Diccionarios de traducción
  const actionMap = {
    'create': 'Creación', 'update': 'Actualización', 'actualizó': 'Actualizó', 'delete': 'Eliminación',
    'login': 'Inicio de sesión', 'logout': 'Cierre de sesión', 'read': 'Consulta', 'asignó': 'Asignó',
    'desasignó': 'Desasignó', 'restauró': 'Restauró', 'cambio de contraseña': 'Contraseña',
  };
  const entityMap = {
    'projects': 'Proyectos', 'clients': 'Clientes', 'users': 'Usuarios', 'mixers': 'Mixers', 
    'drivers': 'Choferes', 'audit_log': 'Auditoría', 'roles': 'Roles', 'config': 'Configuración',
  };

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  
  const handleClearFilters = () => {
    setFilters({ query: '', from: '', to: '', action_type: '', entity: '' });
    setDate({});
  };

  // Función para determinar el color del Badge de la Acción (adaptada para Dark Mode)
  const getActionBadgeColor = (actionType) => {
    switch (actionType?.toLowerCase()) {
      case 'create':
        return 'bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600'; // Verde para Creación
      case 'update':
      case 'actualizó':
      case 'cambio de contraseña':
        return 'bg-yellow-600 dark:bg-yellow-500 text-gray-900 dark:text-white hover:bg-yellow-700 dark:hover:bg-yellow-600'; // Amarillo para Actualización
      case 'delete':
        return 'bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600'; // Rojo para Eliminación
      case 'login':
        return 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'; // Azul para Inicio de Sesión
      default:
        return 'bg-gray-600 dark:bg-gray-500 text-white hover:bg-gray-700 dark:hover:bg-gray-600'; // Gris para otros
    }
  };

  return (
    // Aplica el fondo de página dual (light/dark mode)
    <div className={cn("max-w-7xl mx-auto p-6 flex flex-col gap-8 min-h-screen", PAGE_BG)} role="main">
      
      {/* Loader global - Mantenido para consistencia */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sky-500" />
          <span className="sr-only">Cargando...</span>
        </div>
      )}

      {/* Encabezado y Acciones */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Icono y color de acento */}
          <Shield className={cn("w-8 h-8", ACCENT_COLOR_TEXT)} /> 
          <div>
            <h1 className={cn("text-3xl font-bold font-headline", TEXT_PRIMARY)}>Auditoría del Sistema</h1>
            <p className={cn("text-muted-foreground", TEXT_MUTED)}>
              Registro detallado de la actividad de los Súper Usuarios.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
            {/* Botón de Limpiar y Refrescar con estilo ACCENT_BUTTON */}
            <Button onClick={handleClearFilters} className={ACCENT_BUTTON}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Limpiar Filtros
            </Button>
        </div>
      </div>

      {/* Sección de Filtros (Tarjeta de Búsqueda) */}
      <Card className={cn("mb-4", CARD_BG)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={cn("text-xl font-semibold", TEXT_PRIMARY)}>Filtros de Búsqueda</CardTitle>
              <CardDescription className={TEXT_MUTED}>Afina tu búsqueda por rango de fechas, usuario, acción o entidad.</CardDescription>
            </div>
            <Filter className={cn("h-5 w-5", ACCENT_COLOR_TEXT)}/>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 pt-2">
          
          {/* Selector de Rango de Fechas */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                // Aplicamos TEXT_PRIMARY y TEXT_MUTED al botón de fecha
                className={cn("w-[300px] justify-start text-left font-normal border dark:border-slate-600", TEXT_PRIMARY, date ? "" : TEXT_MUTED)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y", { locale: es })} -{" "}
                      {format(date.to, "LLL dd, y", { locale: es })}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y", { locale: es })
                  )
                ) : (
                  <span>Selecciona un rango de fechas</span>
                )}
              </Button>
            </PopoverTrigger>
            {/* Popover Content (Calendar) */}
            <PopoverContent className={cn("w-auto p-0", CARD_BG)} align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={es}
                // Asegura la visibilidad de los elementos del calendario en modo oscuro
                className="[&_button:hover:not([disabled])]:bg-sky-500/30 [&_.rdp-day_selected]:bg-sky-600 [&_.rdp-caption]:text-gray-100 [&_.rdp-head_cell]:text-gray-400 dark:text-white"
              />
            </PopoverContent>
          </Popover>
          
          {/* Campo de Búsqueda General */}
          <div className="relative">
            <Search className={cn("absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4", TEXT_MUTED)} />
            <Input
              placeholder="Buscar por usuario o descripción..."
              value={filters.query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(f => ({ ...f, query: e.target.value }))}
              // Adaptamos el input para light/dark mode
              className={cn("w-72 pl-10 border dark:border-slate-600", CARD_BG, TEXT_PRIMARY, "focus-visible:ring-sky-500")}
            />
          </div>

          {/* Filtro de Acción */}
          <Input
            placeholder="Acción (creación, login, etc)"
            value={filters.action_type}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(f => ({ ...f, action_type: e.target.value }))}
            className={cn("w-48 border dark:border-slate-600", CARD_BG, TEXT_PRIMARY, "focus-visible:ring-sky-500")}
          />
          
          {/* Filtro de Entidad */}
          <Input
            placeholder="Entidad (proyectos, clientes, etc)"
            value={filters.entity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(f => ({ ...f, entity: e.target.value }))}
            className={cn("w-48 border dark:border-slate-600", CARD_BG, TEXT_PRIMARY, "focus-visible:ring-sky-500")}
          />
          
        </CardContent>
      </Card>
      
      {/* Sección de la Tabla de Logs */}
      <Card className={CARD_BG}>
        <CardHeader>
          <CardTitle className={cn("text-xl font-semibold", TEXT_PRIMARY)}>Registros de Auditoría</CardTitle>
          <CardDescription className={TEXT_MUTED}>
              Mostrando <strong className="font-semibold">{logs.length}</strong> de {logs.length} registros (ajustados por filtros).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              {/* Encabezado de la tabla SIN columna de IP */}
              <TableHeader>
                <TableRow className={TABLE_HEADER_BG}>
                  <TableHead className={cn("font-semibold", TEXT_PRIMARY, "min-w-[150px]")}>Fecha</TableHead>
                  <TableHead className={cn("font-semibold", TEXT_PRIMARY, "min-w-[180px]")}>Usuario</TableHead>
                  <TableHead className={cn("font-semibold", TEXT_PRIMARY, "min-w-[120px]")}>Acción</TableHead>
                  <TableHead className={cn("font-semibold", TEXT_PRIMARY, "min-w-[120px]")}>Entidad</TableHead>
                  <TableHead className={cn("font-semibold", TEXT_PRIMARY, "min-w-[100px]")}>ID Entidad</TableHead>
                  <TableHead className={cn("font-semibold", TEXT_PRIMARY, "min-w-[300px]")}>Descripción</TableHead>
                  {/* COLUMNA 'IP' ELIMINADA */}
                </TableRow>
              </TableHeader>
              
              {/* Cuerpo de la tabla */}
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className={cn("text-center py-8 text-xl font-medium", ACCENT_COLOR_TEXT)}>Cargando registros... ⏳</TableCell></TableRow>
                ) : logs.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className={cn("text-center py-8 text-xl font-medium", TEXT_MUTED)}>No se encontraron registros que coincidan con los filtros. 🧐</TableCell></TableRow>
                ) : logs.map(log => (
                  <TableRow key={log.id} className={TABLE_ROW_HOVER}>
                    
                    {/* Fecha */}
                    <TableCell className={cn("text-sm font-medium whitespace-nowrap", TEXT_PRIMARY)}>
                      {new Date(log.created_at).toLocaleString('es-ES', { 
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </TableCell>
                    
                    {/* Usuario (Formato de dos líneas) */}
                    <TableCell>
                      <div className="flex flex-col">
                          <span className={cn("font-semibold", TEXT_PRIMARY)}>{log.username || 'Sistema'}</span>
                          <span className={cn("text-xs", TEXT_MUTED)}>{log.user_id || 'N/A'}</span>
                      </div>
                    </TableCell>
                    
                    {/* Acción (Badge de color semántico) */}
                    <TableCell>
                      <Badge className={`text-xs font-bold border-none shadow-sm px-3 py-1 ${getActionBadgeColor(log.action_type)}`}>
                        {actionMap[log.action_type?.toLowerCase()] || capitalize(log.action_type)}
                      </Badge>
                    </TableCell>
                    
                    {/* Entidad (Color de acento para destacar) */}
                    <TableCell className={cn("font-semibold", ACCENT_COLOR_TEXT)}>
                      {entityMap[log.entity?.toLowerCase()] || capitalize(log.entity)}
                    </TableCell>
                    
                    {/* ID Entidad */}
                    <TableCell className={cn("font-mono text-xs", TEXT_MUTED)}>{log.entity_id || 'N/A'}</TableCell>
                    
                    {/* Descripción */}
                    <TableCell className={cn("text-sm max-w-sm whitespace-normal", TEXT_MUTED)}>{log.description}</TableCell>
                    
                    {/* CELDA 'IP' ELIMINADA */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}