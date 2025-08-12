import { BarChart, Bell, CheckCircle, Construction, HardHat, Hourglass, ListTodo, Package, Send, Settings, Thermometer, Users, XCircle, Zap, Building2, Truck, Contact, Factory } from 'lucide-react';
import { format } from 'date-fns';

export const kpiData = [
  { name: 'Proyectos Activos', value: 5, icon: Construction, color: 'text-primary' },
  { name: 'Alertas Críticas', value: 3, icon: Bell, color: 'text-destructive' },
  { name: 'Producción Hoy', value: '78%', icon: BarChart, color: 'text-green-500' },
  { name: 'Dispositivos Online', value: 23, icon: CheckCircle, color: 'text-blue-500' },
];

export const productionData = [
  { day: 'Lun', production: 2400 },
  { day: 'Mar', production: 1398 },
  { day: 'Mié', production: 9800 },
  { day: 'Jue', production: 3908 },
  { day: 'Vie', production: 4800 },
  { day: 'Sáb', production: 3800 },
  { day: 'Dom', production: 4300 },
];

export const alerts = [
  { id: 'ALERT-001', device: 'Sensor Temperatura Z-A', message: 'Temperatura excede umbral: 95°C', time: 'hace 2 minutos', status: 'Crítica' },
  { id: 'ALERT-002', device: 'PLC-03', message: 'Pérdida de comunicación', time: 'hace 15 minutos', status: 'Crítica' },
  { id: 'ALERT-003', device: 'Sensor Vibración P-2', message: 'Vibración anómala detectada', time: 'hace 45 minutos', status: 'Advertencia' },
];

export const deviceStatus = [
  { name: 'Sensor Temp. Z-A', status: 'Online', icon: Thermometer },
  { name: 'Sensor Presión Z-B', status: 'Online', icon: Send },
  { name: 'PLC-01', status: 'Online', icon: HardHat },
  { name: 'PLC-03', status: 'Offline', icon: HardHat },
];

export type ProjectStatus = 'En Curso' | 'Completado' | 'En Pausa' | 'Retrasado';

export interface Project {
    id: string;
    project_name: string;
    client_name: string;
    contact_name: string;
    phone: string;
    status: ProjectStatus;
    progress: number;
    start_date: string;
    end_date: string | null;
    notes?: string;
    driver_ids: string[];
    mixer_ids: string[];
}


export type ReportType = 'Diario' | 'Semanal' | 'Mensual';
export const reports: Report[] = [
    { id: 'REP-001', date: '2024-05-20', project_name: 'Condominio Las Palmeras', submitted_by: 'Juan Pérez', type: 'Diario' },
    { id: 'REP-002', date: '2024-05-21', project_name: 'Edificio Central', submitted_by: 'Maria García', type: 'Diario' },
    { id: 'REP-003', date: '2024-05-15', project_name: 'Puente del Sur', submitted_by: 'Carlos López', type: 'Semanal' },
    { id: 'REP-004', date: '2024-05-22', project_name: 'Torre Centinela', submitted_by: 'Luisa Fernandez', type: 'Diario' },
    { id: 'REP-005', date: '2024-05-23', project_name: 'Parque Industrial Este', submitted_by: 'Ana Torres', type: 'Diario' },
    { id: 'REP-006', date: '2024-05-22', project_name: 'Condominio Las Palmeras', submitted_by: 'Juan Pérez', type: 'Diario' },
    { id: 'REP-007', date: '2024-05-01', project_name: 'Residencial El Bosque', submitted_by: 'Roberto Carlos', type: 'Mensual' },
    { id: 'REP-008', date: '2024-05-20', project_name: 'Puente del Sur', submitted_by: 'Carlos López', type: 'Semanal' },
];
export interface Report {
    id: string;
    date: string;
    project_name: string;
    submitted_by: string;
    type: ReportType;
}

export type UserRole = 'Super Usuario' | 'Administrador' | 'Supervisor' | 'Usuario';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  password_hash?: string;
  role: UserRole;
  last_access: string | null;
  status: 'Activo' | 'Inactivo';
}

export const systemSettings = {
    companyName: "Constructora Visionaria S.A.",
    companyLogo: "",
    notifications: {
        email: true,
        sms: false,
        recipients: "admin@empresa.com, gerencia@empresa.com"
    },
    locations: ["Zona Norte", "Zona Sur", "Zona Este", "Zona Oeste", "Central"],
    materialTypes: ["Concreto", "Acero", "Madera", "Vidrio"],
    backupSchedule: "Diario a las 02:00 AM"
};

export interface Client {
    id: string;
    name: string;
    contact: string;
    email: string;
    phone: string;
    address: string;
    notes?: string;
}

export const clients: Client[] = [
    { id: 'CLI-001', name: 'Constructora Horizonte S.A.', contact: 'Juan Pérez', email: 'contacto@horizonte.com', phone: '71234567', address: 'Av. Principal #123', notes: 'Cliente prioritario' },
    { id: 'CLI-002', name: 'Inversiones Futuro Ltda.', contact: 'Maria García', email: 'proyectos@futuro.com', phone: '69876543', address: 'Calle Falsa #456' },
    { id: 'CLI-003', name: 'Urbanizaciones Modernas', contact: 'Luisa Fernandez', email: 'info@urban.bo', phone: '76543210', address: 'Zona Sur, Calle 8', notes: 'Requiere facturación especial' },
    { id: 'CLI-004', name: 'Edificios Gigantes', contact: 'Roberto Carlos', email: 'rcarlos@gigantes.com', phone: '77788990', address: 'Av. Arce #2000' },
    { id: 'CLI-005', name: 'Viviendas El Sol', contact: 'Ana Torres', email: 'atorres@viviendaselsol.com', phone: '65544332', address: 'Obrajes, Calle 10', notes: 'Contacto directo con el Ing. de obra.' },
];

