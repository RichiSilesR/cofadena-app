"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Gauge, Cpu, PlayCircle, RotateCcw, Scale } from "lucide-react"; // Importar 'Scale' para el botón Tara
import { cn } from "@/lib/utils"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useAppData } from '@/context/app-data-context';
import type { Client, Project, Mixer, Driver } from '@/lib/data';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

// URL y constantes
const BACKEND_URL = "http://localhost:3000/api";
const MAX_ARIDO_KG = 33;

// --- PALETA DE COLORES PROFESIONAL (CELESTE OSCURO/CYAN) - Dual Light/Dark Mode ---
const ACCENT_COLOR_TEXT = 'text-sky-600 dark:text-sky-400';
const ACCENT_BUTTON = 'bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600';
const PAGE_BG = 'bg-gray-100 dark:bg-slate-900'; 
const CARD_BG = 'bg-white dark:bg-slate-800 shadow-lg dark:border dark:border-slate-700';
const TEXT_PRIMARY = 'text-gray-900 dark:text-white';
const TEXT_MUTED = 'text-gray-500 dark:text-slate-400';
const INPUT_FIELD_BG = 'bg-gray-50 dark:bg-slate-900';
const INPUT_BORDER = 'border-gray-300 dark:border-slate-700';
const FOCUS_RING = 'focus:ring-sky-500 dark:focus:ring-sky-400';

// ----------------------------------------------------------------------
// SUB-COMPONENTES DE UI
// ----------------------------------------------------------------------

/**
 * Tarjeta de Datos Reutilizable para Métricas Principales.
 */
const DataCard: React.FC<{ title: string; value: string | number; unit?: string; isError?: boolean; className?: string; children?: React.ReactNode }> = ({ title, value, unit, isError = false, className = "", children }) => (
    <div
        className={cn(
            "flex flex-col justify-center items-center p-6 rounded-xl shadow-xl transition-all duration-500 min-h-[180px] relative", // Añadido 'relative' para posicionar elementos internos
            CARD_BG,
            isError 
                ? 'bg-red-600 dark:bg-red-800 border-red-500 dark:border-red-500 animate-pulse' 
                : 'border-b-4 border-sky-500 dark:border-sky-700', 
            className
        )}
    >
        <div className={cn("text-sm font-semibold mb-2", isError ? 'text-white' : ACCENT_COLOR_TEXT)}>
            {title}
        </div>
        <div className={cn("text-6xl font-extrabold tracking-tight", isError ? 'text-white' : TEXT_PRIMARY)}>
            {value}
        </div>
        {unit && <div className={cn("text-lg font-medium", TEXT_MUTED, "mt-1")}>{unit}</div>}
        {children} {/* Permite renderizar el botón Tara dentro de la tarjeta */}
    </div>
);

// --- CÓDIGO AÑADIDO/MODIFICADO: BOTÓN TARA (V10.2) ---

/**
 * Componente Botón TARA con lógica de mantener pulsado (mousedown/mouseup) y estilo mejorado.
 * MODIFICADO: Posición (left-4), tamaño (w-auto, py-1, px-4), fuente (text-base)
 */
