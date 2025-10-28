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
import { Button } from '@/components/ui/button';
import { PlusCircle, FilePen, Trash2, Users } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAppData } from '@/context/app-data-context';
import type { Driver } from '@/lib/data';
import { DriverForm, DriverSchema } from '@/components/driver-form';
import { z } from 'zod';
import { useSearch } from '@/context/search-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils'; // Asegúrate de que esta importación sea correcta

// --- PALETA DE COLORES Y CLASES MODERNAS ---
const ACCENT_COLOR_TEXT = 'text-sky-600 dark:text-sky-400';
const ACCENT_BUTTON = 'bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600';
const PAGE_BG = 'bg-gray-50 dark:bg-slate-900';
const CARD_BG = 'bg-white dark:bg-slate-800 shadow-xl dark:border dark:border-slate-700';
const TEXT_MUTED = 'text-gray-500 dark:text-slate-400';


export default function ChoferesPage() {
  const { drivers, createDriver, updateDriver, deleteDriver } = useAppData();
  const { searchQuery } = useSearch();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingDriver, setEditingDriver] = React.useState<Driver | null>(null);

  const handleFormSubmit = async (data: z.infer<typeof DriverSchema>) => {
    try {
      if (editingDriver) {
        await updateDriver(editingDriver.id, data);
        toast({ title: "Chofer Actualizado", description: "El chofer ha sido actualizado exitosamente." });
      } else {
        await createDriver(data);
        toast({ title: "Chofer Creado", description: "El nuevo chofer ha sido añadido al registro." });
      }
      setIsFormOpen(false);
      setEditingDriver(null);
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: `No se pudo guardar el chofer: ${error instanceof Error ? error.message : 'Error desconocido'}` });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDriver(id);
      toast({ title: "Chofer Eliminado", description: "El chofer ha sido eliminado permanentemente." });
    } catch (error) {
       toast({ variant: 'destructive', title: "Error", description: `No se pudo eliminar el chofer: ${error instanceof Error ? error.message : 'Error desconocido'}` });
    }
  };
  
  const openEditDialog = (driver: Driver) => {
    setEditingDriver(driver);
    setIsFormOpen(true);
  }

  const openCreateDialog = () => {
    setEditingDriver(null);
    setIsFormOpen(true);
  }

  const filteredDrivers = React.useMemo(() => {
    if (!drivers) return [];
    if (!searchQuery) return drivers;
    const lowercasedQuery = searchQuery.toLowerCase();
    return drivers.filter(driver =>
      driver.name.toLowerCase().includes(lowercasedQuery) ||
      driver.document.toLowerCase().includes(lowercasedQuery) ||
      driver.age.toString().includes(lowercasedQuery)
    );
  }, [drivers, searchQuery]);

  return (
    <div className={cn("flex flex-col gap-10 p-6 sm:p-8 min-h-screen", PAGE_BG)} aria-label="Gestión de Choferes" role="main">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className={cn("w-8 h-8", ACCENT_COLOR_TEXT)} /> 
          <div>
            <h1 className="text-3xl font-bold font-headline text-gray-900 dark:text-white">Choferes</h1>
            <p className={cn("text-muted-foreground", TEXT_MUTED)}>
              Gestiona la información del personal de conducción de la empresa.
            </p>
          </div>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className={ACCENT_BUTTON}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Chofer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingDriver ? 'Editar Chofer' : 'Añadir Chofer'}</DialogTitle>
            </DialogHeader>
            <DriverForm
              onSubmit={handleFormSubmit}
              defaultValues={editingDriver}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingDriver(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className={CARD_BG}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Lista de Choferes</CardTitle>
          <CardDescription className={TEXT_MUTED}>
            Mostrando{' '}
             <strong className="font-bold">{filteredDrivers.length}</strong> 
             {' '}de {drivers?.length || 0} choferes registrados.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table aria-label="Tabla de choferes">
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <TableHead className="w-[80px] font-semibold text-gray-700 dark:text-slate-200">Cod.</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-slate-200">Nombre</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-slate-200">Documento</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-slate-200">Edad</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700 dark:text-slate-200 w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map((driver, index) => (
                  <TableRow 
                    key={driver.id}
                    className="border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <TableCell className="font-normal text-gray-600 dark:text-slate-300">{index + 1}</TableCell>
                    <TableCell className="font-medium text-gray-900 dark:text-white">{driver.name}</TableCell>
                    <TableCell className="font-mono text-gray-600 dark:text-slate-300">{driver.document}</TableCell>
                    <TableCell className="font-semibold text-gray-700 dark:text-slate-200">{driver.age} años</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(driver)} className={cn("text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 hover:bg-gray-100 dark:hover:bg-slate-700")}>
                        <FilePen className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro de que quieres eliminar este chofer?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente al chofer **{driver.name}** con documento **{driver.document}**.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(driver.id)} className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600">
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredDrivers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-slate-400">
                      No se encontraron choferes que coincidan con la búsqueda.
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