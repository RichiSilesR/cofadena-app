
"use client";

import React, { useEffect, useState } from "react";

export default function Visualizacion() {
  const [plc, setPlc] = useState({
    aridos: [0,0,0],
    compuertas: [0,0,0,0,0],
    sensorPeso: 0,
    iniciado: false,
    apagado: false
  });

  useEffect(() => {
    // Usar el proxy de Next.js para WebSocket (siempre /ws)
    const wsUrl =
      window.location.protocol.replace('http', 'ws') +
      '//' + window.location.host + '/ws';
    const ws = new window.WebSocket(wsUrl);
    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        if (data.type === 'plc-update') setPlc(data.data);
      } catch {}
    };
    return () => ws.close();
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center font-sans p-0 animated-bg">
      <style jsx global>{`
        .animated-bg {
          background: linear-gradient(120deg, #b3d0f7, #3a7bd5, #eaf3fb, #b3d0f7 90%);
          background-size: 300% 300%;
          animation: gradientMove 8s ease-in-out infinite;
        }
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <div style={{position:'relative', width:'100%', maxWidth:'1100px', margin:'0 auto'}}>
        <img 
          src="/images/scada.png" 
          alt="SCADA completo"
          style={{
            width: '1100px',
            maxWidth: '95vw',
            height: 'auto',
            margin: '80px auto 0 auto',
            display: 'block',
            boxShadow: '0 8px 32px #0003',
            borderRadius: '18px',
            border: '3px solid #e0e7ef',
            outline: 'none',
            background: 'linear-gradient(180deg,#eaf3fb 60%,#b3d0f7 100%)',
            transition: 'box-shadow 0.3s',
          }}
        />
        {/* Indicador RUNNING centrado sobre el SCADA, animado */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '23%',
          transform: 'translate(-50%, 0)',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '200px',
        }}>
          <div className="w-24 h-12 bg-gradient-to-r from-red-500 to-red-700 animate-pulse rounded-full border-4 border-white shadow-lg flex items-center justify-center mb-1 transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-red-300 rounded-full opacity-80 animate-ping" style={{animationDuration:'1.5s'}} />
            <div className="absolute w-10 h-10 bg-red-500 rounded-full shadow-inner" />
          </div>
          <span className="text-black font-extrabold text-2xl tracking-wide drop-shadow-lg mt-1" style={{letterSpacing:'0.08em'}}>RUNNING</span>
        </div>
      </div>
      {/* Panel inferior de compuertas y balanza moderno con datos en tiempo real */}
      <div className="w-full flex flex-row items-end justify-center gap-4 mt-10 pb-6" style={{maxWidth:'1100px'}}>
        {[1,2,3].map((n)=>(
          <div key={n} className="flex flex-col items-center">
            <div className="w-44 h-12 bg-white/90 border-2 border-gray-300 rounded-t-xl flex items-center justify-center text-base font-bold shadow-md transition-all duration-200 hover:bg-blue-100">COMPUERTA {n}</div>
            <div className={`w-44 h-12 border-2 border-gray-300 rounded-b-xl flex items-center justify-center text-base font-bold shadow-inner tracking-wider transition-all duration-200 ${plc.compuertas[n-1] ? 'bg-green-600 text-white' : 'bg-gradient-to-r from-black to-gray-800 text-red-500 hover:bg-red-900/80'}`}>{plc.compuertas[n-1] ? 'ABIERTA' : 'CERRADA'}</div>
          </div>
        ))}
        <div className="flex flex-col items-center">
          <div className="w-44 h-12 bg-white/90 border-2 border-gray-300 rounded-t-xl flex items-center justify-center text-base font-bold shadow-md transition-all duration-200 hover:bg-blue-100">DESCARGA</div>
          <div className={`w-44 h-12 border-2 border-gray-300 rounded-b-xl flex items-center justify-center text-base font-bold shadow-inner tracking-wider transition-all duration-200 ${plc.compuertas[3] ? 'bg-green-600 text-white' : 'bg-gradient-to-r from-black to-gray-800 text-red-500 hover:bg-red-900/80'}`}>{plc.compuertas[3] ? 'ABIERTA' : 'CERRADA'}</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-56 h-12 bg-white/90 border-2 border-gray-300 rounded-t-xl flex items-center justify-center text-base font-bold shadow-md transition-all duration-200 hover:bg-blue-100">BALANZA DE ÁRIDOS</div>
          <div className="w-56 h-12 bg-gradient-to-r from-black to-gray-800 border-2 border-gray-300 rounded-b-xl flex items-center justify-center text-3xl font-extrabold text-red-500 shadow-inner tracking-wider transition-all duration-200 hover:bg-red-900/80">{plc.sensorPeso}</div>

        </div>
      </div>
    </div>
  );
}