const TaraButton: React.FC<{ enviarManualCommand: (action: 'on' | 'off') => Promise<void>; isLoading: boolean }> = ({ enviarManualCommand, isLoading }) => {
    // Estado visual para indicar que está pulsado
    const [isPressed, setIsPressed] = useState(false);
    
    // Función de evento para PRESIONAR (TRUE en PLC)
    const handlePress = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        // Prevenir el comportamiento por defecto en táctil
        if ('preventDefault' in e) e.preventDefault(); 
        if (isLoading) return;
        setIsPressed(true);
        enviarManualCommand('on');
    }, [enviarManualCommand, isLoading]);

    // Función de evento para SOLTAR (FALSE en PLC)
    const handleRelease = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if ('preventDefault' in e) e.preventDefault();
        if (isLoading) return;
        // Solo enviar el comando si realmente estaba presionado
        if (isPressed) {
            setIsPressed(false);
            enviarManualCommand('off');
        }
    }, [enviarManualCommand, isLoading, isPressed]);

    // Opcional: Para evitar que se quede pegado si el mouse sale del área
    useEffect(() => {
        const handleGlobalRelease = () => {
            if (isPressed) {
                // Llama a handleRelease para enviar 'off' y resetear isPressed
                handleRelease({} as React.MouseEvent); 
            }
        };
        // Agregar listeners al documento para capturar el soltar fuera del botón
        document.addEventListener('mouseup', handleGlobalRelease);
        document.addEventListener('touchend', handleGlobalRelease);
        return () => {
            document.removeEventListener('mouseup', handleGlobalRelease);
            document.removeEventListener('touchend', handleGlobalRelease);
        };
    }, [isPressed, handleRelease]);


    return (
        <button
            className={cn(
                // MODIFICADO: Posición (absolute bottom-4 left-4), tamaño (w-auto, py-1, px-4), fuente (text-base)
                "absolute bottom-4 left-4 w-auto py-1 px-4 text-base font-semibold rounded-lg shadow-md transition-all duration-200 flex items-center justify-center",
                "transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
                // Estilo basado en si está presionado, similar al ACCENT_BUTTON
                isPressed 
                    ? 'bg-sky-800 text-white shadow-xl shadow-sky-500/50 dark:shadow-sky-800/50 border-t-2 border-b-4 border-sky-400 dark:border-sky-600'
                    : ACCENT_BUTTON + ' border-b-4 border-sky-700 dark:border-sky-500 hover:border-b-2', // Estilo normal
                isLoading && 'opacity-50 cursor-not-allowed'
            )}
            title="TARA (Mantener Pulsado) - DB1,X10.1"
            onMouseDown={handlePress as React.MouseEventHandler}
            onMouseUp={handleRelease as React.MouseEventHandler}
            onTouchStart={handlePress as React.TouchEventHandler}
            onTouchEnd={handleRelease as React.TouchEventHandler}
            disabled={isLoading}
        >
            TARA
        </button>
    );
};

// --- FIN DEL CÓDIGO AÑADIDO/MODIFICADO ---

/**
 * Componente para el control individual de cada Árido. (sin cambios)
 */
const AridoControl: React.FC<{ aridoNum: number; value: number; setValue: (val: string) => void; handleConsigna: (arido: number, value: number) => void; isLoading: boolean }> = ({ aridoNum, value, setValue, handleConsigna, isLoading }) => {
    const isReady = value > 0;
    return (
        <div
            className={cn(
                "flex flex-col rounded-xl shadow-xl p-6 transition-all duration-300",
                CARD_BG,
                isReady
                    ? 'border-l-4 border-sky-500 dark:border-sky-700 shadow-sky-300/30 dark:shadow-sky-800/30' 
                    : 'border-l-4 border-gray-200 dark:border-slate-700' 
            )}
        >
            <div className="flex items-center justify-between mb-4">
                <span className={cn("text-lg font-bold", TEXT_PRIMARY)}>Árido {aridoNum}</span>
                <Cpu className={cn("h-5 w-5", isReady ? ACCENT_COLOR_TEXT + ' animate-bounce-slow' : TEXT_MUTED)} />
            </div>

            <label className={cn("text-xs mb-1", TEXT_MUTED)}>Consigna ({MAX_ARIDO_KG} KG max)</label>
            <input
                type="number"
                min="0"
                max={MAX_ARIDO_KG}
                className={cn(
                    "w-full p-3 text-2xl font-bold border-2 rounded-lg text-center transition-colors duration-300 focus:outline-none focus:ring-2",
                    INPUT_FIELD_BG, 
                    INPUT_BORDER, 
                    FOCUS_RING, 
                    isReady ? ACCENT_COLOR_TEXT : TEXT_PRIMARY 
                )}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={isLoading}
            />

            <button
                className={cn(
                    "w-full py-3 mt-5 font-semibold text-lg rounded-lg shadow-md transition-all duration-300",
                    "transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed",
                    isReady
                        ? ACCENT_BUTTON
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300' 
                )}
                onClick={() => handleConsigna(aridoNum, value)}
                disabled={isLoading}
            >
                {isLoading ? 'Enviando...' : `Establecer ${value} KG`}
            </button>
        </div>
    );
};

// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL DE LA PÁGINA
// ----------------------------------------------------------------------

