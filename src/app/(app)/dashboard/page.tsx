'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { productionData, alerts, deviceStatus } from "@/lib/data";
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Proyectos Activos */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
            <span className="h-4 w-4 text-primary"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2m-6 0h6" /></svg></span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects?.filter(p => p.status === "En Curso").length ?? 0}</div>
            <p className="text-xs text-muted-foreground">Actualizado en tiempo real</p>
          </CardContent>
        </Card>
        {/* Alertas Críticas */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Críticas</CardTitle>
            <span className="h-4 w-4 text-destructive"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts?.filter(a => a.status === "Crítica").length ?? 0}</div>
            <p className="text-xs text-muted-foreground">Fuente: sistema de alertas</p>
          </CardContent>
        </Card>
        {/* Total de Mixers */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Mixers</CardTitle>
            <span className="h-4 w-4 text-blue-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2m-6 0h6" /></svg></span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mixers?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">Mixers registrados en la flota</p>
          </CardContent>
        </Card>
        {/* Producción Hoy (dato de ejemplo) */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Producción Hoy</CardTitle>
            <span className="h-4 w-4 text-green-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /></svg></span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">Dato de ejemplo</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2 shadow-lg">
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

        <div className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Estado de Dispositivos</CardTitle>
            </CardHeader>
            <CardContent>
               <ul className="space-y-2">
                {deviceStatus.map(device => (
                  <li key={device.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <device.icon className="h-4 w-4 text-muted-foreground"/>
                      <span className="text-sm">{device.name}</span>
                    </div>
                    <Badge variant={device.status === 'Online' ? 'default' : 'destructive'} className={device.status === 'Online' ? 'bg-green-500 hover:bg-green-600' : ''}>
                      {device.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Alertas Recientes</CardTitle>
          <CardDescription>Últimas alertas críticas y advertencias del sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispositivo</TableHead>
                <TableHead>Mensaje</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Tiempo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">{alert.device}</TableCell>
                  <TableCell>{alert.message}</TableCell>
                  <TableCell>
                    <Badge variant={alert.status === 'Crítica' ? 'destructive' : 'default'} className={alert.status === 'Advertencia' ? 'bg-yellow-500 text-white':''}>
                      {alert.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{alert.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
