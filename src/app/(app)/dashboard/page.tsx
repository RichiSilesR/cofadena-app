'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { productionData } from "@/lib/data";
import { useAppData } from "@/context/app-data-context";
import { useAuth } from "@/context/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();
  const { projects, mixers } = useAppData();

  return (
    <div className="flex flex-col gap-8">
      <div>
        {user ? (
            <h1 className="text-3xl font-bold font-headline">Bienvenido, {user.name} ({user.role})</h1>
        ) : (
            <h1 className="text-3xl font-bold font-headline">Bienvenido</h1>
        )}
        <p className="text-muted-foreground">Aquí tienes un resumen del estado de tus operaciones.</p>
      </div>

      <div className="flex flex-wrap gap-6 mb-6 justify-center items-stretch">
        <Card className="shadow-lg hover:shadow-xl transition-shadow min-w-[260px] flex-1 max-w-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
            <span className="h-4 w-4 text-primary"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2m-6 0h6" /></svg></span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects?.filter(p => p.status === "En Curso").length ?? 0}</div>
            <p className="text-xs text-muted-foreground">Actualizado en tiempo real</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow min-w-[260px] flex-1 max-w-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Mixers</CardTitle>
            <span className="h-4 w-4 text-blue-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2m-6 0h6" /></svg></span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mixers?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">Mixers registrados en la flota</p>
          </CardContent>
        </Card>
  </div>

      <div className="flex w-full justify-center mt-8">
        <div className="max-w-2xl w-full">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Producción Semanal</CardTitle>
              <CardDescription>Unidades producidas en la última semana.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`}/>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar dataKey="production" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
