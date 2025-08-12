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
import { PlusCircle, FilePen, Trash2 } from 'lucide-react';
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
        // Si hay error (ej: placa duplicada), no cerrar el formulario y mostrar el error en el campo
        return false;
      }
      toast({ title: "Mixer Actualizado", description: "El mixer ha sido actualizado." });
      setIsFormOpen(false);
      setEditingMixer(null);
      return true;
    } else {
      result = await createMixer(data);
      if (result && result.error) {
        // Si hay error (ej: placa duplicada), no cerrar el formulario y mostrar el error en el campo
        return false;
      }
      toast({ title: "Mixer Creado", description: "El nuevo mixer ha sido añadido." });
      setIsFormOpen(false);
      setEditingMixer(null);
      return true;
    }
  };

  const handleDelete = (id: string) => {
    try {
      deleteMixer(id);
      toast({ title: "Mixer Eliminado", description: "El mixer ha sido eliminado." });
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
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Mixers</h1>
          <p className="text-muted-foreground">
            Gestiona la flota de mixers de la empresa.
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
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

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Lista de Mixers</CardTitle>
          <CardDescription>
            Mostrando {filteredMixers.length} de {mixers?.length || 0} mixers registrados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cod.</TableHead>
                <TableHead>Alias</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead>Capacidad (M³)</TableHead>
                <TableHead>Observaciones</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMixers.map((mixer) => (
                <TableRow key={mixer.id ?? mixer.plate}>
                  <TableCell className="font-medium">{mixer.internal_code || mixer.id || mixer.plate}</TableCell>
                  <TableCell>{mixer.alias}</TableCell>
                  <TableCell>{mixer.plate}</TableCell>
                  <TableCell>{mixer.capacity_m3} m³</TableCell>
                  <TableCell>{mixer.notes}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(mixer)}>
                      <FilePen className="h-4 w-4" />
                    </Button>
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro de que quieres eliminar este mixer?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el mixer con placa <strong>{mixer.plate}</strong>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(mixer.id)} className="bg-destructive hover:bg-destructive/90">
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
