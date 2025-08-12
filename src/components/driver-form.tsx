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
import * as React from 'react';
import type { Driver } from '@/lib/data';

export const DriverSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  document: z.string().min(7, 'El documento debe tener al menos 7 dígitos'),
  age: z.coerce.number().min(18, 'La edad debe ser mayor a 18').max(70, 'La edad no puede ser mayor a 70'),
});

interface DriverFormProps {
  onSubmit: (data: z.infer<typeof DriverSchema>) => void;
  onCancel: () => void;
  defaultValues?: Partial<Driver> | null;
}

export function DriverForm({ onSubmit, onCancel, defaultValues }: DriverFormProps) {
  const form = useForm<z.infer<typeof DriverSchema>>({
    resolver: zodResolver(DriverSchema),
    defaultValues: {
      name: '',
      document: '',
      age: 0,
      ...defaultValues,
    },
  });

  React.useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues,
        age: defaultValues.age || 0,
      });
    } else {
      form.reset({
        name: '',
        document: '',
        age: 18,
      });
    }
  }, [defaultValues, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Carlos Rodriguez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="document"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Documento</FormLabel>
              <FormControl>
                <Input placeholder="Ej: 12345678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Edad</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Ej: 35" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </Form>
  );
}
