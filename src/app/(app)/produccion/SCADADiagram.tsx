import React from 'react';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Simulación de datos de sensores para 4 contenedores
const initialSensors = [
  { id: 'tank1', name: 'Contenedor Norte', nivel: 70, humedad: 45, temperatura: 28, estado: 'normal' },
  { id: 'tank2', name: 'Contenedor Sur', nivel: 40, humedad: 55, temperatura: 32, estado: 'alerta' },
  { id: 'tank3', name: 'Contenedor Este', nivel: 85, humedad: 38, temperatura: 26, estado: 'normal' },
  { id: 'tank4', name: 'Contenedor Oeste', nivel: 15, humedad: 60, temperatura: 35, estado: 'critico' },
];

const initialTrend = [
  { time: '15:20', tank1: 70, tank2: 40, tank3: 85, tank4: 15 },
  { time: '15:21', tank1: 72, tank2: 42, tank3: 84, tank4: 17 },
  { time: '15:22', tank1: 68, tank2: 39, tank3: 86, tank4: 13 },
  // ...más datos
];

function getColor(estado: 'normal' | 'alerta' | 'critico' | string) {
  if (estado === 'normal') return 'bg-green-500';
  if (estado === 'alerta') return 'bg-yellow-500';
  if (estado === 'critico') return 'bg-red-500';
  return 'bg-gray-400';
}

type SCADADiagramProps = {
  user?: string;
  role?: string;
};

