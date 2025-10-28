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
import { Button } from '@/components/ui/button';
import { PlusCircle, FilePen, Trash2, Truck } from 'lucide-react'; // Agregamos el ícono Truck para mejor estética
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAppData } from '@/context/app-data-context';
import type { Mixer } from '@/lib/data';
import { MixerForm, MixerSchema } from '@/components/mixer-form';
import { z } from 'zod';
import { useSearch } from '@/context/search-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils'; // Asegúrate de importar cn


// --- PALETA DE COLORES Y CLASES MODERNAS ---
// Clase para texto de acento (Celeste Oscuro / Celeste Claro)
const ACCENT_COLOR_TEXT = 'text-sky-600 dark:text-sky-400';
// Botón principal de acción
const ACCENT_BUTTON = 'bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600';
// Fondo de la página
const PAGE_BG = 'bg-gray-50 dark:bg-slate-900';
// Tarjeta principal de la tabla
const CARD_BG = 'bg-white dark:bg-slate-800 shadow-xl dark:border dark:border-slate-700';
// Texto general mutado
const TEXT_MUTED = 'text-gray-500 dark:text-slate-400';


export default function MixersPage() {
  const { mixers, createMixer, updateMixer, deleteMixer } = useAppData();
  const { searchQuery } = useSearch();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingMixer, setEditingMixer] = React.useState<Mixer | null>(null);

  const handleFormSubmit = async (data: z.infer<typeof MixerSchema>) => {
    let result;
    if (editingMixer) {
      result = await updateMixer(editingMixer.id, data);
      if (result && result.error) {
        return false;
      }
      toast({ title: "Mixer Actualizado", description: "El mixer ha sido actualizado exitosamente." });
      setIsFormOpen(false);
      setEditingMixer(null);
      return true;
    } else {
      result = await createMixer(data);
      if (result && result.error) {
        return false;
      }
      toast({ title: "Mixer Creado", description: "El nuevo mixer ha sido añadido a la flota." });
      setIsFormOpen(false);
      setEditingMixer(null);
      return true;
    }
  };

  const handleDelete = (id: string) => {
    try {
      deleteMixer(id);
      toast({ title: "Mixer Eliminado", description: "El mixer ha sido eliminado de la flota." });
    } catch (error) {
       toast({ variant: 'destructive', title: "Error", description: `No se pudo eliminar el mixer: ${error instanceof Error ? error.message : 'Error desconocido'}` });
    }
  };
  
  const openEditDialog = (mixer: Mixer) => {
    setEditingMixer(mixer);
    setIsFormOpen(true);
  }

  const openCreateDialog = () => {
    setEditingMixer(null);
    setIsFormOpen(true);
  }

  const filteredMixers = React.useMemo(() => {
    if (!mixers) return [];
    if (!searchQuery) return mixers;
    const lowercasedQuery = searchQuery.toLowerCase();
    return mixers.filter(mixer =>
      mixer.alias.toLowerCase().includes(lowercasedQuery) ||
      mixer.plate.toLowerCase().includes(lowercasedQuery) ||
      mixer.capacity_m3.toString().toLowerCase().includes(lowercasedQuery)
    );
  }, [mixers, searchQuery]);

  return (
    // CAMBIO 1: Fondo de página para Dual-Theme
    <div className={cn("flex flex-col gap-10 p-6 sm:p-8 min-h-screen", PAGE_BG)} aria-label="Gestión de Mixers" role="main">
      
      {/* Encabezado y Botón de Acción */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            {/* Ícono grande para darle un toque visual */}
            <Truck className={cn("w-8 h-8", ACCENT_COLOR_TEXT)} /> 
            <div>
                {/* Título principal con color de texto ajustado */}
                <h1 className="text-3xl font-bold font-headline text-gray-900 dark:text-white">Mixers</h1>
                <p className={cn("text-muted-foreground", TEXT_MUTED)}>
                    Gestiona la flota de mixers de la empresa.
                </p>
            </div>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            {/* CAMBIO 2: Botón de acción principal con color celeste oscuro */}
            <Button onClick={openCreateDialog} className={ACCENT_BUTTON}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Mixer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMixer ? 'Editar Mixer' : 'Añadir Mixer'}</DialogTitle>
            </DialogHeader>
            <MixerForm
              onSubmit={async (data) => {
                const ok = await handleFormSubmit(data);
                // Solo cerrar si ok es true
                if (ok) {
                  setIsFormOpen(false);
                  setEditingMixer(null);
                }
              }}
              defaultValues={editingMixer}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingMixer(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabla de Mixers */}
      {/* CAMBIO 3: Estilos de tarjeta modernos para la tabla */}
      <Card className={CARD_BG}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Lista de Mixers</CardTitle>
          <CardDescription className={TEXT_MUTED}>
            Mostrando {filteredMixers.length} de {mixers?.length || 0} mixers registrados.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {/* CAMBIO 4: Estilos de tabla mejorados */}
            <Table aria-label="Tabla de mixers">
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <TableHead className="w-[80px] font-semibold text-gray-700 dark:text-slate-200">Cod.</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-slate-200">Alias</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-slate-200">Placa</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-slate-200">Capacidad (M³)</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-slate-200">Observaciones</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700 dark:text-slate-200 w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMixers.map((mixer) => (
                  <TableRow 
                    key={mixer.id ?? mixer.plate}
                    className="border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <TableCell className="font-normal text-gray-600 dark:text-slate-300">{mixer.internal_code || 'N/A'}</TableCell>
                    <TableCell className="font-medium text-gray-900 dark:text-white">{mixer.alias}</TableCell>
                    <TableCell className="font-mono text-gray-900 dark:text-white">{mixer.plate}</TableCell>
                    {/* CAMBIO 5: Resaltar la capacidad en color de acento */}
                    <TableCell className={cn("font-bold", ACCENT_COLOR_TEXT)}>
                      {mixer.capacity_m3} m³
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-slate-300">{mixer.notes}</TableCell>
                    <TableCell className="text-right">
                      {/* Ícono de Editar con color celeste */}
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(mixer)} className={cn("text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 hover:bg-gray-100 dark:hover:bg-slate-700")}>
                        <FilePen className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          {/* Ícono de Eliminar con color destructivo (Rojo) */}
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro de que quieres eliminar este mixer?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente el mixer **{mixer.alias}** con placa **{mixer.plate}**.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            {/* Botón de acción con color destructivo (Rojo) */}
                            <AlertDialogAction onClick={() => handleDelete(mixer.id)} className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600">
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredMixers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-slate-400">
                      No se encontraron mixers que coincidan con la búsqueda.
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