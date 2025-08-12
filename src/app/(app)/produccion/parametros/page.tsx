"use client";
"use client";
import React, { useState } from "react";
import Image from "next/image";

import { FaCubes, FaBalanceScale, FaPlay } from "react-icons/fa";

export default function ParametrosPage() {
  const [arido1, setArido1] = useState(0);
  const [arido2, setArido2] = useState(0);
  const [arido3, setArido3] = useState(0);
  const [pesoActual, setPesoActual] = useState(0);
  const [pesoTotal, setPesoTotal] = useState(0);

  return (
  <div className="min-h-screen w-full flex flex-col items-center justify-start py-10 px-4 bg-gradient-to-br from-blue-700 via-white to-blue-900 relative overflow-hidden">
      {/* Fondo decorativo animado */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-80 h-80 bg-blue-400 opacity-30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-lime-400 opacity-20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-cyan-300 opacity-20 rounded-full blur-2xl animate-pulse" />
      </div>
      <div className="relative z-10 w-full max-w-4xl">
        <div className="flex items-center justify-start mb-10 animate-fade-in w-full">
          <h1
            className="text-5xl font-extrabold tracking-wide pl-2"
            style={{
              color: '#fff',
              fontFamily: 'Segoe UI, Arial, Helvetica, sans-serif',
              WebkitTextStroke: '1.5px #222',
              textShadow: '0 2px 12px #000a, 0 1px 0 #222',
              letterSpacing: '0.04em',
            }}
          >
            Parámetros
          </h1>
        </div>
        <div className="rounded-[2.5rem] bg-white/40 backdrop-blur-xl shadow-2xl p-12 min-h-[440px] flex flex-col items-center gap-14 border border-blue-100 animate-fade-in relative transition-all duration-300">
          <div className="flex gap-16 w-full justify-center">
            <ParametroBox label="ARIDO 1 (Kg)" value={arido1} onChange={setArido1} color="from-blue-400 to-blue-200" icon={<FaCubes className="text-blue-500 text-4xl drop-shadow-lg" />} glowColor="shadow-blue-300" />
            <ParametroBox label="ARIDO 2 (Kg)" value={arido2} onChange={setArido2} color="from-lime-400 to-lime-200" icon={<FaCubes className="text-lime-500 text-4xl drop-shadow-lg" />} glowColor="shadow-lime-300" />
            <ParametroBox label="ARIDO 3 (Kg)" value={arido3} onChange={setArido3} color="from-cyan-400 to-cyan-200" icon={<FaCubes className="text-cyan-500 text-4xl drop-shadow-lg" />} glowColor="shadow-cyan-300" />
          </div>
          <div className="flex gap-16 mt-10 w-full justify-center">
            <PesoBox label="PESO ACTUAL (Kg)" value={pesoActual} icon={<FaBalanceScale className="text-gray-700 text-4xl drop-shadow-lg" />} glowColor="shadow-gray-400" />
            <PesoBox label="PESO TOTAL (Kg)" value={pesoTotal} icon={<FaBalanceScale className="text-lime-700 text-4xl drop-shadow-lg" />} glowColor="shadow-lime-400" />
          </div>
          <button className="mt-12 flex items-center gap-4 px-20 py-5 bg-gradient-to-r from-lime-400 to-lime-600 text-black text-3xl font-extrabold rounded-full shadow-2xl hover:scale-105 hover:from-lime-500 hover:to-lime-700 transition-all duration-200 tracking-wider border-4 border-lime-300 animate-bounce-slow backdrop-blur-xl">
            <FaPlay className="text-3xl" /> INICIAR PROCESO
          </button>
        </div>
      </div>
    </div>
  );
}

function ParametroBox({ label, value, onChange, color, icon, glowColor }: { label: string, value: number, onChange: (v: number) => void, color: string, icon: React.ReactNode, glowColor: string }) {
  return (
    <div className="flex flex-col items-center group">
      <div className={`w-36 h-28 flex flex-col items-center justify-center rounded-3xl mb-3 bg-gradient-to-br ${color} border-4 border-white group-hover:scale-105 transition-transform duration-200 shadow-xl ${glowColor}`} style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'}}>
        {icon}
        <input
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={e => onChange(Math.max(0, Math.min(100, Number(e.target.value))))}
          className="w-full h-12 text-5xl text-center bg-transparent outline-none font-bold text-gray-800 tracking-wider"
        />
      </div>
      <span className="font-bold text-lg text-gray-700 drop-shadow-sm tracking-wide group-hover:text-blue-600 transition-colors duration-200 uppercase letter-spacing-wider">{label}</span>
    </div>
  );
}

function PesoBox({ label, value, icon, glowColor }: { label: string, value: number, icon: React.ReactNode, glowColor: string }) {
  return (
    <div className="flex flex-col items-center group">
      <div className={`w-36 h-28 flex flex-col items-center justify-center text-5xl font-extrabold text-red-500 bg-black/80 rounded-3xl mb-3 border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-200 ${glowColor}`} style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'}}>
        {icon}
        <span className="mt-1">{value}</span>
      </div>
      <span className="font-bold text-lg text-gray-700 drop-shadow-sm tracking-wide group-hover:text-lime-600 transition-colors duration-200 uppercase letter-spacing-wider">{label}</span>
    </div>
  );
}

// Animaciones personalizadas
// Agrega esto a tu tailwind.config si no existe:
// theme: { extend: { keyframes: { 'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } }, 'bounce-slow': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } } }, animation: { 'fade-in': 'fade-in 0.8s ease', 'bounce-slow': 'bounce 2s infinite' } } }