export default function SCADADiagram({ user = 'Admin', role = 'Administrador' }: SCADADiagramProps) {
  const [sensors, setSensors] = React.useState(initialSensors);
  const [trend, setTrend] = React.useState(initialTrend);

  // Simulación de actualización en tiempo real
  React.useEffect(() => {
    const interval = setInterval(() => {
      setSensors(sensors => sensors.map(s => ({
        ...s,
        nivel: Math.max(0, Math.min(100, s.nivel + (Math.random() * 4 - 2))),
        humedad: Math.max(0, Math.min(100, s.humedad + (Math.random() * 2 - 1))),
        temperatura: Math.max(10, Math.min(50, s.temperatura + (Math.random() * 2 - 1))),
        estado: s.nivel < 20 ? 'critico' : s.nivel < 50 ? 'alerta' : 'normal',
      })));
      setTrend(trend => [
        ...trend.slice(-19),
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          tank1: sensors[0].nivel,
          tank2: sensors[1].nivel,
          tank3: sensors[2].nivel,
          tank4: sensors[3].nivel,
        },
      ]);
    }, 2000);
    return () => clearInterval(interval);
  }, [sensors]);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-2 bg-gradient-to-br from-gray-100 to-gray-300 overflow-x-hidden" style={{ minHeight: '100vh', justifyContent: 'flex-start', marginTop: '6px' }}>
      {/* Barra de estado global */}
      <div className="w-full flex flex-row items-center justify-between bg-gray-900 text-white px-6 py-1 rounded-lg shadow animate-fade-in" style={{ marginTop: '0px' }}>
        <div className="flex gap-4 items-center">
          <span className="font-bold text-lg tracking-wide">SCADA COFADENA</span>
          <span className="text-xs bg-green-600 px-2 py-1 rounded">Sistema Operativo</span>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs">{new Date().toLocaleString()}</span>
          <span className="text-xs">Usuario: {user} {role ? `(${role})` : ''}</span>
        </div>
      </div>
      {/* Título compacto */}
      {/* Leyenda de colores flotante */}
      <div className="flex flex-row gap-8 items-center mb-0 justify-center" style={{ marginTop: '0px' }}>
        <div className="flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-green-500 border border-gray-400 inline-block"></span><span className="text-xs">Normal</span></div>
        <div className="flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-yellow-500 border border-gray-400 inline-block"></span><span className="text-xs">Alerta</span></div>
        <div className="flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-red-500 border border-gray-400 inline-block"></span><span className="text-xs">Crítico</span></div>
      </div>
      {/* Diagrama compacto y decorado estilo SCADA industrial */}
      <div className="relative w-full flex flex-row gap-12 justify-center items-end py-0" style={{ minHeight: 180, marginTop: '0px' }}>
        <svg width="900" height="160" className="absolute left-1/2 -translate-x-1/2 top-0 z-0">
          {/* Tubería principal */}
          <rect x="80" y="120" width="840" height="12" rx="6" fill="#d1d5db" />
          {/* Tuberías verticales y válvulas decoradas */}
          {[0,1,2,3].map(i => (
            <g key={i}>
              <rect x={120 + i*220} y="60" width="12" height="60" rx="6" fill="#d1d5db" />
              <circle cx={126 + i*220} cy="60" r="8" fill="#fde68a" stroke="#f59e42" strokeWidth="2" />
              {/* Válvula decorativa */}
              <rect x={120 + i*220 - 6} y="48" width="24" height="8" rx="4" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" />
            </g>
          ))}
        </svg>
        {sensors.map((sensor, idx) => (
          <div key={sensor.id} className="flex flex-col items-center z-10" style={{ margin: '0 24px' }}>
            {/* Tanque mediano y decorado */}
            <div className="relative w-20 h-28 flex flex-col items-center">
              <div className={`absolute left-1/2 -translate-x-1/2 bottom-0 w-16 h-24 rounded-b-xl border-4 border-gray-500 bg-gradient-to-b from-gray-100 to-white overflow-hidden flex items-end shadow-md`}>
                <div
                  className={`w-full rounded-b-2xl transition-all duration-700 ${getColor(sensor.estado)}`}
                  style={{ height: `${sensor.nivel * 0.24}px` }}
                />
                {/* Indicador de nivel SVG decorado */}
                <svg width="14" height="50" className="absolute right-0 top-0">
                  <rect x="4" y="8" width="6" height="34" rx="3" fill="#e5e7eb" />
                  <rect x="4" y={42 - sensor.nivel * 0.34 / 100} width="6" height={sensor.nivel * 0.34 / 100} rx="3" fill={sensor.estado === 'critico' ? '#ef4444' : sensor.estado === 'alerta' ? '#f59e42' : '#22c55e'} />
                </svg>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-0 w-16 h-2 bg-gray-300 rounded-t-xl border-4 border-gray-500" />
              {/* Indicador de nivel */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center">
                <Badge className={`px-2 py-1 text-sm font-bold ${getColor(sensor.estado)}`}>{Math.round(sensor.nivel)}%</Badge>
                <span className="text-xs text-gray-600">Nivel</span>
              </div>
            </div>
            {/* Etiquetas de sensores compactas */}
            <div className="flex flex-row gap-4 mt-2">
              <Card className="p-1 text-center shadow-sm min-w-[60px]">
                <span className="font-bold text-blue-700 text-xs">{sensor.humedad.toFixed(1)}%</span>
                <div className="text-[10px] text-gray-500">Humedad</div>
              </Card>
              <Card className="p-1 text-center shadow-sm min-w-[60px]">
                <span className="font-bold text-red-700 text-xs">{sensor.temperatura.toFixed(1)}°C</span>
                <div className="text-[10px] text-gray-500">Temp.</div>
              </Card>
            </div>
            <div className="mt-2 text-base font-semibold text-center">{sensor.name}</div>
          </div>
        ))}
      </div>
      {/* Gráfico de tendencia */}
      {/* Gráfico y panel de alarmas en la parte inferior, estilo SCADA industrial */}
      <div className="w-full flex flex-row gap-12 mt-0 items-end justify-center" style={{ marginTop: '0px' }}>
        <div className="flex-1 min-w-0">
          <div className="relative w-full max-w-[1200px] h-56 rounded-2xl shadow-2xl bg-gradient-to-br from-slate-900 via-gray-800 to-gray-700 border border-blue-900 p-6 flex flex-col items-center">
            <div className="absolute top-2 left-8 flex gap-6">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-white"><span className="w-3 h-3 rounded-full bg-blue-500 border border-gray-400"></span>Contenedor Norte</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-white"><span className="w-3 h-3 rounded-full bg-red-500 border border-gray-400"></span>Contenedor Sur</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-white"><span className="w-3 h-3 rounded-full bg-green-500 border border-gray-400"></span>Contenedor Este</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-white"><span className="w-3 h-3 rounded-full bg-yellow-500 border border-gray-400"></span>Contenedor Oeste</span>
            </div>
            <div className="w-full h-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={trend} margin={{ top: 30, right: 20, left: 0, bottom: 0 }}>
                  <XAxis dataKey="time" tick={{ fontSize: 13, fill: '#fff' }} axisLine={{ stroke: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 13, fill: '#fff' }} axisLine={{ stroke: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(30,41,59,0.95)', color: '#fff', borderRadius: '10px', fontSize: '15px', border: '1px solid #3b82f6' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    formatter={(value, name) => [`${Math.round(value as number)}%`, `Nivel ${name.replace('tank', '')}`]}
                  />
                  <Line type="monotone" dataKey="tank1" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 8, fill: '#3b82f6' }} isAnimationActive={true} animationDuration={1200} strokeDasharray="5 2" />
                  <Line type="monotone" dataKey="tank2" stroke="#ef4444" strokeWidth={4} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 8, fill: '#ef4444' }} isAnimationActive={true} animationDuration={1200} strokeDasharray="5 2" />
                  <Line type="monotone" dataKey="tank3" stroke="#22c55e" strokeWidth={4} dot={{ r: 4, fill: '#22c55e' }} activeDot={{ r: 8, fill: '#22c55e' }} isAnimationActive={true} animationDuration={1200} strokeDasharray="5 2" />
                  <Line type="monotone" dataKey="tank4" stroke="#f59e42" strokeWidth={4} dot={{ r: 4, fill: '#f59e42' }} activeDot={{ r: 8, fill: '#f59e42' }} isAnimationActive={true} animationDuration={1200} strokeDasharray="5 2" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        {/* Panel de alarmas profesional y dinámico */}
        <div className="w-56 min-h-[140px] rounded-2xl shadow-2xl bg-gradient-to-br from-red-50 via-gray-100 to-gray-300 border border-red-200 p-3 flex flex-col items-center justify-start" style={{ marginTop: '8px' }}>
          <div className="w-full flex flex-col gap-2 mb-2">
            <span className="text-lg font-bold text-red-700 mb-1">Alarmas activas</span>
            {sensors.filter(s => s.estado !== 'normal').length === 0 && (
              <span className="bg-green-500 text-white rounded px-2 py-1 font-semibold shadow text-base">Sin alarmas</span>
            )}
            {sensors.filter(s => s.estado !== 'normal').map((sensor, idx) => (
              <span
                key={sensor.id}
                className={`rounded px-2 py-1 font-semibold shadow text-base flex items-center gap-2 animate-fade-in ${sensor.estado === 'critico' ? 'bg-red-500 text-white' : sensor.estado === 'alerta' ? 'bg-yellow-500 text-white' : 'bg-gray-400 text-white'}`}
                title={`Tanque: ${sensor.name} | Nivel: ${Math.round(sensor.nivel)}% | Estado: ${sensor.estado.charAt(0).toUpperCase() + sensor.estado.slice(1)}`}
              >
                <span className="w-3 h-3 rounded-full border border-gray-400" style={{ background: sensor.estado === 'critico' ? '#ef4444' : sensor.estado === 'alerta' ? '#fde68a' : '#d1d5db' }}></span>
                {sensor.estado === 'critico' && 'Crítico'}
                {sensor.estado === 'alerta' && 'Alerta'}
                <span className="ml-1 text-xs">{sensor.name}</span>
                <span className="ml-2 text-xs">Nivel: {Math.round(sensor.nivel)}%</span>
              </span>
            ))}
          </div>
          {/* Estado de automatización solo si hay alarmas activas */}
          {sensors.some(s => s.estado !== 'normal') && (
            <div className="flex flex-col items-center gap-1 mt-0">
              <div className="w-8 h-8 rounded-full bg-red-500 animate-pulse border-4 border-red-700 shadow-lg flex items-center justify-center">
                <span className="text-white font-bold text-base">●</span>
              </div>
              <span className="text-xs text-gray-700">Automatización activa</span>
            </div>
          )}
        </div>
      </div>
      {/* Panel de alarmas */}
      <div className="flex flex-row gap-8 mt-12 justify-center" style={{ marginBottom: '0px' }}>
        {sensors.map(sensor => (
          <Badge key={sensor.id} className={`px-6 py-3 text-xl font-bold ${getColor(sensor.estado)}`}
            title={`Estado: ${sensor.estado.charAt(0).toUpperCase() + sensor.estado.slice(1)} | Nivel: ${Math.round(sensor.nivel)}% | Humedad: ${sensor.humedad}% | Temp: ${sensor.temperatura}°C`}>
            {sensor.estado === 'normal' && 'Normal'}
            {sensor.estado === 'alerta' && 'Alerta'}
            {sensor.estado === 'critico' && 'Crítico'}
          </Badge>
        ))}
        {sensors.some(s => s.estado === 'critico') && (
          <Card className="flex items-center gap-2 px-6 py-3 bg-red-100 border-red-400 border-2 animate-pulse shadow-lg">
            <span className="text-red-600 font-bold">¡Alarma Crítica!</span>
          </Card>
        )}
      </div>
    </div>
  );
}
