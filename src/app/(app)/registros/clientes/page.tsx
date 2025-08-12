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
    <div className="flex flex-col gap-8" aria-label="Gestión de Clientes" role="main">
      {/* Loader global */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500" />
          <span className="sr-only">Cargando...</span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona la información de los clientes de la empresa.
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} aria-label="Añadir Cliente">
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Cliente
            </Button>
          </DialogTrigger>
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

      {/* Paginación y tabla */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>
                Mostrando {filteredClients.length} de {clients?.length || 0} clientes registrados.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2" role="navigation" aria-label="Paginación">
              <label htmlFor="rowsPerPage" className="text-sm mr-2">Filas por página:</label>
              <select
                id="rowsPerPage"
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                className="border rounded px-2 py-1 text-sm"
                aria-label="Filas por página"
              >
                {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                aria-label="Página anterior"
              >
                {'<'}
              </Button>
              <span className="text-sm">Página {page} de {totalPages}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                aria-label="Página siguiente"
              >
                {'>'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table aria-label="Tabla de clientes">
            <TableHeader>
              <TableRow>
                <TableHead>Cod.</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Observaciones</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClients.map((client, index) => (
                <TableRow key={client.id} tabIndex={0} aria-label={`Cliente ${client.name}`}>
                  <TableCell className="font-medium">{(page - 1) * rowsPerPage + index + 1}</TableCell>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.contact}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.address}</TableCell>
                  <TableCell>{client.notes}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(client)} aria-label={`Editar ${client.name}`}>
                      <FilePen className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label={`Eliminar ${client.name}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
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
                          <AlertDialogAction onClick={() => handleDelete(client.id)} className="bg-destructive hover:bg-destructive/90">
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
