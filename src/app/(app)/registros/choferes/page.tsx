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
import { PlusCircle, FilePen, Trash2 } from 'lucide-react';
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

export default function ChoferesPage() {
  const { drivers, createDriver, updateDriver, deleteDriver } = useAppData();
  const { searchQuery } = useSearch();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingDriver, setEditingDriver] = React.useState<Driver | null>(null);

  const handleFormSubmit = async (data: z.infer<typeof DriverSchema>) => {
    try {
      if (editingDriver) {
        updateDriver(editingDriver.id, data);
        toast({ title: "Chofer Actualizado", description: "El chofer ha sido actualizado." });
      } else {
        createDriver(data);
        toast({ title: "Chofer Creado", description: "El nuevo chofer ha sido añadido." });
      }
      setIsFormOpen(false);
      setEditingDriver(null);
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: `No se pudo guardar el chofer: ${error instanceof Error ? error.message : 'Error desconocido'}` });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      deleteDriver(id);
      toast({ title: "Chofer Eliminado", description: "El chofer ha sido eliminado." });
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
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Choferes</h1>
          <p className="text-muted-foreground">
            Gestiona la información de los choferes de la empresa.
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
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

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Lista de Choferes</CardTitle>
          <CardDescription>
            Mostrando {filteredDrivers.length} de {drivers?.length || 0} choferes registrados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cod.</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Edad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers.map((driver, index) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{driver.name}</TableCell>
                  <TableCell>{driver.document}</TableCell>
                  <TableCell>{driver.age}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(driver)}>
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
                          <AlertDialogTitle>¿Estás seguro de que quieres eliminar este chofer?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente al chofer <strong>{driver.name}</strong>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(driver.id)} className="bg-destructive hover:bg-destructive/90">
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
