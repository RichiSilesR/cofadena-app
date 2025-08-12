'use client';

import React, { useState } from "react";

export default function ProduccionPage() {
  const [subseccion, setSubseccion] = useState<'parametros' | 'visualizacion'>('parametros');

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start py-10 px-4 bg-gradient-to-br from-blue-200 via-white to-lime-200 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-80 h-80 bg-blue-400 opacity-30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-lime-400 opacity-20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-cyan-300 opacity-20 rounded-full blur-2xl animate-pulse" />
      </div>
      <div className="relative z-10 w-full max-w-4xl">
        <h1 className="text-4xl font-extrabold text-blue-700 drop-shadow mb-8 text-center tracking-wide">Producción</h1>
        <div className="flex gap-4 mb-8 justify-center">
          <button
            className={`px-6 py-2 rounded-full shadow transition-all duration-200 text-lg font-semibold border-2 ${subseccion === 'parametros' ? 'bg-blue-600 text-white border-blue-700 scale-105' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-100'}`}
            onClick={() => setSubseccion('parametros')}
          >
            Parámetros
          </button>
          <button
            className={`px-6 py-2 rounded-full shadow transition-all duration-200 text-lg font-semibold border-2 ${subseccion === 'visualizacion' ? 'bg-blue-600 text-white border-blue-700 scale-105' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-100'}`}
            onClick={() => setSubseccion('visualizacion')}
          >
            Visualización
          </button>
        </div>
        <div className="rounded-2xl bg-white/80 shadow-xl p-8 min-h-[400px]">
          {subseccion === 'parametros' && <ParametrosSection />}
          {subseccion === 'visualizacion' && (
            <div className="text-center text-gray-500 mt-10 text-xl font-medium">Visualización SCADA próximamente...</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ParametrosSection() {
  // Estados para los valores de áridos
  const [arido1, setArido1] = useState(0);
  const [arido2, setArido2] = useState(0);
  const [arido3, setArido3] = useState(0);
  const [pesoActual, setPesoActual] = useState(0);
  const [pesoTotal, setPesoTotal] = useState(0);

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex gap-10">
        <ParametroBox label="ARIDO 1 (Kg)" value={arido1} onChange={setArido1} color="from-blue-400 to-blue-200" />
        <ParametroBox label="ARIDO 2 (Kg)" value={arido2} onChange={setArido2} color="from-lime-400 to-lime-200" />
        <ParametroBox label="ARIDO 3 (Kg)" value={arido3} onChange={setArido3} color="from-cyan-400 to-cyan-200" />
      </div>
      <div className="flex gap-10 mt-8">
        <PesoBox label="PESO ACTUAL (Kg)" value={pesoActual} />
        <PesoBox label="PESO TOTAL (Kg)" value={pesoTotal} />
      </div>
      <button className="mt-10 px-16 py-4 bg-gradient-to-r from-lime-400 to-lime-600 text-black text-2xl font-extrabold rounded-full shadow-2xl hover:scale-105 hover:from-lime-500 hover:to-lime-700 transition-all duration-200 tracking-wider border-4 border-lime-300">INICIO</button>
    </div>
  );
}

function ParametroBox({ label, value, onChange, color }: { label: string, value: number, onChange: (v: number) => void, color: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-28 h-20 flex items-center justify-center rounded-xl shadow-xl mb-2 bg-gradient-to-br ${color} border-4 border-white`}> 
        <input
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={e => onChange(Math.max(0, Math.min(100, Number(e.target.value))))}
          className="w-full h-full text-4xl text-center bg-transparent outline-none font-bold text-gray-800"
        />
      </div>
      <span className="font-bold text-lg text-gray-700 drop-shadow-sm tracking-wide">{label}</span>
    </div>
  );
}

function PesoBox({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-28 h-20 flex items-center justify-center text-4xl font-extrabold text-red-500 bg-black rounded-xl mb-2 border-4 border-white shadow-xl">
        {value}
      </div>
      <span className="font-bold text-lg text-gray-700 drop-shadow-sm tracking-wide">{label}</span>
    </div>
  );
}
