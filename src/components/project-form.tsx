'use client';

import * as React from 'react';
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
import type { Project, Client, Driver, Mixer } from '@/lib/data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, ChevronDown, Contact, Truck } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { es } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu';

export const ProjectSchema = z.object({
  client_id: z.string().min(1, 'Debes seleccionar un cliente'),
  project_name: z.string().min(1, 'El nombre del proyecto es requerido'),
  contact_name: z.string().min(1, 'El nombre del contacto es requerido'),
  phone: z.string().min(8, 'El teléfono debe tener 8 dígitos').max(8, 'El teléfono debe tener 8 dígitos'),
  status: z.enum(['En Curso', 'Completado', 'En Pausa', 'Retrasado']),
  progress: z.coerce.number().min(0).max(100),
  start_date: z.date({ required_error: 'La fecha de inicio es requerida.'}),
  end_date: z.date().optional().nullable(),
  notes: z.string().optional(),
  driver_ids: z.array(z.string()).optional(),
  mixer_ids: z.array(z.string()).optional(),
});

interface ProjectFormProps {
  onSubmit: (data: z.infer<typeof ProjectSchema>) => void;
  onCancel: () => void;
  defaultValues?: Partial<Project> | null;
  clients: Client[];
  drivers: Driver[];
  mixers: Mixer[];
}

