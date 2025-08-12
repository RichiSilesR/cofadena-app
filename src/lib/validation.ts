/**
 * Esquema de validación para roles personalizados
 * Permite definir permisos y descripciones de roles
 */
export const CustomRoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3, 'El nombre del rol es muy corto').max(50, 'Nombre de rol muy largo'),
  description: z.string().max(200, 'Máximo 200 caracteres').optional(),
  permissions: z.array(z.string().min(2)).min(1, 'Debe tener al menos un permiso'),
  created_at: z.string().datetime({ message: 'Fecha inválida' }),
  updated_at: z.string().datetime({ message: 'Fecha inválida' }),
});

/**
 * Esquema de validación para historial de cambios (versionado)
 * Permite auditar y restaurar versiones de entidades
 */
export const ChangeHistorySchema = z.object({
  id: z.string().uuid(),
  entity: z.string().min(2).max(50),
  entity_id: z.string().uuid(),
  user_id: z.string().uuid(),
  action: z.enum(['create', 'update', 'delete', 'restore']),
  old_value: z.string().max(2000).optional(),
  new_value: z.string().max(2000).optional(),
  timestamp: z.string().datetime({ message: 'Fecha inválida' }),
});

/**
 * Esquema de validación para preferencias de usuario
 * Permite guardar configuraciones personalizadas por usuario
 */
export const UserPreferencesSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  key: z.string().min(2).max(50),
  value: z.union([
    z.string().max(500),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.array(z.number()),
    z.array(z.boolean()),
  ]),
  updated_at: z.string().datetime({ message: 'Fecha inválida' }),
});

/**
 * Esquema de validación para tareas/pendientes (to-do)
 * Permite gestionar tareas asignadas a usuarios
 */
export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3, 'El título es muy corto').max(100, 'Título muy largo'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
  assigned_to: z.string().uuid().optional(),
  status: z.enum(['pendiente', 'en progreso', 'completada', 'cancelada']),
  due_date: z.string().datetime({ message: 'Fecha inválida' }).optional(),
  created_at: z.string().datetime({ message: 'Fecha inválida' }),
  updated_at: z.string().datetime({ message: 'Fecha inválida' }),
});

/**
 * Esquema de validación para etiquetas/categorías
 * Permite clasificar entidades y facilitar búsquedas
 */
export const TagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, 'El nombre es muy corto').max(50, 'Nombre muy largo'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hexadecimal inválido').optional(),
  description: z.string().max(200, 'Máximo 200 caracteres').optional(),
  created_at: z.string().datetime({ message: 'Fecha inválida' }),
});
/**
 * Esquema de validación para sesiones activas de usuario
 * Permite validar y auditar sesiones, tokens y control de acceso
 */
export const SessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  token: z.string().min(16, 'Token inválido').max(256, 'Token demasiado largo'),
  created_at: z.string().datetime({ message: 'Fecha inválida' }),
  expires_at: z.string().datetime({ message: 'Fecha inválida' }),
  ip: z.string().optional(),
  user_agent: z.string().max(300, 'User agent muy largo').optional(),
  active: z.boolean().default(true),
});
/**
 * Esquema de validación para parámetros de configuración del sistema
 * Permite validar settings globales y personalización profesional
 */
export const SystemConfigSchema = z.object({
  id: z.string().uuid(),
  key: z.string().min(2, 'La clave es muy corta').max(50, 'Clave muy larga'),
  value: z.union([
    z.string().max(500),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.array(z.number()),
    z.array(z.boolean()),
  ]),
  description: z.string().max(200, 'Máximo 200 caracteres').optional(),
  updated_at: z.string().datetime({ message: 'Fecha inválida' }),
  updated_by: z.string().uuid(),
});
/**
 * Esquema de validación para notificaciones internas del sistema
 * Permite validar mensajes, alertas y avisos a usuarios
 */
export const NotificationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().optional(), // Puede ser global o para un usuario
  type: z.enum(['info', 'success', 'warning', 'error', 'system']),
  title: z.string().min(3, 'El título es muy corto').max(100, 'Título muy largo'),
  message: z.string().min(3, 'El mensaje es muy corto').max(500, 'Mensaje muy largo'),
  read: z.boolean().optional().default(false),
  created_at: z.string().datetime({ message: 'Fecha inválida' }),
  expires_at: z.string().datetime({ message: 'Fecha inválida' }).optional(),
});
/**
 * Esquema de validación para archivos públicos (media/files)
 * Permite validar imágenes y documentos subidos al sistema
 */
export const PublicFileSchema = z.object({
  id: z.string().uuid(),
  file_name: z.string().min(3, 'El nombre del archivo es muy corto').max(200, 'Nombre de archivo muy largo'),
  file_type: z.string().min(3, 'Tipo de archivo inválido').max(20),
  file_size: z.number().min(1, 'El archivo está vacío'),
  url: z.string().url('URL inválida'),
  uploaded_by: z.string().uuid(),
  uploaded_at: z.string().datetime({ message: 'Fecha inválida' }),
  notes: z.string().max(300, 'Máximo 300 caracteres').optional(),
});
/**
 * Esquema de validación para respaldos automáticos (backups)
 * Permite validar la integridad y metadatos de los archivos de respaldo
 */
