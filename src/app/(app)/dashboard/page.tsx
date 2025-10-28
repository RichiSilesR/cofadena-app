'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { productionData } from "@/lib/data";
import { useAppData } from "@/context/app-data-context";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

// --- PALETA DE COLORES Y CLASES MODERNAS ---
const ACCENT_COLOR_BAR = 'fill-sky-600 dark:fill-sky-400'; 
const ACCENT_COLOR_TEXT = 'text-sky-600 dark:text-sky-400';

const CARD_BG_DARK = 'dark:bg-slate-800 dark:border-slate-700';
const CARD_BG_LIGHT = 'bg-white border-gray-200';

const PAGE_BG = 'bg-gray-50 dark:bg-slate-900';
const TEXT_MUTED = 'text-gray-500 dark:text-slate-400';

// Color directo para la barra de Recharts (usando el mismo valor que Tailwind)
const barColor = 'rgb(2, 132, 199)'; // Tailwind sky-600

export default function DashboardPage() {
  const { user } = useAuth();
  const { projects, mixers } = useAppData();

  // Color de texto para el Tooltip (Celeste Oscuro para Claro, Celeste Claro para Oscuro)
  // Usamos el color de texto directo para asegurarnos que Recharts lo interprete.
  const tooltipTextColor = 'rgb(2, 132, 199)'; // sky-600 (Para Light Mode)
  const tooltipDarkTextColor = 'rgb(125, 211, 252)'; // sky-300 (Para Dark Mode)

  // Función para formatear el Tooltip
  const formatTooltipValue = (value: number, name: string, props: any) => {
    // 1. Traduce el nombre de la variable
    const translatedName = name === 'production' ? 'Producción' : name;
    
    // 2. Determina el color del texto basado en el modo (necesitaríamos un hook para saber el modo real)
    // Por simplicidad, aquí usaremos el color de acento para la cifra
    return (
      <span className={ACCENT_COLOR_TEXT}>
        {value.toLocaleString()}
      </span>
    );
  };
  
  // Función para formatear el label del Tooltip (e.g., el día)
  const formatTooltipLabel = (label: string) => {
      return (
          <span className="font-semibold text-gray-900 dark:text-white">
              {label}
          </span>
      );
  };

  // Función para el contenido personalizado del Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const isDarkMode = document.documentElement.classList.contains('dark');
      const textColor = isDarkMode ? tooltipDarkTextColor : tooltipTextColor;
      
      return (
        // CAMBIO: Estilos de la caja del Tooltip (Fondo y Borde)
        <div className="p-3 shadow-lg rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <p className="font-semibold mb-1 text-gray-900 dark:text-white">{label}</p>
          <p className="flex justify-between">
            {/* CAMBIO CLAVE: Texto "Producción" en gris/blanco y la cifra en celeste oscuro */}
            <span className={cn("text-sm", TEXT_MUTED)}>Producción:</span>
            <span className={cn("text-sm ml-2 font-bold", ACCENT_COLOR_TEXT)}>{payload[0].value.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className={cn("flex flex-col gap-10 p-6 sm:p-8 min-h-screen", PAGE_BG)}>
      
      {/* SECCIÓN DE BIENVENIDA (sin cambios) */}
      <div>
        {user ? (
          <h1 className="text-3xl sm:text-4xl font-extrabold font-headline text-gray-900 dark:text-white">
            Bienvenido, <span className={ACCENT_COLOR_TEXT}>{user.name}</span> ({user.role})
          </h1>
        ) : (
          <h1 className="text-3xl sm:text-4xl font-extrabold font-headline text-gray-900 dark:text-white">Bienvenido</h1>
        )}
        <p className={cn("mt-1", TEXT_MUTED)}>Aquí tienes un resumen del estado de tus operaciones.</p>
      </div>

      {/* TARJETAS DE MÉTRICAS (sin cambios en estructura) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Tarjeta 1: Proyectos Activos */}
        <Card className={cn("shadow-lg hover:shadow-xl transition-all duration-300", CARD_BG_LIGHT, CARD_BG_DARK, "lg:col-span-2")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
            <span className={cn("h-5 w-5", ACCENT_COLOR_TEXT)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2m-6 0h6" /></svg>
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{projects?.filter(p => p.status === "En Curso").length ?? 0}</div>
            <p className={cn("text-xs", TEXT_MUTED)}>Actualizado en tiempo real</p>
          </CardContent>
        </Card>
        
        {/* Tarjeta 2: Total de Mixers */}
        <Card className={cn("shadow-lg hover:shadow-xl transition-all duration-300", CARD_BG_LIGHT, CARD_BG_DARK, "lg:col-span-2")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Mixers</CardTitle>
            <span className={cn("h-5 w-5", ACCENT_COLOR_TEXT)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2m-6 0h6" /></svg>
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{mixers?.length ?? 0}</div>
            <p className={cn("text-xs", TEXT_MUTED)}>Mixers registrados en la flota</p>
          </CardContent>
        </Card>
        
      </div>

      {/* GRÁFICO DE PRODUCCIÓN */}
      <div className="flex w-full mt-4">
        <div className="w-full">
          <Card className={cn("shadow-xl", CARD_BG_LIGHT, CARD_BG_DARK)}>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Producción Semanal</CardTitle>
              <CardDescription className={TEXT_MUTED}>Unidades producidas en la última semana.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={productionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-slate-700" />
                  <XAxis dataKey="day" stroke="currentColor" className={TEXT_MUTED} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="currentColor" className={TEXT_MUTED} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                  {/* CAMBIO CLAVE: Usamos el componente personalizado para el Tooltip */}
                  <Tooltip 
                      content={<CustomTooltip />} 
                      wrapperClassName="shadow-lg" 
                  />
                  <Bar 
                    dataKey="production" 
                    className={ACCENT_COLOR_BAR} 
                    radius={[4, 4, 0, 0]} 
                  /> 
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
      
    </div>
  );
}