export function ProjectForm({
  onSubmit,
  onCancel,
  defaultValues,
  clients,
  drivers,
  mixers
}: ProjectFormProps) {
  const form = useForm<z.infer<typeof ProjectSchema>>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      client_id: '',
      project_name: '',
      contact_name: '',
      phone: '',
      status: 'En Curso',
      progress: 0,
      notes: '',
      driver_ids: [],
      mixer_ids: [],
    },
    mode: 'onChange',
  });

  const progressValue = form.watch('progress');
  const statusValue = form.watch('status');
  const selectedDriverIds = form.watch('driver_ids') || [];
  const selectedMixerIds = form.watch('mixer_ids') || [];


  React.useEffect(() => {
    if (defaultValues) {
      let clientId = '';
      if (defaultValues.client_id !== undefined && defaultValues.client_id !== null && defaultValues.client_id !== '') {
        clientId = String(defaultValues.client_id);
      } else if (defaultValues.client_name && clients && clients.length > 0) {
        const found = clients.find(c => c.name === defaultValues.client_name);
        if (found) clientId = String(found.id);
      }
      form.reset({
        ...defaultValues,
        client_id: clientId,
        start_date:
          defaultValues.start_date instanceof Date
            ? defaultValues.start_date
            : typeof defaultValues.start_date === 'string'
              ? parseISO(defaultValues.start_date)
              : undefined,
        end_date:
          defaultValues.end_date instanceof Date
            ? defaultValues.end_date
            : typeof defaultValues.end_date === 'string'
              ? parseISO(defaultValues.end_date)
              : null,
        driver_ids: (defaultValues.driver_ids || []).map(String),
        mixer_ids: (defaultValues.mixer_ids || []).map(String),
      });
    } else {
      form.reset({
        client_id: '',
        client_name: '',
        project_name: '',
        contact_name: '',
        phone: '',
        status: 'En Curso',
        progress: 0,
        start_date: undefined,
        end_date: null,
        notes: '',
        driver_ids: [],
        mixer_ids: [],
      });
    }
  }, [defaultValues, clients]);
  
  const selectedClientId = form.watch('client_id');

  React.useEffect(() => {
    const client = clients.find(c => c.id === selectedClientId);
    if (client) {
      form.setValue('contact_name', client.contact);
      form.setValue('phone', client.phone);
    }
  }, [selectedClientId, clients, form]);

  React.useEffect(() => {
    if (progressValue === 100) {
      if (statusValue !== 'Completado') {
        form.setValue('status', 'Completado');
      }
      if (!form.getValues('end_date')) {
        form.setValue('end_date', new Date());
      }
    }
  
    if (statusValue === 'Completado') {
      if (progressValue !== 100) {
        form.setValue('progress', 100);
      }
      if (!form.getValues('end_date')) {
        form.setValue('end_date', new Date());
      }
    } else {
      if (form.getValues('end_date')) {
        form.setValue('end_date', null);
      }
    }
  }, [progressValue, statusValue, form]);


  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          // Garantizar que client_id es string y válido
          const client = clients.find(c => String(c.id) === String(data.client_id));
          const submitData = {
            ...data,
            client_id: data.client_id,
            client_name: client ? client.name : (defaultValues?.client_name || ''),
            client_phone: data.phone || client?.phone || '',
          };
          onSubmit(submitData);
        })}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="project_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Proyecto</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Condominio Las Palmeras" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => {
            // Si el cliente actual no está en la lista, lo agregamos temporalmente
            const currentClient = clients.find(c => String(c.id) === String(field.value));
            const clientOptions = currentClient
              ? clients
              : [
                  ...(clients || []),
                  defaultValues && field.value
                    ? { id: String(field.value), name: defaultValues.client_name || 'Cliente eliminado' }
                    : null,
                ].filter(Boolean);
            return (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <Select
                  onValueChange={val => {
                    if (val) field.onChange(val);
                  }}
                  value={field.value}
                  defaultValue={field.value}
                  required
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clientOptions.map(client => (
                      <SelectItem key={client.id} value={String(client.id)}>
                        {client.name}
                        {(!clients.find(c => String(c.id) === String(client.id)) && String(client.id) === String(field.value)) ? ' (eliminado)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="contact_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Contacto</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Ana García" {...field} disabled={!!selectedClientId}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input placeholder="Ej: 71234567" {...field} disabled={!!selectedClientId} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <FormField
              control={form.control}
              name="driver_ids"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Choferes Asignados</FormLabel>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                                <span>{selectedDriverIds.length > 0 ? `${selectedDriverIds.length} chofer(es) seleccionado(s)` : 'Seleccionar choferes'}</span>
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                            {drivers.map(driver => (
                                <DropdownMenuCheckboxItem
                                    key={driver.id}
                                    checked={field.value?.includes(driver.id)}
                                    onCheckedChange={(checked) => {
                                        const currentIds = field.value || [];
                                        const newIds = checked
                                            ? [...currentIds, driver.id]
                                            : currentIds.filter(id => id !== driver.id);
                                        field.onChange(newIds);
                                    }}
                                >
                                    <Contact className="mr-2 h-4 w-4 text-muted-foreground"/>
                                    {driver.name}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mixer_ids"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Mixers Asignados</FormLabel>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                                <span>{selectedMixerIds.length > 0 ? `${selectedMixerIds.length} mixer(s) seleccionado(s)` : 'Seleccionar mixers'}</span>
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                            {mixers.map(mixer => (
                                <DropdownMenuCheckboxItem
                                    key={mixer.id}
                                    checked={field.value?.includes(mixer.id)}
                                    onCheckedChange={(checked) => {
                                        const currentIds = field.value || [];
                                        const newIds = checked
                                            ? [...currentIds, mixer.id]
                                            : currentIds.filter(id => id !== mixer.id);
                                        field.onChange(newIds);
                                    }}
                                >
                                    <Truck className="mr-2 h-4 w-4 text-muted-foreground"/>
                                    {mixer.alias} ({mixer.plate})
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                     <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Inicio</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Elige una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date("1900-01-01")
                      }
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Fin</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>(Automático)</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="En Curso">En Curso</SelectItem>
                  <SelectItem value="Completado">Completado</SelectItem>
                  <SelectItem value="En Pausa">En Pausa</SelectItem>
                  <SelectItem value="Retrasado">Retrasado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="progress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Progreso (%)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
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
                <Textarea
                  placeholder="Añadir notas importantes sobre el proyecto..."
                  {...field}
                />
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
