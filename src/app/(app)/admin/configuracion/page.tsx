'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { systemSettings } from "@/lib/data";
import { Save } from "lucide-react";

export default function ConfiguracionPage() {
  return (
    <div className="flex flex-col gap-8">
       <div>
            <h1 className="text-3xl font-bold font-headline">Configuración del Sistema</h1>
            <p className="text-muted-foreground">Ajustes generales del sistema.</p>
        </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Ajustes de la Empresa</CardTitle>
            <CardDescription>
              Información general de la compañía que aparecerá en el sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nombre de la Empresa</Label>
              <Input id="companyName" defaultValue={systemSettings.companyName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Logo de la Empresa</Label>
              <Input id="logo" type="file" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Configuración de Notificaciones</CardTitle>
            <CardDescription>
              Define cómo y a quién se envían las alertas del sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
                <Switch id="email-notifications" defaultChecked={systemSettings.notifications.email} />
                <Label htmlFor="email-notifications">Notificaciones por Correo Electrónico</Label>
            </div>
             <div className="flex items-center space-x-2">
                <Switch id="sms-notifications" defaultChecked={systemSettings.notifications.sms} />
                <Label htmlFor="sms-notifications">Notificaciones por SMS</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipients">Destinatarios (separados por coma)</Label>
              <Input id="recipients" defaultValue={systemSettings.notifications.recipients} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Gestión de Datos</CardTitle>
            <CardDescription>
              Configuraciones relacionadas con la base de datos y copias de seguridad.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="backup">Copias de Seguridad</Label>
                <p className="text-sm text-muted-foreground">El sistema está configurado para realizar copias de seguridad automáticamente: <strong>{systemSettings.backupSchedule}</strong>.</p>
            </div>
            <Button variant="secondary">Realizar Copia de Seguridad Manual</Button>
          </CardContent>
        </Card>
      </div>

       <div className="flex justify-end mt-8">
            <Button size="lg">
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
            </Button>
        </div>
    </div>
  );
}