export interface Mixer {
    id: string;
    alias: string;
    plate: string;
    capacity_m3: number;
    internal_code?: string;
    notes?: string;
}

export const mixers: Mixer[] = [
    { id: 'MIX-001', alias: 'Titan 01', plate: '4032LPD', capacity_m3: 8, internal_code: 'M-01', notes: 'Mantenimiento reciente.' },
    { id: 'MIX-002', alias: 'Gigante 02', plate: '3122ABC', capacity_m3: 10, internal_code: 'M-02', notes: 'Revisar neumáticos.' },
    { id: 'MIX-003', alias: 'Coloso 03', plate: '5544XYZ', capacity_m3: 8, internal_code: 'M-03', notes: 'Sistema hidráulico nuevo.' },
    { id: 'MIX-004', alias: 'Hormigonero 04', plate: '2288DEF', capacity_m3: 9, internal_code: 'M-04' },
    { id: 'MIX-005', alias: 'Potencia 05', plate: '1199GHI', capacity_m3: 8, internal_code: 'M-05', notes: 'Disponible solo fines de semana.' },
];


export interface Driver {
    id: string;
    name: string;
    document: string;
    age: number;
}
export const drivers: Driver[] = [
    { id: 'DRV-001', name: 'Carlos Rodriguez', document: '1234567 LP', age: 35 },
    { id: 'DRV-002', name: 'Pedro Martinez', document: '7654321 CB', age: 42 },
    { id: 'DRV-003', name: 'Luis Gonzales', document: '8889900 SC', age: 28 },
    { id: 'DRV-004', name: 'Mario Fernandez', document: '2233445 OR', age: 51 },
    { id: 'DRV-005', name: 'Jorge Gutierrez', document: '6655443 PT', age: 39 },
];

export const projects: Project[] = [
    {
        id: 'PROJ-001',
        project_name: 'Condominio Las Palmeras',
        client_name: 'Constructora Horizonte S.A.',
        contact_name: 'Juan Pérez',
        phone: '71234567',
        status: 'En Curso',
        progress: 75,
        start_date: '2024-03-15',
        end_date: null,
        notes: 'Fase 2 en progreso. Se requiere más material la próxima semana.',
        driver_ids: ['DRV-001', 'DRV-003'],
        mixer_ids: ['MIX-001', 'MIX-003']
    },
    {
        id: 'PROJ-002',
        project_name: 'Edificio Central',
        client_name: 'Inversiones Futuro Ltda.',
        contact_name: 'Maria García',
        phone: '69876543',
        status: 'Completado',
        progress: 100,
        start_date: '2023-11-01',
        end_date: '2024-04-30',
        driver_ids: ['DRV-002'],
        mixer_ids: ['MIX-002']
    },
    {
        id: 'PROJ-003',
        project_name: 'Puente del Sur',
        client_name: 'Constructora Horizonte S.A.',
        contact_name: 'Juan Pérez',
        phone: '71234567',
        status: 'Retrasado',
        progress: 40,
        start_date: '2024-01-10',
        end_date: null,
        notes: 'Retraso por problemas de logística.',
        driver_ids: ['DRV-001', 'DRV-002', 'DRV-004'],
        mixer_ids: ['MIX-001', 'MIX-002', 'MIX-004']
    },
    {
        id: 'PROJ-004',
        project_name: 'Torre Centinela',
        client_name: 'Edificios Gigantes',
        contact_name: 'Roberto Carlos',
        phone: '77788990',
        status: 'En Curso',
        progress: 90,
        start_date: '2024-02-01',
        end_date: null,
        notes: 'A punto de finalizar. Se necesitan acabados.',
        driver_ids: ['DRV-005'],
        mixer_ids: ['MIX-005']
    },
    {
        id: 'PROJ-005',
        project_name: 'Residencial El Bosque',
        client_name: 'Urbanizaciones Modernas',
        contact_name: 'Luisa Fernandez',
        phone: '76543210',
        status: 'En Pausa',
        progress: 25,
        start_date: '2024-04-20',
        end_date: null,
        notes: 'En espera de aprobación de nuevos planos.',
        driver_ids: [],
        mixer_ids: []
    },
    {
        id: 'PROJ-006',
        project_name: 'Parque Industrial Este',
        client_name: 'Inversiones Futuro Ltda.',
        contact_name: 'Maria García',
        phone: '69876543',
        status: 'En Curso',
        progress: 50,
        start_date: '2024-05-10',
        end_date: null,
        notes: 'Movimiento de tierras completado.',
        driver_ids: ['DRV-001', 'DRV-002', 'DRV-003', 'DRV-004'],
        mixer_ids: ['MIX-001', 'MIX-002', 'MIX-003', 'MIX-004']
    },
    {
        id: 'PROJ-007',
        project_name: 'Viviendas Populares Norte',
        client_name: 'Viviendas El Sol',
        contact_name: 'Ana Torres',
        phone: '65544332',
        status: 'Completado',
        progress: 100,
        start_date: '2023-08-15',
        end_date: '2024-05-15',
        notes: 'Entregado al cliente.',
        driver_ids: ['DRV-005'],
        mixer_ids: ['MIX-005']
    },
];
