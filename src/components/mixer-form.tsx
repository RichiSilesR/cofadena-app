'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from './ui/textarea';
import * as React from 'react';
import type { Mixer } from '@/lib/data';

export const MixerSchema = z.object({
  alias: z.string().trim().min(2, 'El alias debe tener al menos 2 caracteres').max(50, 'Máximo 50 caracteres'),
  plate: z.string()
    .trim()
    .min(6, 'La placa debe tener 6 o 7 caracteres')
    .max(7, 'La placa debe tener máximo 7 caracteres')
    .regex(/^(\d{3,4}[A-Z]{3})$/i, 'La placa debe tener 3 o 4 dígitos seguidos de 3 letras (ej: 123ABC o 1234ABC)'),
  capacity_m3: z.coerce.number()
    .min(1, 'La capacidad mínima es 1 m³')
    .max(20, 'La capacidad máxima es 20 m³'),
  internal_code: z.string().optional(),
  notes: z.string().max(200, 'Máximo 200 caracteres').optional(),
});

interface MixerFormProps {
  onSubmit: (data: z.infer<typeof MixerSchema>) => Promise<any>;
  onCancel: () => void;
  defaultValues?: Partial<Mixer> | null;
}


export function MixerForm({ onSubmit, onCancel, defaultValues }: MixerFormProps) {
  const form = useForm<z.infer<typeof MixerSchema>>({
    resolver: zodResolver(MixerSchema),
    defaultValues: {
      alias: '',
      plate: '',
      capacity_m3: 0,
      internal_code: '',
      notes: '',
      ...defaultValues,
    },
  });

  React.useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues,
        capacity_m3: defaultValues.capacity_m3 || 0,
      });
    } else {
      form.reset({
        alias: '',
        plate: '',
        capacity_m3: 0,
        internal_code: '',
        notes: '',
      });
    }
  }, [defaultValues, form]);


  // El validador de react-hook-form (zodResolver) ya previene el submit si hay errores de formato/capacidad
  // Solo manejamos errores de backend (ej: placa duplicada)
  const [submitting, setSubmitting] = React.useState(false);
  const [backendPlateError, setBackendPlateError] = React.useState<string | null>(null);
  const handleSubmit = async (data: z.infer<typeof MixerSchema>) => {
    setSubmitting(true);
    setBackendPlateError(null);
    const result = await onSubmit(data);
    setSubmitting(false);
    if (result && result.error) {
      // Forzar mensaje profesional si es placa duplicada
      let msg = result.error;
      const errorText = String(result.error).toLowerCase();
      if (
        errorText.includes('placa') &&
        (errorText.includes('única') || errorText.includes('ya existe') || errorText.includes('duplicada'))
      ) {
        msg = 'Placa duplicada: ya existe un mixer con esa placa.';
      }
      form.setError('plate', { type: 'manual', message: msg });
      setBackendPlateError(msg);
      return false; // Indica al padre que hubo error y no debe cerrar el modal
    }
    setBackendPlateError(null);
    return true; // Indica éxito
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
        {/* ...existing code... */}
        <FormField
          control={form.control}
          name="alias"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alias / Modelo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Titan 8000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="plate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placa</FormLabel>
              <FormControl>
                <Input placeholder="Ej: 123ABC o 1234ABC" {...field} />
              </FormControl>
              <FormMessage />
              {backendPlateError && (
                <div className="text-destructive text-sm font-medium mt-1">{backendPlateError}</div>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="capacity_m3"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacidad (M³)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Ej: 8" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="internal_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código Interno</FormLabel>
              <FormControl>
                <Input placeholder="Ej: M-01 (Automático)" {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Textarea placeholder="Añadir notas sobre el mixer (mantenimiento, estado, etc.)..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

