'use client';

import * as React from 'react';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { PlusCircle, FilePen, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAppData } from '@/context/app-data-context';
import type { Client } from '@/lib/data';
import { ClientForm, ClientSchema } from '@/components/client-form';
import { z } from 'zod';
import { useSearch } from '@/context/search-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils'; // Asegúrate de importar cn


// --- PALETA DE COLORES Y CLASES MODERNAS ---
const ACCENT_COLOR_TEXT = 'text-sky-600 dark:text-sky-400';
// Botón principal de acción
const ACCENT_BUTTON = 'bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600';
// Fondo de la página
const PAGE_BG = 'bg-gray-50 dark:bg-slate-900';
// Tarjeta principal de la tabla
const CARD_BG = 'bg-white dark:bg-slate-800 shadow-xl dark:border dark:border-slate-700';
// Texto general mutado
const TEXT_MUTED = 'text-gray-500 dark:text-slate-400';


// Página profesional de gestión de clientes con UX, accesibilidad y rendimiento mejorados
export default function ClientesPage() {
  const { clients, createClient, updateClient, deleteClient } = useAppData();
  const { searchQuery } = useSearch();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Accesibilidad: enfocar el primer input del modal
  const formRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isFormOpen && formRef.current) {
      const input = formRef.current.querySelector('input,select,textarea,button');
      if (input) (input as HTMLElement).focus();
    }
  }, [isFormOpen]);

  // Manejo profesional de formularios con loader y mensajes accesibles
  const handleFormSubmit = async (data: z.infer<typeof ClientSchema>) => {
    setLoading(true);
    try {
      if (editingClient) {
        await updateClient(editingClient.id, data);
        toast({ title: "Cliente Actualizado", description: "El cliente ha sido actualizado correctamente.", duration: 3500 });
      } else {
        await createClient(data);
        toast({ title: "Cliente Creado", description: "El nuevo cliente ha sido añadido exitosamente.", duration: 3500 });
      }
      setIsFormOpen(false);
      setEditingClient(null);
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: `No se pudo guardar el cliente: ${error instanceof Error ? error.message : 'Error desconocido'}` });
    } finally {
      setLoading(false);
    }
  };

  // Soft delete preparado para futura integración
  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteClient(id);
      toast({ title: "Cliente Eliminado", description: "El cliente ha sido eliminado correctamente.", duration: 3500 });
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: `No se pudo eliminar el cliente: ${error instanceof Error ? error.message : 'Error desconocido'}` });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = useCallback((client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  }, []);

  const openCreateDialog = useCallback(() => {
    setEditingClient(null);
    setIsFormOpen(true);
  }, []);

  // Filtro y paginación profesional
  const filteredClients = useMemo(() => {
    if (!clients) return [];
    if (!searchQuery) return clients;
    const lowercasedQuery = searchQuery.toLowerCase();
    return clients.filter(client =>
      client.name.toLowerCase().includes(lowercasedQuery) ||
      client.contact.toLowerCase().includes(lowercasedQuery) ||
      client.email.toLowerCase().includes(lowercasedQuery) ||
      client.phone.toLowerCase().includes(lowercasedQuery) ||
      client.address.toLowerCase().includes(lowercasedQuery)
    );
  }, [clients, searchQuery]);

  // Paginación profesional
  const paginatedClients = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredClients.slice(start, start + rowsPerPage);
  }, [filteredClients, page, rowsPerPage]);

  // Accesibilidad: paginación ARIA
  const totalPages = Math.ceil(filteredClients.length / rowsPerPage) || 1;
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  };


  return (
    // CAMBIO 1: Fondo de página para Dual-Theme
    <div className={cn("flex flex-col gap-10 p-6 sm:p-8 min-h-screen", PAGE_BG)} aria-label="Gestión de Clientes" role="main">
      
      {/* Loader global (Aseguramos color del loader con blue-500) */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/60" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sky-500" />
          <span className="sr-only">Cargando...</span>
        </div>
      )}
      
      {/* Encabezado y Botón de Acción */}
      <div className="flex items-center justify-between">
        <div>
          {/* Título principal con color de texto ajustado */}
          <h1 className="text-3xl font-bold font-headline text-gray-900 dark:text-white">Clientes</h1>
          <p className={cn("text-muted-foreground", TEXT_MUTED)}>
            Gestiona la información de los clientes de la empresa.
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            {/* CAMBIO 2: Botón de acción principal con color celeste oscuro */}
            <Button onClick={openCreateDialog} aria-label="Añadir Cliente" className={ACCENT_BUTTON}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Cliente
            </Button>
          </DialogTrigger>
          {/* Los estilos de DialogContent dependen de tus componentes globales (Shadcn), por lo que se mantienen */}
          <DialogContent className="max-h-[90vh] overflow-y-auto" ref={formRef} aria-modal="true" role="dialog">
            <DialogHeader>
              <DialogTitle>{editingClient ? 'Editar Cliente' : 'Añadir Cliente'}</DialogTitle>
            </DialogHeader>
            <ClientForm
              onSubmit={handleFormSubmit}
              defaultValues={editingClient}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingClient(null);
              }}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabla de Clientes */}
      {/* CAMBIO 3: Estilos de tarjeta modernos para la tabla */}
      <Card className={CARD_BG}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Lista de Clientes</CardTitle>
              <CardDescription className={TEXT_MUTED}>
                Mostrando {filteredClients.length} de {clients?.length || 0} clientes registrados.
              </CardDescription>
            </div>
            
            {/* Paginación y control de filas por página */}
            <div className="flex items-center gap-2" role="navigation" aria-label="Paginación">
              <label htmlFor="rowsPerPage" className={cn("text-sm mr-2", TEXT_MUTED)}>Filas por página:</label>
              <select
                id="rowsPerPage"
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                // CAMBIO 4: Estilos modernos para el selector
                className="border rounded-lg px-2 py-1 text-sm bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                aria-label="Filas por página"
              >
                {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                aria-label="Página anterior"
                className="hover:bg-gray-100 dark:hover:bg-slate-700 border-gray-200 dark:border-slate-700"
              >
                {'<'}
              </Button>
              <span className={cn("text-sm", TEXT_MUTED)}>Página {page} de {totalPages}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                aria-label="Página siguiente"
                className="hover:bg-gray-100 dark:hover:bg-slate-700 border-gray-200 dark:border-slate-700"
              >
                {'>'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {/* CAMBIO 5: Estilos de tabla mejorados */}
            <Table aria-label="Tabla de clientes" className="w-full">
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <TableHead className="w-[50px] font-semibold text-gray-700 dark:text-slate-200">Cod.</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-slate-200">Nombre</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-slate-200">Contacto</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-slate-200">Correo</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-slate-200">Teléfono</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-slate-200">Dirección</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-slate-200">Observaciones</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700 dark:text-slate-200 w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClients.map((client, index) => (
                  // Añadimos hover para legibilidad
                  <TableRow 
                    key={client.id} 
                    tabIndex={0} 
                    aria-label={`Cliente ${client.name}`}
                    className="border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <TableCell className="font-normal text-gray-600 dark:text-slate-300">{(page - 1) * rowsPerPage + index + 1}</TableCell>
                    <TableCell className="font-medium text-gray-900 dark:text-white">{client.name}</TableCell>
                    <TableCell className="text-gray-600 dark:text-slate-300">{client.contact}</TableCell>
                    <TableCell className="text-gray-600 dark:text-slate-300">{client.email}</TableCell>
                    <TableCell className="text-gray-600 dark:text-slate-300">{client.phone}</TableCell>
                    <TableCell className="text-gray-600 dark:text-slate-300">{client.address}</TableCell>
                    <TableCell className="text-gray-600 dark:text-slate-300">{client.notes}</TableCell>
                    <TableCell className="text-right">
                      {/* Ícono de Editar con color celeste */}
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(client)} aria-label={`Editar ${client.name}`} className={cn("text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 hover:bg-gray-100 dark:hover:bg-slate-700")}>
                        <FilePen className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          {/* Ícono de Eliminar con color destructivo (Rojo) */}
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700" aria-label={`Eliminar ${client.name}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        {/* El diálogo de alerta usa el tema de Shadcn y se ve bien */}
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              ¿Estás seguro de que quieres eliminar este cliente?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente al cliente <strong>{client.name}</strong>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            {/* Botón de acción con color destructivo (Rojo) */}
                            <AlertDialogAction onClick={() => handleDelete(client.id)} className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600">
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedClients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500 dark:text-slate-400">
                      No se encontraron clientes que coincidan con la búsqueda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}