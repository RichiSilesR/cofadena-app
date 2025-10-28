S7 Probe
=========

Cómo usar:

1. Instala dependencias: `npm install`
2. Ejecuta: `node scripts/s7-probe.js 192.168.10.3`

Qué hace:
- Intenta conectar al PLC por S7 (rack 0 slot 1).
- Prueba varias traducciones de nombre (MW, DBW, M, Q, etc.) para encontrar direcciones que respondan.

Interpretación:
- Si el script encuentra una correspondencia, imprimirá la dirección que funcionó y el valor leído.
- Si no encuentra nada, necesitaremos la tabla real de direcciones del PLC (cómo están nombradas VWx, V8.x) o configurar el LOGO! para exponer variables en DB/MB estándar.
