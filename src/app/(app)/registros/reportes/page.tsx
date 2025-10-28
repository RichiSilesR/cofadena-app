"use client";

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAppData } from '@/context/app-data-context';

const PAGE_BG = 'bg-gray-50 dark:bg-slate-900';
const CARD_BG = 'bg-white dark:bg-slate-800 shadow-xl dark:border dark:border-slate-700';
const TEXT_PRIMARY = 'text-gray-900 dark:text-white';
const TEXT_MUTED = 'text-gray-500 dark:text-slate-400';

export default function ReportesPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
  const [hourFrom, setHourFrom] = useState('');
  const [hourTo, setHourTo] = useState('');

  const buscarReports = async () => {
    const params = new URLSearchParams();
    if (dateRange.from) params.set('from', dateRange.from);
    if (dateRange.to) params.set('to', dateRange.to);
    // filtros adicionales por cliente/proyecto no están implementados en el endpoint de ejemplo
    // Combinar horas con las fechas seleccionadas
      if (dateRange.from && !dateRange.to) {
        // Usuario seleccionó un solo día -> por defecto buscamos solo ese día
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.from);
        if (hourFrom) {
          const [h, m] = hourFrom.split(':').map(Number);
          fromDate.setHours(h || 0, m || 0, 0, 0);
        } else {
          fromDate.setHours(0, 0, 0, 0);
        }
        if (hourTo) {
          const [h, m] = hourTo.split(':').map(Number);
          toDate.setHours(h || 23, m || 59, 59, 999);
        } else {
          toDate.setHours(23, 59, 59, 999);
        }
        params.set('from', fromDate.toISOString());
        params.set('to', toDate.toISOString());
      } else {
        if (dateRange.from) {
          const fromDate = new Date(dateRange.from);
          if (hourFrom) {
            const [h, m] = hourFrom.split(':').map(Number);
            fromDate.setHours(h || 0, m || 0, 0, 0);
          }
          params.set('from', fromDate.toISOString());
        }
        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          if (hourTo) {
            const [h, m] = hourTo.split(':').map(Number);
            toDate.setHours(h || 23, m || 59, 59, 999);
          } else {
            // default to end of day
            toDate.setHours(23, 59, 59, 999);
          }
          params.set('to', toDate.toISOString());
        }
      }

    const res = await fetch(`/api/reports?${params.toString()}`);
    const json = await res.json();
    setReports(json.data || []);
  };

  // Helper: carga una imagen desde /images y la convierte a dataURL (JPEG/PNG según corresponda)
  const fetchImageAsDataURL = async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('No se pudo cargar la imagen');
      const blob = await res.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn('fetchImageAsDataURL failed', err);
      return null;
    }
  };

  // Export CSV optimizado para abrir directamente en Excel:
  // - Cabecera en la primera fila
  // - Delimitador ';', BOM UTF-8
  // - Aridos con 2 decimales
  // - Hora prefijada con apostrofe para evitar '####'
  const exportCSV = () => {
    if (!reports || reports.length === 0) return;

    const header = [ 'Fecha', 'Hora', 'Arido 1', 'Arido 2', 'Arido 3', 'Cliente', 'Proyecto', 'Mixer', 'Chofer', 'Observaciones' ];

    const body = reports.map(r => {
      const fecha = new Date(r.occurred_at);
      const fechaTexto = fecha.toLocaleDateString();
      const hora = fecha.toLocaleTimeString([], { hour12: false });
      const horaForzada = `'${hora}`;
      const formatNum = (v: any) => (v === null || v === undefined || v === '' ? '' : Number(v).toFixed(2));
      return [
        fechaTexto,
        horaForzada,
        formatNum(r.arido1),
        formatNum(r.arido2),
        formatNum(r.arido3),
        r.client ?? '',
        r.project ?? '',
        r.mixer ?? '',
        r.driver ?? '',
        (r.notes || '').replace(/\r?\n/g, ' ').trim()
      ];
    });

    const allRows = [header, ...body];
    const csv = Papa.unparse(allRows, { quotes: true, delimiter: ';' });
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fechaArchivo = new Date().toISOString().split('T')[0];
    a.download = `reportes_produccion_${fechaArchivo}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export PDF profesional usando jsPDF + logo y estilos mejorados
  const exportPDF = async () => {
    if (!reports || reports.length === 0) return;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });
    const title = 'Reporte de Producción - COFADENA';

    // Intentar cargar el logo desde la carpeta public
    const logoDataUrl = await fetchImageAsDataURL('/images/logo.jpg');

    // Dibujar header: fondo celeste, logo y título
    const pageW = doc.internal.pageSize.getWidth();
    const headerH = 60;
    doc.setFillColor(14, 165, 233);
    doc.rect(0, 0, pageW, headerH, 'F');

    if (logoDataUrl) {
      try {
        // ajustar tamaño manteniendo proporciones (aprox 60px alto)
        doc.addImage(logoDataUrl, 'JPEG', 40, 12, 60, 36);
      } catch (e) {
        // si falla, ignorar logo
        console.warn('No se pudo añadir logo al PDF', e);
      }
    }

    doc.setFontSize(18);
    doc.setTextColor(255);
    doc.text(title, pageW / 2, 38, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString()}`, pageW - 40, 38, { align: 'right' });

    const body = reports.map((r: any) => ([
      new Date(r.occurred_at).toLocaleDateString(),
      new Date(r.occurred_at).toLocaleTimeString(),
      r.arido1 ?? '',
      r.arido2 ?? '',
      r.arido3 ?? '',
      r.client || '',
      r.project || '',
      r.mixer || '',
      r.driver || '',
      r.notes || ''
    ]));

    // AutoTable con estilos más limpios
    (doc as any).autoTable({
      startY: headerH + 10,
      head: [[ 'Fecha', 'Hora', 'Arido 1', 'Arido 2', 'Arido 3', 'Cliente', 'Proyecto', 'Mixer', 'Chofer', 'Observaciones' ]],
      body,
      headStyles: { fillColor: [14,165,233], textColor: 255, halign: 'center' },
      styles: { fontSize: 9, cellPadding: 6 },
      alternateRowStyles: { fillColor: [245,245,247] },
      columnStyles: {
        0: { cellWidth: 60 },
  1: { cellWidth: 50 },
  2: { cellWidth: 50 },
  3: { cellWidth: 50 },
  4: { cellWidth: 50 },
        5: { cellWidth: 100 },
        6: { cellWidth: 120 },
        7: { cellWidth: 100 },
        8: { cellWidth: 100 },
        9: { cellWidth: 180 }
      },
      didDrawPage: (data: any) => {
        // Pie de página con numeración
        const internal: any = doc.internal;
        const pageCount = internal.getNumberOfPages ? internal.getNumberOfPages() : (internal.pages?.length || 1);
        const pageNumber = (internal.getCurrentPageInfo ? internal.getCurrentPageInfo().pageNumber : (internal.pages?.length || 1));
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(`Página ${pageNumber} de ${pageCount}`, pageW - 80, doc.internal.pageSize.getHeight() - 20);
      }
    });

    const fechaArchivo = new Date().toISOString().split('T')[0];
    doc.save(`reportes_produccion_${fechaArchivo}.pdf`);
  };

  // Export XLSX: usa ExcelJS dinámico para generar un archivo con aridos centrados
  const exportXLSX = async () => {
    if (!reports || reports.length === 0) return;
    try {
      const [{ Workbook }, FileSaver] = await Promise.all([
        import('exceljs'),
        import('file-saver')
      ]);

      const wb = new Workbook();
      const ws = wb.addWorksheet('Reportes');

      // Título
      ws.mergeCells('A1:J1');
      const titleCell = ws.getCell('A1');
      titleCell.value = 'Reporte de Producción - COFADENA';
      titleCell.alignment = { horizontal: 'center' };
      titleCell.font = { size: 14, bold: true };

      // Cabeceras en la fila 3
      const headerRow = ws.getRow(3);
      const headers = ['Fecha', 'Hora', 'Arido 1', 'Arido 2', 'Arido 3', 'Cliente', 'Proyecto', 'Mixer', 'Chofer', 'Observaciones'];
      headers.forEach((h, i) => {
        const cell = headerRow.getCell(i + 1);
        cell.value = h;
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center' };
      });

      // Datos desde la fila 4
      let rowIndex = 4;
      for (const r of reports) {
        const fecha = new Date(r.occurred_at);
        const fechaTexto = fecha.toLocaleDateString();
        const hora = fecha.toLocaleTimeString([], { hour12: false });
        const row = ws.getRow(rowIndex);
        row.getCell(1).value = fechaTexto;
        row.getCell(2).value = hora;
        row.getCell(3).value = r.arido1 ?? '';
        row.getCell(4).value = r.arido2 ?? '';
        row.getCell(5).value = r.arido3 ?? '';
        row.getCell(6).value = r.client ?? '';
        row.getCell(7).value = r.project ?? '';
        row.getCell(8).value = r.mixer ?? '';
        row.getCell(9).value = r.driver ?? '';
        row.getCell(10).value = r.notes ?? '';

        // Alineación: centrar aridos
        row.getCell(3).alignment = { horizontal: 'center' };
        row.getCell(4).alignment = { horizontal: 'center' };
        row.getCell(5).alignment = { horizontal: 'center' };

        row.commit();
        rowIndex++;
      }

      // Ajustar anchos: fechas y horas más estrechos, aridos fijos
      ws.getColumn(1).width = 15; // Fecha
      ws.getColumn(2).width = 12; // Hora
      ws.getColumn(3).width = 8; // Arido1
      ws.getColumn(4).width = 8; // Arido2
      ws.getColumn(5).width = 8; // Arido3
      ws.getColumn(6).width = 25; // Cliente
      ws.getColumn(7).width = 25; // Proyecto
      ws.getColumn(8).width = 18; // Mixer
      ws.getColumn(9).width = 18; // Chofer
      ws.getColumn(10).width = 40; // Observaciones

      // Generar buffer y descargar
      const buf = await wb.xlsx.writeBuffer();
      const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fechaArchivo = new Date().toISOString().split('T')[0];
      FileSaver.saveAs(blob, `reportes_produccion_${fechaArchivo}.xlsx`);

    } catch (err) {
      console.error('exportXLSX failed', err);
      alert('No se pudo generar XLSX: ' + String(err));
    }
  };

  return (
    <div className={cn('min-h-screen p-6 sm:p-8', PAGE_BG)}>
      <div className="max-w-6xl mx-auto">
        <h1 className={cn('text-3xl font-bold mb-2', TEXT_PRIMARY)}>Reportes</h1>
        <p className={cn('text-sm mb-6', TEXT_MUTED)}>Consulta histórica de parámetros de producción.</p>

        <div className={cn('p-4 rounded-lg', CARD_BG)}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
            <div className="col-span-3">
              <label className="block text-sm font-medium">Rango de fechas</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full text-left">
                    {dateRange.from
                      ? dateRange.to
                        ? `${new Date(dateRange.from).toLocaleDateString()} — ${new Date(dateRange.to).toLocaleDateString()}`
                        : `${new Date(dateRange.from).toLocaleDateString()}`
                      : 'Seleccionar rango'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange.from ? new Date(dateRange.from) : undefined, to: dateRange.to ? new Date(dateRange.to) : undefined }}
                    onSelect={(range: any) => {
                      const from = range?.from ? new Date(range.from).toISOString() : undefined;
                      const to = range?.to ? new Date(range.to).toISOString() : undefined;
                      setDateRange({ from, to });
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium">Hora desde</label>
              <input type="time" value={hourFrom} onChange={(e) => setHourFrom(e.target.value)} className="mt-1 block w-full rounded-md px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium">Hora hasta</label>
              <input type="time" value={hourTo} onChange={(e) => setHourTo(e.target.value)} className="mt-1 block w-full rounded-md px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white" />
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
                <Button onClick={buscarReports} className="bg-sky-600 text-white">Buscar</Button>
                <Button variant="outline" onClick={() => { setReports([]); setDateRange({}); setHourFrom(''); setHourTo(''); }}>Limpiar</Button>
                <Button onClick={exportCSV} className="bg-sky-700 text-white" disabled={reports.length === 0}>Exportar CSV</Button>
                <Button onClick={exportPDF} className="bg-sky-700 text-white" disabled={reports.length === 0}>Exportar PDF</Button>
                <Button onClick={exportXLSX} className="bg-sky-700 text-white" disabled={reports.length === 0}>Exportar XLSX</Button>
              </div>
            
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Hora</th>
                  <th className="px-3 py-2">Arido 1</th>
                  <th className="px-3 py-2">Arido 2</th>
                  <th className="px-3 py-2">Arido 3</th>
                  <th className="px-3 py-2">Cliente</th>
                  <th className="px-3 py-2">Proyecto</th>
                  <th className="px-3 py-2">Mixer</th>
                  <th className="px-3 py-2">Chofer</th>
                  <th className="px-3 py-2">Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reports.length === 0 && (
                  <tr><td colSpan={10} className="px-3 py-6 text-center text-slate-400">No hay registros</td></tr>
                )}
                {reports.map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="px-3 py-2">{new Date(r.occurred_at).toLocaleDateString()}</td>
                    <td className="px-3 py-2">{new Date(r.occurred_at).toLocaleTimeString()}</td>
                    <td className="px-3 py-2">{r.arido1}</td>
                    <td className="px-3 py-2">{r.arido2}</td>
                    <td className="px-3 py-2">{r.arido3}</td>
                    <td className="px-3 py-2">{r.client}</td>
                    <td className="px-3 py-2">{r.project}</td>
                    <td className="px-3 py-2">{r.mixer}</td>
                    <td className="px-3 py-2">{r.driver}</td>
                    <td className="px-3 py-2">{r.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
