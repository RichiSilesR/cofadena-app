'use client';

import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, FilePen, Trash2, Calendar as CalendarIcon, Filter, FileDown, FileText, Truck, Contact } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useAppData } from '@/context/app-data-context';
import type { Project, Client, Driver, Mixer } from '@/lib/data';
import { ProjectForm, ProjectSchema } from '@/components/project-form';
import { z } from 'zod';
import { DateRange } from 'react-day-picker';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useAuth } from '@/context/auth-context';
import { useSearch } from '@/context/search-context';
import { useToast } from '@/hooks/use-toast';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

// Página profesional de gestión de proyectos con UX, accesibilidad y rendimiento mejorados
export default function ProyectosPage() {
  const { user } = useAuth();
  const { projects, clients, drivers, mixers, createProject, updateProject, deleteProject } = useAppData();
  const { searchQuery } = useSearch();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [date, setDate] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Accesibilidad: función para enfocar el primer input del modal
  const formRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (isFormOpen && formRef.current) {
      const input = formRef.current.querySelector('input,select,textarea,button');
      if (input) (input as HTMLElement).focus();
    }
  }, [isFormOpen]);

  // Memoizar para rendimiento
  const getStatusVariant = useCallback((status: string) => {
    switch (status) {
      case 'En Curso': return 'default';
      case 'Completado': return 'secondary';
      case 'En Pausa': return 'outline';
      case 'Retrasado': return 'destructive';
      default: return 'default';
    }
  }, []);


  // Manejo profesional de formularios con loader y mensajes accesibles
  const handleFormSubmit = async (data: z.infer<typeof ProjectSchema>) => {
    setLoading(true);
    try {
      const projectData = {
        ...data,
        start_date: format(data.start_date, 'yyyy-MM-dd'),
        end_date: data.end_date ? format(data.end_date, 'yyyy-MM-dd') : null,
      };
      if (editingProject) {
        await updateProject(editingProject.id, projectData);
        toast({ title: "Proyecto Actualizado", description: "El proyecto ha sido actualizado correctamente.", duration: 3500 });
      } else {
        await createProject(projectData);
        toast({ title: "Proyecto Creado", description: "El nuevo proyecto ha sido creado exitosamente.", duration: 3500 });
      }
      setIsFormOpen(false);
      setEditingProject(null);
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: `No se pudo guardar el proyecto: ${error instanceof Error ? error.message : String(error)}` });
    } finally {
      setLoading(false);
    }
  };


  // Soft delete preparado para futura integración
  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteProject(id);
      toast({ title: "Proyecto Eliminado", description: "El proyecto ha sido eliminado correctamente.", duration: 3500 });
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: `No se pudo eliminar el proyecto: ${error instanceof Error ? error.message : 'Error desconocido'}` });
    } finally {
      setLoading(false);
    }
  };


  const openEditDialog = useCallback((project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  }, []);

  const openCreateDialog = useCallback(() => {
    setEditingProject(null);
    setIsFormOpen(true);
  }, []);


  // Filtro y paginación profesional
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    let results = projects;
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      results = results.filter(project => {
        const assignedDriversData = drivers.filter(d => project.driver_ids?.includes(d.id)).map(d => d.name || '').join(' ');
        const assignedMixersData = mixers.filter(m => project.mixer_ids?.includes(m.id)).map(m => `${m.alias} ${m.plate}`).join(' ');
        return project.project_name.toLowerCase().includes(lowercasedQuery) ||
          project.client_name.toLowerCase().includes(lowercasedQuery) ||
          project.contact_name.toLowerCase().includes(lowercasedQuery) ||
          project.status.toLowerCase().includes(lowercasedQuery) ||
          project.phone.toString().toLowerCase().includes(lowercasedQuery) ||
          project.progress.toString().toLowerCase().includes(lowercasedQuery) ||
          project.start_date.toLowerCase().includes(lowercasedQuery) ||
          (project.end_date && project.end_date.toLowerCase().includes(lowercasedQuery)) ||
          assignedDriversData?.toLowerCase().includes(lowercasedQuery) ||
          assignedMixersData?.toLowerCase().includes(lowercasedQuery);
      });
    }
    results = results.filter(project => {
      if (!date?.from) return true;
      const projectDate = parseISO(project.start_date);
      if (!isValid(projectDate)) return false;
      if (date.to && project.end_date) {
        const projectEndDate = parseISO(project.end_date);
        if (!isValid(projectEndDate)) return false;
        return projectDate >= date.from && projectEndDate <= date.to;
      }
      return projectDate >= date.from && (!date.to || projectDate <= date.to);
    });
    return results;
  }, [projects, date, searchQuery, drivers, mixers]);

  // Paginación profesional
  const paginatedProjects = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredProjects.slice(start, start + rowsPerPage);
  }, [filteredProjects, page, rowsPerPage]);
  
  // Exportación profesional (solo los proyectos filtrados)
  const handleExportCSV = () => {
    const csvData = filteredProjects.map(p => {
      const assignedDrivers = drivers.filter(d => p.driver_ids?.includes(d.id)).map(d => d.name).filter(Boolean).join(', ') || '';
      const assignedMixers = mixers.filter(m => p.mixer_ids?.includes(m.id)).map(m => `${m.alias} (${m.plate})`).filter(Boolean).join(', ') || '';

      // Formateo profesional de fechas
      let fechaInicio = '';
      let fechaFin = '';
      try {
        fechaInicio = p.start_date ? (typeof p.start_date === 'string' ? p.start_date.split('T')[0] : p.start_date) : '';
      } catch { fechaInicio = ''; }
      try {
        if (p.status === 'Terminado' && p.end_date) {
          fechaFin = typeof p.end_date === 'string' ? p.end_date.split('T')[0] : p.end_date;
        } else {
          fechaFin = 'N/A';
        }
      } catch { fechaFin = 'N/A'; }
      return {
        'ID Proyecto': p.id,
        'Nombre Proyecto': p.project_name,
        'Cliente': p.client_name || '',
        'Contacto': p.contact_name || '',
        'Telefono': p.client_phone || '',
        'Fecha Inicio': fechaInicio,
        'Fecha Fin': fechaFin,
        'Estado': p.status,
        'Progreso (%)': p.progress,
        'Choferes Asignados': assignedDrivers,
        'Mixers Asignados': assignedMixers,
        'Observaciones': p.notes || '',
      };
    });

    const csv = Papa.unparse(csvData, { header: true, delimiter: ';' });
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `proyectos_COFADENA_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' }) as jsPDFWithAutoTable;
    doc.setFontSize(14);
    doc.text("Reporte de Proyectos - COFADENA", 20, 32);
    doc.setFontSize(10);
    doc.text(`Fecha de Exportación: ${new Date().toLocaleDateString('es-ES')}`, 20, 48);

    const body = filteredProjects.map((p) => {
      const assignedDrivers = drivers.filter(d => p.driver_ids?.includes(d.id)).map(d => d.name).filter(Boolean).join(', ') || '';
      const assignedMixers = mixers.filter(m => p.mixer_ids?.includes(m.id)).map(m => (m.alias + ' (' + m.plate + ')')).filter(Boolean).join(', ') || '';
      // Formato profesional de fechas (solo fecha, sin hora)
      let fechaInicio = '';
      let fechaFin = '';
      try {
        fechaInicio = p.start_date ? (typeof p.start_date === 'string' ? format(new Date(p.start_date), 'dd/MM/yyyy') : format(p.start_date, 'dd/MM/yyyy')) : '';
      } catch { fechaInicio = ''; }
      try {
        if (p.status === 'Terminado' && p.end_date) {
          fechaFin = typeof p.end_date === 'string' ? format(new Date(p.end_date), 'dd/MM/yyyy') : format(p.end_date, 'dd/MM/yyyy');
        } else if (p.end_date) {
          fechaFin = typeof p.end_date === 'string' ? format(new Date(p.end_date), 'dd/MM/yyyy') : format(p.end_date, 'dd/MM/yyyy');
        } else {
          fechaFin = 'N/A';
        }
      } catch { fechaFin = 'N/A'; }
      return [
        p.id,
        p.project_name,
        p.client_name || '',
        p.contact_name || '',
        p.client_phone || '',
        fechaInicio,
        fechaFin,
        p.status,
        (typeof p.progress === 'number' ? p.progress + '%' : p.progress || '0%'),
        assignedDrivers,
        assignedMixers,
        p.notes || ''
      ];
    });

    doc.autoTable({
      startY: 60,
      head: [[
        'ID Proyecto',
        'Nombre Proyecto',
        'Cliente',
        'Contacto',
        'Teléfono',
        'Fecha Inicio',
        'Fecha Fin',
        'Estado',
        'Progreso (%)',
        'Choferes Asignados',
        'Mixers Asignados',
        'Observaciones',
      ]],
      body: body,
      headStyles: { fillColor: [52, 73, 94], halign: 'center', valign: 'middle', fontSize: 9 },
      styles: { fontSize: 7.5, cellPadding: 2, valign: 'middle', overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 50 }, // ID
        1: { cellWidth: 80 }, // Nombre Proyecto
        2: { cellWidth: 65 }, // Cliente
        3: { cellWidth: 65 }, // Contacto
        4: { cellWidth: 50 }, // Teléfono
        5: { cellWidth: 50 }, // Fecha Inicio
        6: { cellWidth: 50 }, // Fecha Fin
        7: { cellWidth: 50 }, // Estado
        8: { cellWidth: 50 }, // Progreso
        9: { cellWidth: 80 }, // Choferes
        10: { cellWidth: 80 }, // Mixers
        11: { cellWidth: 90 }, // Observaciones
      },
      margin: { left: 10, right: 10 },
      didDrawPage: (data) => {
        // Número de página
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(`Página ${doc.internal.getCurrentPageInfo().pageNumber} de ${pageCount}`, doc.internal.pageSize.getWidth() - 80, doc.internal.pageSize.getHeight() - 10);
      }
    });
    var fecha = new Date().toISOString().split('T')[0];
    doc.save('proyectos_COFADENA_' + fecha + '.pdf');
  };

  const canManage = user?.role === 'Super Usuario' || user?.role === 'Administrador' || user?.role === 'Supervisor';

  // Accesibilidad: paginación ARIA
  const totalPages = Math.ceil(filteredProjects.length / rowsPerPage) || 1;
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  };

  // Return principal único y limpio
  return (
    <div className="flex flex-col gap-8" aria-label="Gestión de Proyectos" role="main">
      {/* Loader global */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500" />
          <span className="sr-only">Cargando...</span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className='flex gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportCSV}>
                <FileText className="mr-2 h-4 w-4" />
                Exportar como CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileText className="mr-2 h-4 w-4" />
                Exportar como PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {canManage && (
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog} aria-label="Nuevo Proyecto">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nuevo Proyecto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]" ref={formRef} aria-modal="true" role="dialog">
                <DialogHeader>
                  <DialogTitle>
                    {editingProject ? 'Editar Proyecto' : 'Añadir Nuevo Proyecto'}
                  </DialogTitle>
                </DialogHeader>
                <ProjectForm
                  onSubmit={handleFormSubmit}
                  defaultValues={editingProject}
                  onCancel={() => {
                    setIsFormOpen(false);
                    setEditingProject(null);
                  }}
                  clients={clients || []}
                  drivers={drivers || []}
                  mixers={mixers || []}
                  loading={loading}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filtros de búsqueda */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filtros de Búsqueda</CardTitle>
              <CardDescription>Afina tu búsqueda de proyectos por fecha de inicio.</CardDescription>
            </div>
            <Filter className="h-5 w-5 text-muted-foreground"/>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
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
          </div>
        </CardContent>
      </Card>

      {/* Tabla de proyectos y paginación */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Proyectos</CardTitle>
              <CardDescription>
                Mostrando {filteredProjects.length} de {projects?.length || 0} proyectos.
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
          <Table aria-label="Tabla de proyectos">
            <TableHeader>
              <TableRow>
                <TableHead>Cod.</TableHead>
                <TableHead>Cliente/Proyecto</TableHead>
                <TableHead>Fechas</TableHead>
                <TableHead>Recursos Asignados</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className='w-[150px]'>Progreso</TableHead>
                {canManage && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProjects.map((project, index) => (
                <TableRow key={project.id} tabIndex={0} aria-label={`Proyecto ${project.project_name}`}>
                  <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                  <TableCell>
                    <div className="font-medium">{project.client_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {project.project_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{
                      project.start_date
                        ? format(
                            typeof project.start_date === 'string'
                              ? new Date(project.start_date)
                              : project.start_date,
                            'dd/MM/yyyy'
                          )
                        : 'N/A'
                    }</div>
                    <div className="text-xs text-muted-foreground">
                      {project.end_date
                        ? format(
                            typeof project.end_date === 'string'
                              ? new Date(project.end_date)
                              : project.end_date,
                            'dd/MM/yyyy'
                          )
                        : 'En curso'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        {project.driver_ids?.map(driverId => {
                          const driver = drivers.find(d => d.id === driverId);
                          return driver ? (
                            <span key={driverId} className="text-xs">
                              {driver.name}
                            </span>
                          ) : null;
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Contact className="h-4 w-4 text-muted-foreground" />
                        {project.mixer_ids?.map(mixerId => {
                          const mixer = mixers.find(m => m.id === mixerId);
                          return mixer ? (
                            <span key={mixerId} className="text-xs">
                              {mixer.alias} ({mixer.plate})
                            </span>
                          ) : null;
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Progress value={project.progress} className="h-2" />
                    <span className="text-xs">{project.progress}%</span>
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Acciones">
                            <FilePen className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => openEditDialog(project)}>
                            Editar
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  ¿Estás seguro de que quieres eliminar este proyecto?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente el proyecto{' '}
                                  <strong>{project.project_name}</strong>.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(project.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
