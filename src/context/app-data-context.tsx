'use client';

import * as React from 'react';
import {
  // mixers as initialMixers,
  drivers as initialDrivers,
  projects as initialProjects,
  reports as initialReports,
  type Client,
  type Mixer,
  type Driver,
  type Project,
  type Report
} from '@/lib/data';
import { fetchClients, addClient, editClient, removeClient } from '@/app/(app)/registros/clientes/actions';
import { fetchMixers, addMixer, editMixer, removeMixer } from '@/app/(app)/registros/mixers/actions';
import { fetchDrivers, addDriver, editDriver, removeDriver } from '@/app/(app)/registros/choferes/actions';
import { useAuth } from '@/context/auth-context';
import { fetchProjects, addProject, editProject, removeProject } from '@/app/(app)/proyectos/actions';
import { fetchReports, addReport } from '@/app/(app)/registros/reportes/actions';

interface AppDataContextType {
  clients: Client[];
  mixers: Mixer[];
  drivers: Driver[];
  projects: Project[];
  reports: Report[];
  createReport: (report: Omit<Report, 'id'>) => void;
  createClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  createDriver: (driver: Omit<Driver, 'id'>) => void;
  updateDriver: (id: string, driver: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;
  createMixer: (mixer: Omit<Mixer, 'id'>) => void;
  updateMixer: (id: string, mixer: Partial<Mixer>) => void;
  deleteMixer: (id: string) => void;
  createProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
}

const AppDataContext = React.createContext<AppDataContextType | undefined>(
  undefined
);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [mixers, setMixers] = React.useState<Mixer[]>([]);
  const { user } = useAuth();
  // CRUD profesional con base de datos para Mixers
  React.useEffect(() => {
    (async () => {
      const dbMixers = await fetchMixers();
      setMixers(dbMixers);
    })();
  }, []);
  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [reports, setReports] = React.useState<Report[]>(initialReports);

  // CRUD profesional con base de datos para Drivers
  React.useEffect(() => {
    (async () => {
      const dbDrivers = await fetchDrivers();
      setDrivers(dbDrivers);
    })();
  }, []);
  // CRUD profesional con base de datos para Proyectos
  React.useEffect(() => {
    (async () => {
      const dbProjects = await fetchProjects();
      setProjects(dbProjects);
    })();
  }, []);
  // CRUD profesional con base de datos para Reportes
  React.useEffect(() => {
    (async () => {
      const dbReports = await fetchReports();
      setReports(dbReports);
    })();
  }, []);
  // CRUD profesional con base de datos para Clientes
  React.useEffect(() => {
    (async () => {
      const dbClients = await fetchClients();
      setClients(dbClients);
    })();
  }, []);

  const createClient = async (client: Omit<Client, 'id'>) => {
    const audit = user ? { user_id: user.id, username: user.name } : {};
    const newClient = await addClient(client, audit);
    setClients(prev => [...prev, newClient]);
  };
  const updateClient = async (id: string, client: Partial<Client>) => {
    const audit = user ? { user_id: user.id, username: user.name } : {};
    const updated = await editClient(id, client, audit);
    setClients(prev => prev.map(c => c.id === id ? updated : c));
  };
  const deleteClient = async (id: string) => {
    await removeClient(id);
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const createDriver = async (driver: Omit<Driver, 'id'>) => {
    const audit = user ? { user_id: user.id, username: user.name } : {};
    const newDriver = await addDriver(driver, audit);
    setDrivers(prev => [...prev, newDriver]);
  };
  const updateDriver = async (id: string, driver: Partial<Driver>) => {
    const audit = user ? { user_id: user.id, username: user.name } : {};
    const updated = await editDriver(id, driver, audit);
    setDrivers(prev => prev.map(d => d.id === id ? updated : d));
  };
  const deleteDriver = async (id: string) => {
    await removeDriver(id);
    setDrivers(prev => prev.filter(d => d.id !== id));
  };
  
  const createMixer = async (mixer: Omit<Mixer, 'id'>) => {
    const audit = user ? { user_id: user.id, username: user.name } : {};
    const newMixer = await addMixer(mixer, audit);
    if (newMixer && newMixer.error) {
      // No modificar el estado si hay error (ej: placa duplicada)
      return newMixer;
    }
    setMixers(prev => {
      const updated = [...prev, newMixer];
      return updated.sort((a, b) => (a.internal_code || '').localeCompare(b.internal_code || ''));
    });
    return newMixer;
  };
  const updateMixer = async (id: string, mixer: Partial<Mixer>) => {
    const audit = user ? { user_id: user.id, username: user.name } : {};
    const updatedMixer = await editMixer(id, mixer, audit);
    if (updatedMixer && updatedMixer.error) {
      // No modificar el estado si hay error (ej: placa duplicada)
      return updatedMixer;
    }
    setMixers(prev => {
      const updated = prev.map(m => m.id === id ? updatedMixer : m);
      return updated.sort((a, b) => (a.internal_code || '').localeCompare(b.internal_code || ''));
    });
    return updatedMixer;
  };
  const deleteMixer = async (id: string) => {
    await removeMixer(id);
    setMixers(prev => {
      const updated = prev.filter(m => m.id !== id);
      return updated.sort((a, b) => (a.internal_code || '').localeCompare(b.internal_code || ''));
    });
  };

  const createProject = async (project: Omit<Project, 'id'>) => {
    const audit = user ? { user_id: user.id, username: user.name } : {};
    await addProject({ ...project, ...audit });
    const dbProjects = await fetchProjects();
    setProjects(dbProjects);
  };
  const createReport = async (report: Omit<Report, 'id'>) => {
    const audit = user ? { user_id: user.id, username: user.name } : {};
    const newReport = await addReport(report, audit);
    setReports(prev => [newReport, ...prev]);
    return newReport;
  };
  const updateProject = async (id: string, project: Partial<Project>) => {
    const audit = user ? { user_id: user.id, username: user.name } : {};
    await editProject(id, { ...project, ...audit });
    const dbProjects = await fetchProjects();
    setProjects(dbProjects);
  };
  const deleteProject = async (id: string) => {
    await removeProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  return (
    <AppDataContext.Provider value={{ clients, mixers, drivers, projects, reports, createReport, createClient, updateClient, deleteClient, createDriver, updateDriver, deleteDriver, createMixer, updateMixer, deleteMixer, createProject, updateProject, deleteProject }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = React.useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}
