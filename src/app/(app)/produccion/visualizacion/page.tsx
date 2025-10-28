"use client";
import React, { useState, useEffect } from "react";
// Importamos Gauge, Zap, AlertTriangle, Package, Scale, ArrowRight, ArrowUpRight, y ArrowDown
import { Gauge, Zap, AlertTriangle, Package, Scale, ArrowRight, ArrowUpRight, ArrowDown } from "lucide-react"; 
import { cn } from "@/lib/utils"; 

// --- CONFIGURACIÓN DE URL Y CONSTANTES ---
const NODE_RED_URL = "http://localhost:1880/api/estados_planta";

interface EstadosPlanta {
  compuerta1: boolean;
  compuerta2: boolean;
  compuerta3: boolean;
  cintaTransportadora: boolean;
  descarga: boolean;
  running: boolean; // Se mantiene en la interfaz, pero el valor se ignora/deriva en el render.
  pesoActual: number;
}

const initialStates: EstadosPlanta = {
  compuerta1: false,
  compuerta2: false,
  compuerta3: false,
  cintaTransportadora: false,
  descarga: false,
  running: false,
  pesoActual: 0,
};

// --- PALETA DUAL (LIGHT/DARK MODE) ---
const ACCENT_COLOR_TEXT = 'text-sky-600 dark:text-cyan-400';
const PAGE_BG = 'bg-gray-100 dark:bg-slate-900'; 
const CARD_BG = 'bg-white dark:bg-slate-800 shadow-xl dark:border dark:border-slate-700';
const TEXT_PRIMARY = 'text-gray-900 dark:text-white';
const SIDEBAR_HEADER_BG = 'bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-800';

// --- COLORES DE MATERIAL (AMARILLO/ÁMBAR TIPO SCADA) ---
const MATERIAL_FLOW_COLOR = 'bg-amber-400/80 shadow-lg shadow-amber-400/50'; 
const MATERIAL_DROP_COLOR = 'bg-orange-500';

// ------------------------------------------------------------------
// ⭐ CLASES DE BOTONES SCADA PROFESIONALES CON PARPADEO (RUN/STOP) ⭐
// ------------------------------------------------------------------

/**
 * Clase para el botón de Estado General (RUNNING/STOP) con animación de parpadeo.
 */
const getRunStopButtonClass = (isRunning: boolean) => {
    // Clase base ajustada para un solo texto, eliminando 'flex-col' para un centrado más limpio.
    const base = "flex items-center justify-center p-2 rounded-lg text-white transition-all duration-300 transform font-extrabold text-base min-w-[140px] whitespace-nowrap uppercase h-12 cursor-pointer";
    const run = 'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/50 dark:shadow-emerald-700/50 ring-2 ring-emerald-300 dark:ring-emerald-700';
    const stop = 'bg-gradient-to-br from-red-600 to-red-800 shadow-lg shadow-red-600/50 dark:shadow-red-800/50 ring-2 ring-red-300 dark:ring-red-700';
    
    // Aplicamos la animación de parpadeo correspondiente
    const blink = isRunning ? 'animate-pulse-green' : 'animate-pulse-red';

    return cn(
        base,
        isRunning ? run : stop,
        blink
    );
};

/**
 * Clase para botones de Compuerta (OPEN/CLOSED)
 */
const getCompButtonClass = (isActive: boolean) => 
  isActive 
    ? 'bg-gradient-to-br from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white shadow-lg shadow-green-500/50 dark:shadow-green-700/50 ring-2 ring-green-300 dark:ring-green-700'
    : 'bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white shadow-lg shadow-red-600/50 dark:shadow-red-800/50 ring-2 ring-red-300 dark:ring-red-700';

/**
 * Clase para el botón de Cinta con animación de parpadeo.
 */