export default function ParametrosPage() {
    // ... (Estados y Contexto sin cambios)
    const formRef = useRef<HTMLDivElement | null>(null);
    const [clienteId, setClienteId] = useState('');
    const [proyectoId, setProyectoId] = useState('');
    const [mixerId, setMixerId] = useState('');
    const [choferId, setChoferId] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const maxObservaciones = 400;
    const observRef = useRef<HTMLTextAreaElement | null>(null);

    const { clients, projects, mixers, drivers } = useAppData();
    const [reports, setReports] = useState<any[]>([]);
    const [pesoActual, setPesoActual] = useState("Cargando...");
    const [arido1, setArido1] = useState(0);
    const [arido2, setArido2] = useState(0);
    const [arido3, setArido3] = useState(0);
    const [pesoTotal, setPesoTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isError = pesoActual === "ERROR";

    // ... (Efectos y Handlers de Modal sin cambios)
    useEffect(() => {
        if (isModalOpen && formRef.current) {
            const first = formRef.current.querySelector('input, select, textarea, button');
            if (first) (first as HTMLElement).focus();
        }
    }, [isModalOpen]);

    const canStart = Boolean(clienteId && proyectoId && mixerId && choferId);
    const [savedProduction, setSavedProduction] = useState<{
        clienteId: string;
        proyectoId: string;
        mixerId: string;
        choferId: string;
        observaciones: string;
    } | null>(null);

    const [guardarError, setGuardarError] = useState<string | null>(null);
    const [guardarSuccess, setGuardarSuccess] = useState<string | null>(null);

    const handleGuardar = useCallback(() => {
        if (!clienteId || !proyectoId || !mixerId || !choferId) {
            setGuardarError('Por favor selecciona Cliente, Proyecto, Mixer y Chofer antes de guardar.');
            return;
        }
        setGuardarError(null);
        setSavedProduction({ clienteId, proyectoId, mixerId, choferId, observaciones });
        setIsModalOpen(false);
    }, [clienteId, proyectoId, mixerId, choferId, observaciones]);

    const canStartProduction = Boolean(savedProduction && savedProduction.clienteId && savedProduction.proyectoId && savedProduction.mixerId && savedProduction.choferId);

    // --- MANEJO DE LÓGICA (Consignas y Pulsos sin cambios) ---

    const handleAridoChange = useCallback((setArido: React.Dispatch<React.SetStateAction<number>>, value: string) => {
        const numericValue = Math.min(Math.max(parseInt(value, 10) || 0, 0), MAX_ARIDO_KG);
        setArido(numericValue);
    }, []);

    const enviarConsigna = async (arido: number, value: number) => {
        setIsLoading(true);
        const datos = { arido, value };
        try {
            const response = await fetch(`${BACKEND_URL}/consigna`, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos),
            });
            if (!response.ok) throw new Error(`Error ${response.status}`);
            console.log(`Consigna para Árido ${arido} enviada correctamente.`);
        } catch (error) {
            console.error("Error al enviar consigna:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const enviarPulso = async (endpoint: string) => {
        setIsLoading(true);
        try {
            const url = `${BACKEND_URL}/${endpoint}`.replace(/([^:]\/\/)\/+/g, '$1');
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) throw new Error(`Error ${response.status}`);
            console.log(`Comando ${endpoint} enviado con éxito a ${url}.`);
        } catch (error) {
            console.error("Error de red al enviar pulso:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- LÓGICA DEL BOTÓN MANUAL/TARA (sin cambios en la lógica, solo en el nombre de la función) ---

    const enviarManualCommand = useCallback(async (action: 'on' | 'off') => {
        setIsLoading(true);
        try {
            // Llama al nuevo endpoint /api/manual con la acción 'on' o 'off'
            const url = `${BACKEND_URL}/manual`.replace(/([^:]\/\/)\/+/g, '$1');
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            if (!response.ok) throw new Error(`Error ${response.status}`);
            console.log(`Comando manual/Tara (${action.toUpperCase()}) enviado.`);
        } catch (error) {
            console.error(`Error al enviar comando manual (${action}):`, error);
        } finally {
            // Solo desactivamos el indicador de carga general si la acción es 'off' 
            // para no bloquear la interfaz mientras el usuario mantiene pulsado.
            if (action === 'off') {
                setIsLoading(false);
            }
        }
    }, [setIsLoading]);

    // --- FIN DE LÓGICA DEL BOTÓN MANUAL/TARA ---

    // ... (Lógica de peso y peso total sin cambios)
    const bc = (typeof window !== 'undefined' && 'BroadcastChannel' in window) ? new BroadcastChannel('cofadena-plc') : null;

    useEffect(() => {
        const actualizarPesoActual = () => {
            fetch(`${BACKEND_URL}/peso_actual`)
                .then((response) => response.text())
                .then((peso) => setPesoActual(peso))
                .catch(() => setPesoActual("ERROR"));
        };
        const interval = setInterval(actualizarPesoActual, 500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setPesoTotal(arido1 + arido2 + arido3);
    }, [arido1, arido2, arido3]);


    // --- RENDERIZADO ---
    return (
        <div className={cn("min-h-screen w-full flex flex-col items-center p-8 font-sans", PAGE_BG)}>
            <div className="w-full max-w-5xl mb-8 flex items-center justify-between">
                <div className="flex items-center">
                    <Gauge className={cn("inline-block h-6 w-6 mr-2 align-text-top", ACCENT_COLOR_TEXT)} />
                    <h2 className={cn("text-2xl md:text-3xl font-extrabold tracking-wide pb-1", TEXT_PRIMARY, "border-b-4 border-sky-500 dark:border-sky-700")}>
                        Panel SCADA | Parámetros de Producción
                    </h2>
                </div>

                {/* Botón para abrir la ventana modal */}
                <div className="ml-4">
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-4 py-2 bg-sky-700 text-white rounded-lg shadow-md hover:bg-sky-800"
                            >
                                Datos de Producción
                            </button>
                        </DialogTrigger>

                        {/* Contenido del Modal (sin cambios) */}
                        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]" ref={formRef} aria-modal="true" role="dialog">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold mb-4">Añadir Datos de Producción</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Selects de Cliente, Proyecto, Mixer, Chofer (sin cambios) */}
                                    {/* Nota: Este código está omitido por brevedad en la respuesta, pero asume que están aquí */}
                                    
                                    <label className={cn("text-sm font-medium", TEXT_PRIMARY)}>Cliente</label>
                                    <Select onValueChange={setClienteId} value={clienteId}>
                                        <SelectTrigger className={cn(CARD_BG, INPUT_BORDER, FOCUS_RING)}><SelectValue placeholder="Selecciona Cliente" /></SelectTrigger>
                                        <SelectContent className={CARD_BG}>
                                            {clients?.map((client: Client) => (<SelectItem key={client.id} value={String(client.id)}>{client.name}</SelectItem>))}
                                        </SelectContent>
                                    </Select>

                                    <label className={cn("text-sm font-medium", TEXT_PRIMARY)}>Proyecto</label>
                                    <Select onValueChange={setProyectoId} value={proyectoId}>
                                        <SelectTrigger className={cn(CARD_BG, INPUT_BORDER, FOCUS_RING)}><SelectValue placeholder="Selecciona Proyecto" /></SelectTrigger>
                                        <SelectContent className={CARD_BG}>
                                            {projects?.map((project: Project) => (<SelectItem key={project.id} value={String(project.id)}>{project.project_name}</SelectItem>))}
                                        </SelectContent>
                                    </Select>

                                    <label className={cn("text-sm font-medium", TEXT_PRIMARY)}>Mixer (Placa)</label>
                                    <Select onValueChange={setMixerId} value={mixerId}>
                                        <SelectTrigger className={cn(CARD_BG, INPUT_BORDER, FOCUS_RING)}><SelectValue placeholder="Selecciona Mixer" /></SelectTrigger>
                                        <SelectContent className={CARD_BG}>
                                            {mixers?.map((mixer: Mixer) => (<SelectItem key={mixer.id} value={String(mixer.id)}>{mixer.alias} ({mixer.plate})</SelectItem>))}
                                        </SelectContent>
                                    </Select>

                                    <label className={cn("text-sm font-medium", TEXT_PRIMARY)}>Chofer</label>
                                    <Select onValueChange={setChoferId} value={choferId}>
                                        <SelectTrigger className={cn(CARD_BG, INPUT_BORDER, FOCUS_RING)}><SelectValue placeholder="Selecciona Chofer" /></SelectTrigger>
                                        <SelectContent className={CARD_BG}>
                                            {drivers?.map((driver: Driver) => (<SelectItem key={driver.id} value={String(driver.id)}>{driver.name}</SelectItem>))}
                                        </SelectContent>
                                    </Select>

                                    <div className="md:col-span-2">
                                        <label htmlFor="observaciones" className={cn("text-sm font-medium mb-1 block", TEXT_PRIMARY)}>
                                            Observaciones ({observaciones.length}/{maxObservaciones})
                                        </label>
                                        <Textarea
                                            ref={observRef}
                                            id="observaciones"
                                            value={observaciones}
                                            onChange={(e) => setObservaciones(e.target.value.substring(0, maxObservaciones))}
                                            placeholder="Añade comentarios o detalles adicionales aquí..."
                                            className={cn(CARD_BG, INPUT_BORDER, FOCUS_RING)}
                                        />
                                    </div>

                                </div>
                                <div className="flex justify-end space-x-4 mt-4">
                                    <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <div className="flex flex-col items-end">
                                        <Button
                                            type="button"
                                            className={cn(ACCENT_BUTTON, !canStart && 'opacity-50 cursor-not-allowed')}
                                            disabled={!canStart}
                                            aria-disabled={!canStart}
                                            title={!canStart ? 'Selecciona Cliente, Proyecto, Mixer y Chofer antes de guardar' : 'Guardar datos de producción'}
                                            onClick={() => handleGuardar()}
                                        >
                                            Guardar
                                        </Button>
                                        {!canStart && (
                                            <div className="text-xs text-slate-400 mt-2">Selecciona Cliente, Proyecto, Mixer y Chofer para habilitar Guardar</div>
                                        )}
                                        {guardarError && <div className="text-xs text-red-500 mt-2">{guardarError}</div>}
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            {/* Mensajes de éxito/error */}
            {guardarSuccess && <div className="text-sm text-green-500 mb-4">{guardarSuccess}</div>}
            {guardarError && <div className="text-sm text-red-500 mb-4">{guardarError}</div>}

            {/* Grid de Métricas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mb-12">
                <DataCard
                    title="PESO ACTUAL"
                    value={pesoActual}
                    unit="KG"
                    isError={isError}
                >
                    {/* --- AQUÍ SE INSERTA EL BOTÓN TARA MODIFICADO --- */}
                    <TaraButton 
                        enviarManualCommand={enviarManualCommand} 
                        isLoading={isLoading} 
                    />
                    {/* -------------------------------------- */}
                </DataCard>
                <DataCard
                    title="PESO TOTAL PROGRAMADO"
                    value={pesoTotal.toFixed(0)}
                    unit="KG"
                />
            </div>

            {/* Controles de Áridos (sin cambios) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
                <AridoControl
                    aridoNum={1}
                    value={arido1}
                    setValue={(val: string) => handleAridoChange(setArido1, val)}
                    handleConsigna={enviarConsigna}
                    isLoading={isLoading}
                />
                <AridoControl
                    aridoNum={2}
                    value={arido2}
                    setValue={(val: string) => handleAridoChange(setArido2, val)}
                    handleConsigna={enviarConsigna}
                    isLoading={isLoading}
                />
                <AridoControl
                    aridoNum={3}
                    value={arido3}
                    setValue={(val: string) => handleAridoChange(setArido3, val)}
                    handleConsigna={enviarConsigna}
                    isLoading={isLoading}
                />
            </div>

            {/* Botones de Control Principal (Iniciar/Reset sin cambios en la lógica) */}
            <div className="flex flex-col items-center gap-4 mt-16 w-full max-w-5xl">
                <div className="flex justify-center gap-10 w-full">
                    <button
                        className={cn(
                            "w-full md:w-1/2 py-5 flex items-center justify-center font-extrabold text-2xl rounded-xl shadow-2xl transition-all duration-300",
                            "transform hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
                            (isLoading || !canStartProduction) 
                                ? 'bg-gray-300 text-gray-700 dark:bg-slate-700 dark:text-slate-400' 
                                : 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/50 dark:shadow-green-700/50'
                        )}
                        onClick={async () => {
                            // ... (Lógica de guardar reporte y enviar pulso 'start' sin cambios)
                            if (!canStartProduction) return;
                            setIsLoading(true);
                            let saveSucceeded = false;
                            try {
                                const now = new Date().toISOString();
                                const clientObj = clients?.find((c: Client) => String(c.id) === savedProduction?.clienteId);
                                const projectObj = projects?.find((p: Project) => String(p.id) === savedProduction?.proyectoId);
                                const mixerObj = mixers?.find((m: Mixer) => String(m.id) === savedProduction?.mixerId);
                                const driverObj = drivers?.find((d: Driver) => String(d.id) === savedProduction?.choferId);

                                const payload = {
                                    occurred_at: now,
                                    arido1: arido1,
                                    arido2: arido2,
                                    arido3: arido3,
                                    clientId: savedProduction?.clienteId,
                                    projectId: savedProduction?.proyectoId,
                                    mixerId: savedProduction?.mixerId,
                                    driverId: savedProduction?.choferId,
                                    client: clientObj?.name ?? '',
                                    project: projectObj?.project_name ?? '',
                                    mixer: mixerObj ? `${mixerObj.alias}${mixerObj.plate ? ' (' + mixerObj.plate + ')' : ''}` : '',
                                    driver: driverObj?.name ?? '',
                                    notes: savedProduction?.observaciones ?? ''
                                };
                                const res = await fetch('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                                const text = await res.text();
                                let json: any = null;
                                try { json = text ? JSON.parse(text) : null; } catch (e) { json = { raw: text }; }
                                if (!res.ok) {
                                    const errMsg = json && json.error ? json.error : (text || `Status ${res.status}`);
                                    throw new Error(errMsg);
                                }
                                const persisted = json?.meta?.persisted ?? 'db';
                                saveSucceeded = true;
                                if (persisted === 'memory') {
                                    setGuardarSuccess('Reporte guardado en memoria (BD no disponible). Se sincronizará cuando la BD esté lista.');
                                } else {
                                    setGuardarSuccess('Reporte guardado correctamente en la base de datos.');
                                }
                                setGuardarError(null);
                            } catch (err) {
                                console.error('No se pudo guardar el report antes de iniciar:', err);
                                setGuardarError(String(err));
                                setGuardarSuccess(null);
                            } finally {
                                setIsLoading(false);
                                if (saveSucceeded) {
                                    enviarPulso('start');
                                    try { bc?.postMessage({ type: 'start' }); } catch (e) { /* no-op */ }
                                    try {
                                        localStorage.setItem('cofadena-plc-last-start', JSON.stringify({ ts: Date.now(), type: 'start' }));
                                    } catch (e) { /* no-op si localStorage no está disponible */ }
                                }
                            }
                        }}
                        disabled={isLoading || !canStartProduction}
                        aria-disabled={isLoading || !canStartProduction}
                        title={!canStartProduction ? 'Guarda los datos de producción en la ventana "Datos de Producción" antes de iniciar' : 'Iniciar producción'}
                    >
                        <PlayCircle className="h-6 w-6 mr-3" />
                        INICIAR PRODUCCIÓN
                    </button>

                    <button
                        className={cn(
                            "w-full md:w-1/2 py-5 flex items-center justify-center font-extrabold text-2xl rounded-xl shadow-2xl transition-all duration-300",
                            "transform hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
                            isLoading 
                                ? 'bg-gray-300 text-gray-700 dark:bg-slate-700 dark:text-slate-400' 
                                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/50 dark:shadow-red-700/50'
                        )}
                        onClick={() => {
                            enviarPulso("reset");
                            try { bc?.postMessage({ type: 'reset' }); } catch (e) { /* no-op */ }
                            try {
                                localStorage.setItem('cofadena-plc-last-start', JSON.stringify({ ts: Date.now(), type: 'reset' }));
                            } catch (e) { }
                        }}
                        disabled={isLoading}
                    >
                        <RotateCcw className="h-6 w-6 mr-3" />
                        RESET SISTEMA
                    </button>
                </div>
                {!canStartProduction && (
                    <div className="text-sm text-slate-400">Guarda los datos de producción en la ventana "Datos de Producción" para habilitar el botón INICIAR PRODUCCIÓN.</div>
                )}
            </div>
            
            <footer className={cn("mt-16 text-sm", TEXT_MUTED)}>
                Control IoT de
            </footer>
        </div>
    );
}