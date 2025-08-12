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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';
import type { User } from '@/lib/data';

// Cuando se crea un usuario, la contraseña es obligatoria.
const CreateUserSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  username: z.string().min(1, 'El nombre de usuario es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.nativeEnum({
    'Super Usuario': 'Super Usuario',
    'Administrador': 'Administrador',
    'Supervisor': 'Supervisor',
    'Usuario': 'Usuario'
  })
});

// Cuando se edita, la contraseña es opcional.
const EditUserSchema = CreateUserSchema.extend({
  password: z.string().optional().refine(val => !val || val.length >= 6, {
    message: 'La nueva contraseña debe tener al menos 6 caracteres',
  }),
});


interface UserFormProps {
  onSubmit: (data: any) => void;
  defaultValues?: Partial<User> | null;
  onCancel: () => void;
}

export function UserForm({ onSubmit, defaultValues, onCancel }: UserFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const isEditing = !!defaultValues;

  const form = useForm({
    resolver: zodResolver(isEditing ? EditUserSchema : CreateUserSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      username: defaultValues?.username || '',
      password: '', // Siempre empezar vacío por seguridad
      role: defaultValues?.role || 'Usuario',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Juan Pérez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de Usuario</FormLabel>
              <FormControl>
                <Input placeholder="Ej: jperez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    {...field}
                    className="pr-10"
                    placeholder={isEditing ? 'Dejar en blanco para no cambiar' : '********'}
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Super Usuario">Super Usuario</SelectItem>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Supervisor">Supervisor</SelectItem>
                  <SelectItem value="Usuario">Usuario</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
        </div>
      </form>
    </Form>
  );
}