const getCintaButtonClass = (isActive: boolean) => {
    const base = "flex items-center justify-center px-3 py-1.5 font-extrabold rounded-lg text-xs transition-all duration-300 min-w-[90px] whitespace-nowrap uppercase";
    // La cinta solo parpadea en verde si está activa
    const run = 'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/50 dark:shadow-emerald-700/50 ring-2 ring-emerald-300 dark:ring-emerald-700 animate-pulse-green';
    const stop = 'bg-gradient-to-br from-red-600 to-red-800 shadow-lg shadow-red-600/50 dark:shadow-red-800/50 ring-2 ring-red-300 dark:ring-red-700'; // No parpadea en rojo

    return cn(
        base,
        isActive ? run : stop
    );
};


// ------------------------------------------------------------------

// --- COMPONENTE PRINCIPAL ---
export default function Visualizacion() {
  const [estados, setEstados] = useState<EstadosPlanta>(initialStates);
  const [isPollingError, setIsPollingError] = useState(false);
  const [showDrop, setShowDrop] = useState(false); 
    // BroadcastChannel y localStorage logic is kept for potential future use with Start/Reset buttons
    const [bc] = useState(() => {
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            try { return new BroadcastChannel('cofadena-plc'); } catch (e) { return null; }
        }
        return null;
    });

  
  const { 
    compuerta1: isCompuerta1Active, 
    compuerta2: isCompuerta2Active,
    compuerta3: isCompuerta3Active,
    cintaTransportadora: isCintaActive,
    descarga: isDescargaActive,
    pesoActual 
  } = estados;
  