export const BackupSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime({ message: 'Fecha inválida' }),
  file_name: z.string().min(5, 'El nombre del archivo es muy corto').max(200, 'Nombre de archivo muy largo'),
  file_size: z.number().min(1, 'El archivo está vacío'),
  file_type: z.string().min(3, 'Tipo de archivo inválido').max(20),
  checksum: z.string().min(8, 'Checksum inválido').max(128),
  status: z.enum(['OK', 'ERROR', 'PENDIENTE']),
  notes: z.string().max(300, 'Máximo 300 caracteres').optional(),
});
/**
 * Esquema de validación para registros de auditoría (logs)
 * Permite validar acciones administrativas y trazabilidad
 */
export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  action: z.string().trim().min(3, 'La acción debe tener al menos 3 caracteres').max(100, 'Máximo 100 caracteres'),
  entity: z.string().trim().min(2, 'La entidad debe tener al menos 2 caracteres').max(50, 'Máximo 50 caracteres'),
  entity_id: z.string().uuid(),
  timestamp: z.string().datetime({ message: 'Fecha inválida' }),
  details: z.string().max(500, 'Máximo 500 caracteres').optional(),
  ip: z.string().optional(),
});
import { z } from "zod";

/**
 * Esquema de validación para Proyectos
 * Incluye sanitización y preparado para soft delete
 */
export const ProjectSchema = z.object({
  project_name: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'Máximo 100 caracteres'),
  client_id: z.string().uuid(),
  contact_name: z.string().trim().min(3, 'El contacto debe tener al menos 3 caracteres').max(100, 'Máximo 100 caracteres'),
  client_phone: z.string().trim().min(5, 'El teléfono debe tener al menos 5 dígitos').max(20, 'Máximo 20 dígitos').regex(/^[0-9+\-()\s]+$/, 'Solo números, espacios, +, -, ( )'),
  status: z.enum(["En Curso", "Completado", "Terminado", "En Pausa", "Retrasado"]),
  progress: z.number().min(0).max(100),
  start_date: z.string().optional(),
  end_date: z.string().optional().nullable(),
  notes: z.string().max(500).optional(),
  driver_ids: z.array(z.string()).optional(),
  mixer_ids: z.array(z.string()).optional(),
  deleted: z.boolean().optional().default(false), // Soft delete
});

/**
 * Esquema de validación para Usuarios
 */
/**
 * Esquema de validación para Usuarios
 * Incluye sanitización, validaciones avanzadas y mensajes personalizados
 */
export const UserSchema = z.object({
  name: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'Máximo 100 caracteres'),
  username: z.string().trim().min(3, 'El usuario debe tener al menos 3 caracteres').max(50, 'Máximo 50 caracteres').regex(/^[a-zA-Z0-9_.-]+$/, 'Solo letras, números y . _ -'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(100, 'Máximo 100 caracteres').regex(/[A-Z]/, 'Debe contener al menos una mayúscula').regex(/[a-z]/, 'Debe contener al menos una minúscula').regex(/[0-9]/, 'Debe contener al menos un número'),
  role: z.enum(["Super Usuario", "Administrador", "Supervisor", "Usuario"]),
  deleted: z.boolean().optional().default(false),
});

/**
 * Esquema de validación para Clientes
 */
export const ClientSchema = z.object({
  name: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'Máximo 100 caracteres'),
  contact: z.string().trim().min(3, 'El contacto debe tener al menos 3 caracteres').max(100, 'Máximo 100 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  phone: z.string().trim().min(5, 'El teléfono debe tener al menos 5 dígitos').max(20, 'Máximo 20 dígitos').regex(/^[0-9+\-()\s]+$/, 'Solo números, espacios, +, -, ( )'),
  address: z.string().max(200, 'Máximo 200 caracteres').optional(),
  notes: z.string().max(200, 'Máximo 200 caracteres').optional(),
  deleted: z.boolean().optional().default(false),
});

/**
 * Esquema de validación para Mixers
 * Incluye sanitización y validaciones avanzadas
 */
export const MixerSchema = z.object({
  alias: z.string().trim().min(2, 'El alias debe tener al menos 2 caracteres').max(50, 'Máximo 50 caracteres'),
  // Placa: 3 o 4 dígitos numéricos seguidos de 3 letras (ej: 123ABC o 1234ABC)
  plate: z.string()
    .trim()
    .regex(/^\d{3,4}[A-Z]{3}$/i, 'La placa debe tener 3 o 4 dígitos seguidos de 3 letras (ej: 123ABC o 1234ABC)'),
  capacity_m3: z.number().min(1, 'Mínimo 1 m³').max(20, 'Máximo 20 m³'),
  notes: z.string().max(200, 'Máximo 200 caracteres').optional(),
  deleted: z.boolean().optional().default(false),
});

/**
 * Esquema de validación para Choferes
 * Incluye sanitización y validaciones avanzadas
 */
export const DriverSchema = z.object({
  name: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'Máximo 100 caracteres'),
  document: z.string().trim().min(5, 'El documento debe tener al menos 5 caracteres').max(20, 'Máximo 20 caracteres').regex(/^[A-Z0-9-]+$/i, 'Solo letras, números y guiones'),
  age: z.number().min(18, 'Edad mínima 18').max(80, 'Edad máxima 80'),
  notes: z.string().max(200, 'Máximo 200 caracteres').optional(),
  deleted: z.boolean().optional().default(false),
});
