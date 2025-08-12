"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import { es } from 'date-fns/locale';
import { format, parseISO, isValid } from 'date-fns';

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

  if (!contextUser || contextUser.role !== 'Super Usuario') {
    return <div className="p-8 text-center text-lg font-bold text-red-700">Acceso restringido solo a Súper Usuarios.</div>;
  }

  // Diccionarios de traducción y capitalización
  const actionMap = {
    'create': 'Creación',
    'update': 'Actualización',
    'actualizó': 'Actualizó',
    'delete': 'Eliminación',
    'login': 'Inicio de sesión',
    'logout': 'Cierre de sesión',
    'read': 'Consulta',
    'asignó': 'Asignó',
    'desasignó': 'Desasignó',
    'restauró': 'Restauró',
    'cambio de contraseña': 'Cambio de contraseña',
    // ...agrega más si es necesario
  };
  const entityMap = {
    'projects': 'Proyectos',
    'clients': 'Clientes',
    'users': 'Usuarios',
    'mixers': 'Mixers',
    'drivers': 'Choferes',
    'audit_log': 'Auditoría',
    'roles': 'Roles',
    'config': 'Configuración',
    // ...agrega más si es necesario
  };
  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  return (
    <div className="max-w-7xl mx-auto p-6 flex flex-col gap-6">
      <h1 className="text-3xl font-bold mb-2">Auditoría del Sistema</h1>
      <Card className="shadow-lg">
        <div className="flex items-center justify-between p-4 pb-0">
          <div>
            <span className="text-xl font-semibold">Filtros de Búsqueda</span>
            <div className="text-sm text-muted-foreground">Afina tu búsqueda de auditoría por rango de fechas, palabra clave, acción o entidad.</div>
          </div>
          <Filter className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex flex-wrap gap-4 p-4 pt-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className="w-[300px] justify-start text-left font-normal"
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
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={es}
              />
            </PopoverContent>
          </Popover>
          <Input
            placeholder="Buscar usuario, acción o descripción..."
            value={filters.query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(f => ({ ...f, query: e.target.value }))}
            className="w-64"
          />
          <Input
            placeholder="Acción (creación, actualización, eliminación, etc)"
            value={filters.action_type}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(f => ({ ...f, action_type: e.target.value }))}
            className="w-40"
          />
          <Input
            placeholder="Entidad (proyectos, clientes, usuarios, etc)"
            value={filters.entity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(f => ({ ...f, entity: e.target.value }))}
            className="w-40"
          />
          <Button onClick={() => { setFilters({ query: '', from: '', to: '', action_type: '', entity: '' }); setDate({}); }} variant="outline">Limpiar</Button>
        </div>
      </Card>
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Entidad</TableHead>
              <TableHead>ID Entidad</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7}>Cargando...</TableCell></TableRow>
            ) : logs.length === 0 ? (
              <TableRow><TableCell colSpan={7}>Sin registros.</TableCell></TableRow>
            ) : logs.map(log => (
              <TableRow key={log.id}>
                <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  <Badge className="whitespace-pre-line px-3 py-1 text-base font-semibold max-w-xs break-words bg-fuchsia-500/90 text-white shadow-md border-none">
                    {log.username || log.user_id || '—'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {actionMap[log.action_type?.toLowerCase()] || capitalize(log.action_type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {entityMap[log.entity?.toLowerCase()] || capitalize(log.entity)}
                </TableCell>
                <TableCell>{log.entity_id}</TableCell>
                <TableCell>{log.description}</TableCell>
                <TableCell>{log.ip_address}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
