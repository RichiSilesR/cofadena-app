'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useAppData } from '@/context/app-data-context';
import { FileDown, Calendar as CalendarIcon, Filter, FileText, Trash2, Info } from "lucide-react"; 
import { DateRange } from 'react-day-picker';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/context/auth-context';
import { useSearch } from '@/context/search-context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export default function ReportesPage() {
  const { user } = useAuth();
  const { reports, projects } = useAppData();
  const { searchQuery } = useSearch();
  const [date, setDate] = React.useState<DateRange | undefined>();
  const [selectedProject, setSelectedProject] = React.useState('todos');
  const [selectedType, setSelectedType] = React.useState('todos');

  const filteredReports = React.useMemo(() => {
    if (!reports) return [];
    let results = reports;

    // Filter by search query
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      results = results.filter(report =>
        report.id?.toLowerCase().includes(lowercasedQuery) ||
        report.project_name?.toLowerCase().includes(lowercasedQuery) ||
        report.submitted_by?.toLowerCase().includes(lowercasedQuery) ||
        report.type?.toLowerCase().includes(lowercasedQuery) ||
        report.date?.toLowerCase().includes(lowercasedQuery) ||
        report.client?.toLowerCase().includes(lowercasedQuery) ||
        report.mixer?.toLowerCase().includes(lowercasedQuery) ||
        report.driver?.toLowerCase().includes(lowercasedQuery) ||
        report.notes?.toLowerCase().includes(lowercasedQuery)
      );
    }
    
    // Date filter
    results = results.filter(report => {
      if (!date?.from || !report.date) return true;
      const reportDate = parseISO(report.date); 
      const fromDate = new Date(date.from.setHours(0, 0, 0, 0));
      const toDate = date.to ? new Date(date.to.setHours(23, 59, 59, 999)) : new Date(date.from.setHours(23, 59, 59, 999));

      return reportDate >= fromDate && reportDate <= toDate;
    });

    // Project filter profesional: usar el id del proyecto
    if (selectedProject !== 'todos') {
      results = results.filter(report => String(report.project_id) === selectedProject); 
    }

    // Type filter
    if (selectedType !== 'todos') {
      results = results.filter(report => report.type === selectedType);
    }

    return results;
  }, [date, selectedProject, selectedType, searchQuery, reports]);


  const handleExportCSV = () => {
    // EXPORTACION CSV CON TODOS LOS CAMPOS
    const customHeaders = [
        "ID Reporte",
        "Fecha y Hora", 
        "Cliente", 
        "Proyecto", 
        "Mixer", 
        "Chofer", 
        "Árido 1 (KG)", 
        "Árido 2 (KG)", 
        "Árido 3 (KG)", 
        "Notas", 
        "Reportado Por", 
        "Tipo"
    ];

    const formattedData = filteredReports.map(report => ({
        "ID Reporte": report.id,
        "Fecha y Hora": report.date ? format(parseISO(report.date), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A', 
        "Cliente": report.client || 'N/A', 
        "Proyecto": report.project || report.project_name || 'N/A', 
        "Mixer": report.mixer || 'N/A', 
        "Chofer": report.driver || 'N/A', 
        "Árido 1 (KG)": report.arido1 ?? 0,
        "Árido 2 (KG)": report.arido2 ?? 0,
        "Árido 3 (KG)": report.arido3 ?? 0,
        "Notas": report.notes || '', 
        "Reportado Por": report.submitted_by || 'N/A',
        "Tipo": report.type || 'N/A'
    }));

    const BOM = "\uFEFF"; 
    const csv = Papa.unparse(formattedData, {
      header: true,
      delimiter: ";", 
      columns: customHeaders 
    });
    
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_COFADENA_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    
    doc.text("Reporte de Producción - COFADENA", 14, 20);
    doc.setFontSize(12);
    doc.text(`Fecha de Exportación: ${new Date().toLocaleDateString('es-ES')}`, 14, 28);

    // EXPORTACION PDF CON TODOS LOS CAMPOS
    const pdfHeaders = [
        'ID', 
        'Fecha', 
        'Cliente', 
        'Proyecto', 
        'Mixer', 
        'Chofer', 
        'A1', 
        'A2', 
        'A3', 
        'Tipo'
    ];
    
    doc.autoTable({
      startY: 35,
      head: [pdfHeaders],
      body: filteredReports.map(r => [
          r.id, 
          r.date ? format(parseISO(r.date), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A',
          r.client || 'N/A',
          r.project || r.project_name || 'N/A',
          r.mixer || 'N/A',
          r.driver || 'N/A',
          r.arido1 ?? 0,
          r.arido2 ?? 0,
          r.arido3 ?? 0,
          r.type || 'N/A'
      ]),
      headStyles: { fillColor: [52, 73, 94], fontSize: 8 }, 
      bodyStyles: { fontSize: 8 },
      columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 22 },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 18 },
          5: { cellWidth: 18 },
          6: { cellWidth: 8 },
          7: { cellWidth: 8 },
          8: { cellWidth: 8 },
          9: { cellWidth: 10 },
      },
    });
    
    // Listado de notas en una página aparte
    const reportsWithNotes = filteredReports.filter(r => r.notes);
    if (reportsWithNotes.length > 0) {
        doc.addPage();
        doc.text("Notas Adicionales de Reportes", 14, 20);
        doc.autoTable({
            startY: 25,
            head: [['ID', 'Fecha', 'Notas']],
            body: reportsWithNotes.map(r => [
                r.id,
                r.date ? format(parseISO(r.date), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A',
                r.notes
            ]),
            headStyles: { fillColor: [52, 73, 94], fontSize: 10 },
            bodyStyles: { fontSize: 9, cellPadding: 2 },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 40 },
                2: { cellWidth: 'auto' },
            }
        });
    }

    doc.save(`reporte_produccion_COFADENA_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const canManage = user?.role === 'Super Usuario' || user?.role === 'Administrador' || user?.role === 'Supervisor';

  return (
    <TooltipProvider>
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Gestión de Reportes</h1>
          <p className="text-muted-foreground">
            Visualiza, genera y gestiona todos los reportes de producción.
          </p>
        </div>
        <div className="flex gap-2">
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
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                <CardTitle>Filtros de Búsqueda</CardTitle>
                <CardDescription>Afina tu búsqueda de reportes.</CardDescription>
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
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Filtrar por proyecto..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los proyectos</SelectItem>
              {projects && projects.length > 0 ? (
                projects.map(p => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.project_name} <span className="text-xs text-muted-foreground">({p.client_name})</span>
                  </SelectItem>
                ))
              ) : (
                <div className="px-4 py-2 text-muted-foreground text-sm">No hay proyectos registrados</div>
              )}
            </SelectContent>
          </Select>
           <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Filtrar por tipo..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              <SelectItem value="Diario">Diario</SelectItem>
              <SelectItem value="Semanal">Semanal</SelectItem>
              <SelectItem value="Mensual">Mensual</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Lista de Reportes</CardTitle>
          <CardDescription>
            Mostrando {filteredReports.length} de {reports?.length || 0} reportes que cumplen con los filtros.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente/Proyecto</TableHead> 
                <TableHead>Mixer/Chofer</TableHead> 
                <TableHead className="text-right">Áridos (KG)</TableHead> 
                <TableHead>Tipo/Notas</TableHead>
                {canManage && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.id}</TableCell>
                  <TableCell>{report.date ? format(parseISO(report.date), 'dd/MM/yy HH:mm', { locale: es }) : 'N/A'}</TableCell>
                  <TableCell>
                        <div className='font-semibold'>{report.client || 'N/A'}</div>
                        <div className='text-xs text-muted-foreground'>{report.project || report.project_name || 'N/A'}</div>
                    </TableCell>
                  <TableCell>
                        <div className='font-semibold'>{report.mixer || 'N/A'}</div>
                        <div className='text-xs text-muted-foreground'>{report.driver || 'N/A'}</div>
                    </TableCell>
                  <TableCell className='text-right'>
                        <div>A1: {report.arido1 ?? 0} KG</div>
                        <div>A2: {report.arido2 ?? 0} KG</div>
                        <div>A3: {report.arido3 ?? 0} KG</div>
                    </TableCell>
                  <TableCell>
                    <Badge variant="outline" className='mb-1'>{report.type || 'N/A'}</Badge>
                    {report.notes && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className='h-4 w-4 ml-2 inline-block text-sky-500 cursor-help'/>
                            </TooltipTrigger>
                            <TooltipContent className='max-w-xs'>
                                <p className='font-bold'>Notas:</p>
                                <p>{report.notes}</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            disabled
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              ¿Estás seguro de que quieres eliminar este reporte?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente el reporte <strong>{report.id}</strong>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
}