// ⭐ CORRECCIÓN: isRunning es un estado DERIVADO de las compuertas o la cinta activa. ⭐
const isRunning = isCompuerta1Active || isCompuerta2Active || isCompuerta3Active || isCintaActive;


  useEffect(() => {
        const fetchEstadosPlanta = async () => {
            try {
                const response = await fetch(NODE_RED_URL);
                if (!response.ok) {
                    throw new Error("Error al obtener estados del PLC.");
                }
                const raw: any = await response.json();
                
                // Eliminamos la lógica antigua de 'derivedRunning' ya que se calcula fuera del useEffect.
                const data: EstadosPlanta = {
                    compuerta1: Boolean(raw.compuerta1),
                    compuerta2: Boolean(raw.compuerta2),
                    compuerta3: Boolean(raw.compuerta3),
                    cintaTransportadora: Boolean(raw.cintaTransportadora),
                    descarga: Boolean(raw.descarga),
                    // Forzamos a 'false' o ignoramos este valor ya que el estado real se deriva arriba.
                    running: false, 
                    pesoActual: Number(raw.pesoActual || 0),
                };

                setEstados(data);
                setIsPollingError(false);
            } catch (error) {
                console.error("Error en Polling:", error);
                setIsPollingError(true);
            }
        };

    // Polling cada 500ms
    const intervalId = setInterval(fetchEstadosPlanta, 500);
    return () => clearInterval(intervalId);
  }, []);

    // Listener para BroadcastChannel y Storage. NOTA: Si estos eventos se disparan, 
    // actualizarán el campo 'running' del estado, pero la variable 'isRunning' 
    // seguirá siendo gobernada por la lógica de las compuertas y cinta, lo cual es correcto para su objetivo.
    useEffect(() => {
        let mounted = true;
        const handleMessage = (ev: MessageEvent) => {
            if (!mounted) return;
            try {
                const msg = ev.data;
                if (!msg || !msg.type) return;
                if (msg.type === 'start') setEstados((prev) => ({ ...prev, running: true }));
                else if (msg.type === 'reset') setEstados((prev) => ({ ...prev, running: false }));
            } catch (e) { /* ignore malformed */ }
        };

        if (bc) {
            bc.addEventListener('message', handleMessage as any);
        }

        // Fallback: escuchar storage events (cuando otra pestaña escribe en localStorage)
        const onStorage = (e: StorageEvent) => {
            if (!mounted) return;
            if (!e.key) return;
            if (e.key === 'cofadena-plc-last-start') {
                try {
                    const payload = e.newValue ? JSON.parse(e.newValue) : null;
                    if (payload && payload.type === 'start') setEstados((prev) => ({ ...prev, running: true }));
                    else if (payload && payload.type === 'reset') setEstados((prev) => ({ ...prev, running: false }));
                } catch (err) { /* ignore parse errors */ }
            }
        };

        window.addEventListener('storage', onStorage as any);

        return () => {
            mounted = false;
            try {
                if (bc) {
                    bc.removeEventListener('message', handleMessage as any);
                    bc.close();
                }
            } catch (e) { /* ignore */ }
            window.removeEventListener('storage', onStorage as any);
        };
    }, [bc]);
  
  useEffect(() => {
    if (isDescargaActive && !showDrop) {
      setShowDrop(true);
      
      const timer = setTimeout(() => {
        setShowDrop(false);
      }, 1050); 

      return () => clearTimeout(timer);
    }
  }, [isDescargaActive, showDrop]);


  // Estilos base para la flecha.
  const arrowBaseClasses = "absolute h-6 w-6 text-amber-300 opacity-90 transition-opacity duration-300 animate-pulse-slow z-20";


  return ( 
    <div className={cn("min-h-screen w-full flex flex-col items-center p-8 font-sans", PAGE_BG)}>
      
            {/* Contenedor de cabecera con mismo fondo/borde que el sidebar */}
            <div className={cn("w-full max-w-5xl rounded-md mb-4 overflow-hidden", SIDEBAR_HEADER_BG)}>
                <div className="flex items-center h-14 px-4 lg:h-[60px] lg:px-6">
                    <h1 className={cn("text-lg font-bold m-0 flex items-center gap-2", TEXT_PRIMARY)}>
                        <Zap className={cn("inline-block h-5 w-5", ACCENT_COLOR_TEXT)} />
                        Visualización SCADA
                    </h1>
                </div>
            </div>

      {/* Indicador de Error de Conexión (Se mantiene si existe) */}
      {isPollingError && (
        <div className="flex items-center p-3 mb-6 rounded-lg font-semibold text-sm bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 shadow-md w-full max-w-5xl">
          <AlertTriangle className="w-5 h-5 mr-2" />
          ERROR: No se puede conectar a Node-RED.
        </div>
      )}

      <style jsx global>{`
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.9; }
            50% { opacity: 0.4; }
          }
          .animate-pulse-slow {
            animation: pulse-slow 1s infinite;
          }
          @keyframes pulse-slower {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
          .animate-pulse-slower {
            animation: pulse-slower 1.5s infinite;
          }
          @keyframes drop {
            0% { transform: translateY(-50px); opacity: 1; }
            100% { transform: translateY(12px); opacity: 0; }
          }
          .animate-drop {
            animation: drop 1s ease-in forwards;
          }
          /* Animaciones para el botón RUN/STOP (MODERNO/REALISTA) */
          @layer components {
            @keyframes pulse-green-animation {
              0%, 100% { box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.5), 0 2px 4px -2px rgba(16, 185, 129, 0.5); }
              50% { box-shadow: 0 4px 20px 0px rgba(16, 185, 129, 1), 0 2px 4px -2px rgba(16, 185, 129, 0.5); }
            }
            .animate-pulse-green {
              animation: pulse-green-animation 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            @keyframes pulse-red-animation {
              0%, 100% { box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.5), 0 2px 4px -2px rgba(239, 68, 68, 0.5); }
              50% { box-shadow: 0 4px 20px 0px rgba(239, 68, 68, 1), 0 2px 4px -2px rgba(239, 68, 68, 0.5); }
            }
            .animate-pulse-red {
              animation: pulse-red-animation 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
          }
        `}</style>


      {/* Contenedor principal de Visualización (Card Grande - ALTURA 650px) */}
      <div className={cn("relative w-full max-w-5xl h-[650px] overflow-hidden rounded-2xl border-4 border-sky-500/50 dark:border-cyan-700/70 shadow-2xl", CARD_BG)}>
        
        {/* ⭐ BOTÓN RUN/STOP (Ahora responde al estado isRunning derivado) ⭐ */}
        <div 
          className={cn(getRunStopButtonClass(isRunning), "absolute z-50")}
          style={{ 
            top: '20px', 
            left: '460px' 
          }}
        >
          {isRunning ? 'RUNNING' : 'DETENIDO'}
        </div>
        
        {/* Imagen SCADA como fondo del div */}
        <div 
          className="absolute inset-0 bg-no-repeat"
          style={{ 
            backgroundImage: 'url(/images/scada.png)', 
            backgroundSize: '100%', 
            backgroundPosition: 'center center' 
          }} 
        >
          
          {/* --- INDICADORES DE COMPUERTA (Activos y Sostenidos) --- */}
          {isCompuerta1Active && (
                <div
                    className="absolute z-30" 
                    style={{ top: '323px', left: '871px', width: 0, height: 0, borderLeft: '15.5px solid transparent', borderRight: '15.5px solid transparent', borderTop: '12px solid #22C55E', transform: 'translateX(-50%)', filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.7))' }}
                />
            )}
            {isCompuerta2Active && (
                <div
                    className="absolute z-30" 
                    style={{ top: '323px', left: '770px', width: 0, height: 0, borderLeft: '15.5px solid transparent', borderRight: '15.5px solid transparent', borderTop: '12px solid #22C55E', transform: 'translateX(-50%)', filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.7))' }}
                />
            )}
            {isCompuerta3Active && (
                <div
                    className="absolute z-30" 
                    style={{ top: '323px', left: '671px', width: 0, height: 0, borderLeft: '15.5px solid transparent', borderRight: '15.5px solid transparent', borderTop: '12px solid #22C55E', transform: 'translateX(-50%)', filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.7))' }}
                />
            )}
            {isCintaActive && (
                <div
                    className="absolute z-30" 
                    style={{ top: '390px', left: '74.9%', width: 0, height: 5, borderLeft: '32.5px solid transparent', borderRight: '32.5px solid transparent', borderTop: '24.5px solid #22C55E', transform: 'translateX(-50%)', filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.7))' }}
                />
            )}
        
          {/* --- FLUJO DE MATERIAL E INDICADORES (FLECHAS) --- */}
          {/* Tramo Inclinado */}
          <div
            className={cn("absolute h-3 w-[500px] transition-all duration-600", isCintaActive ? `${MATERIAL_FLOW_COLOR} z-10 animate-pulse-slower` : "bg-transparent")}
            style={{ top: '105px', left: '22%', transform: 'rotate(42.5deg) translateY(-50%)', transformOrigin: 'left center'}}
          ></div>
          {isCintaActive && [1, 2, 3].map((i) => (
            <ArrowUpRight key={`inc-${i}`} className={arrowBaseClasses}
              style={{ top: `${125 + (i - 1) * 100}px`, left: `${28 + (i - 1) * 10.5}%`, transform: 'rotate(-87.5deg)', animationDelay: `${i * 0.15}s`}}
            />
          ))}
          {/* Tramo Horizontal */}
          <div
            className={cn("absolute h-3 w-[350px] transition-all duration-600", isCintaActive ? `${MATERIAL_FLOW_COLOR} z-10 animate-pulse-slower` : "bg-transparent")}
            style={{ top: '436.8px', left: '58.1%' }}
          ></div>
          {isCintaActive && [0, 1, 2, 3, 4].map((i) => (
            <ArrowRight key={`horiz-${i}`} className={arrowBaseClasses}
              style={{ top: '400.8px', left: `${80 - i * 5}%`, transform: 'rotate(180deg)', animationDelay: `${i * 0.15}s`}}
            />
          ))}

          {/* ⭐ INDICADOR DEL MOTOR (CUADRADO VERDE) ⭐ */}
          {isRunning && (
                <div
                    className="absolute bg-green-500/90 shadow-lg shadow-green-500/50 rounded-sm z-30 animate-pulse-green"
                    // Asegúrate que estas coordenadas sean las del motor en tu imagen
                    style={{ top: '455px', left: '988px', width: '26px', height: '26px'}}
                />
          )}

          {/* Medidor de Peso (Esquina superior derecha original) */}
          <div className={cn("absolute w-32 h-10 flex flex-col items-center justify-center rounded-sm font-mono", 
            'bg-slate-900/90 dark:bg-slate-900/90 border border-cyan-400 shadow-xl')}
            style={{ 
              top: '33px', 
              right: '20px', 
              transform: 'translateX(0%)' 
            }} 
          >
            <span className="text-xs text-cyan-400 leading-tight">PESO ACTUAL (KG)</span> 
            <span 
              className="text-xl font-bold text-white tracking-widest leading-none"
              style={{ transform: 'translateY(-21px)' }} 
            >
              {pesoActual.toFixed(1)}
            </span>
          </div>

          {/* Indicador de DESCARGA - Animación de Gota */}
          <div className="absolute" style={{ top: '480px', left: '26%', transform: 'translateX(-50%)' }}>
            {showDrop && ( 
              <div 
                className={cn("w-5 h-5 rounded-full bg-orange-500 shadow-2xl z-20", "animate-drop")}
              />
            )}
            <div 
              className={cn("w-3 h-3 rounded-full absolute top-5 left-1/2 -translate-x-1/2 transition-colors duration-300",
                isDescargaActive ? 'bg-orange-500/80' : 'bg-gray-400/50 dark:bg-slate-600/50'
              )}
            />
          </div>

        </div> 

      </div> {/* Fin Contenedor de Visualización */}

      <div className="flex justify-center gap-2 mt-8 w-full max-w-5xl overflow-hidden">
        
        {/* Botón Compuerta 1 */}
        <div 
          className={cn("flex items-center justify-center px-3 py-1.5 font-extrabold rounded-lg text-xs transition-all duration-300 min-w-[100px] whitespace-nowrap uppercase", getCompButtonClass(isCompuerta1Active))}
        >
          COMPUERTA 1
        </div>

        {/* Botón Compuerta 2 */}
        <div 
          className={cn("flex items-center justify-center px-3 py-1.5 font-extrabold rounded-lg text-xs transition-all duration-300 min-w-[100px] whitespace-nowrap uppercase", getCompButtonClass(isCompuerta2Active))}
        >
          COMPUERTA 2
        </div>

        {/* Botón Compuerta 3 */}
        <div 
          className={cn("flex items-center justify-center px-3 py-1.5 font-extrabold rounded-lg text-xs transition-all duration-300 min-w-[100px] whitespace-nowrap uppercase", getCompButtonClass(isCompuerta3Active))}
        >
          COMPUERTA 3
        </div>

        {/* Botón Cinta Transportadora - CON ANIMACIÓN DE PARPADEO */}
        <div 
          className={cn(
            getCintaButtonClass(isCintaActive)
          )}
        >
          <Package className="w-3 h-3 mr-1" />
          CINTA
          <span className="invisible w-3 h-3 ml-1"></span> 
        </div>

        {/* Botón Balanza de Áridos (Display Estático) */}
        <div 
          className={cn("flex items-center justify-center px-3 py-1.5 font-extrabold rounded-lg text-xs transition-all duration-300 min-w-[140px] whitespace-nowrap", "bg-slate-200/90 dark:bg-slate-700/90 text-gray-800 dark:text-gray-200 shadow-inner shadow-slate-300/50 dark:shadow-slate-900/50 border border-slate-400 dark:border-slate-600")}
        >
          <Scale className={cn("w-3 h-3 mr-1", ACCENT_COLOR_TEXT)} /> 
          BALANZA: {pesoActual.toFixed(1)} KG
          <span className="invisible w-3 h-3 ml-1"></span>
        </div>
      </div>
    </div>
  );
}