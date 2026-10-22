import React, { useState } from 'react';
import { Network, ArrowRight, UserCheck, EyeOff, ShoppingBag, Stethoscope, Link2, AlertTriangle } from 'lucide-react';
import { FullFingerprintReport } from '../types/fingerprint';

interface CrossContextSimulatorProps {
  report: FullFingerprintReport;
}

export const CrossContextSimulator: React.FC<CrossContextSimulatorProps> = ({ report }) => {
  const [step, setStep] = useState<number>(1);

  const trackerHash = report.canvas.hash.slice(0, 10);
  const gpuSignature = report.webgl.unmaskedRenderer.split(' ')[0] || 'GPU';

  return (
    <section id="rastreo-cruzado" className="px-6 py-12 border-b border-slate-800/80 bg-slate-950">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
            <Network className="h-4 w-4" />
            <span>Simulador de Rastreo Cruzado</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            ¿Cómo te vinculan entre pestañas e incógnito?
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Un mismo script de analítica (presente en miles de sitios) no necesita que inicies sesión en ambos lugares para saber que eres la misma persona. Sigue este recorrido paso a paso.
          </p>
        </div>

        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { num: 1, label: 'Paso 1: Sesión Pública' },
            { num: 2, label: 'Paso 2: Sesión Incógnito' },
            { num: 3, label: 'Paso 3: Grafo de Fusión' },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                step === s.num
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === s.num ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}>
                {s.num}
              </span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`p-5 rounded-xl border transition-all ${
            step >= 1 ? 'bg-slate-900/80 border-cyan-500/40 shadow-lg shadow-cyan-950/20' : 'bg-slate-950 border-slate-800 opacity-60'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <ShoppingBag className="h-4 w-4 text-cyan-400" />
                <span>Sitio A: Tienda Online</span>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono">Modo Normal</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400">Acción del usuario:</div>
                <div className="text-white font-medium mt-0.5">Inicias sesión con tu correo (ej: jpm@correo.com)</div>
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400">Datos capturados por script de rastreo:</div>
                <div className="mt-1 space-y-1 font-mono text-[11px]">
                  <div className="text-slate-300">Canvas: <span className="text-cyan-300">{trackerHash}</span></div>
                  <div className="text-slate-300">GPU: <span className="text-cyan-300">{gpuSignature}</span></div>
                  <div className="text-slate-300">Fuentes: <span className="text-cyan-300">{report.fonts.detectedCount} detectadas</span></div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
              <UserCheck className="h-3.5 w-3.5 shrink-0" />
              <span>Identidad vinculada a la huella técnica</span>
            </div>
          </div>

          <div className={`p-5 rounded-xl border transition-all ${
            step >= 2 ? 'bg-slate-900/80 border-amber-500/40 shadow-lg shadow-amber-950/20' : 'bg-slate-950 border-slate-800 opacity-60'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Stethoscope className="h-4 w-4 text-amber-400" />
                <span>Sitio B: Portal de Salud</span>
              </div>
              <div className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                <EyeOff className="h-3 w-3" />
                <span>Modo Incógnito</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400">Acción del usuario:</div>
                <div className="text-white font-medium mt-0.5">Buscas un tratamiento médico confidencial</div>
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400">Datos capturados por script de rastreo:</div>
                <div className="mt-1 space-y-1 font-mono text-[11px]">
                  <div className="text-slate-300">Canvas: <span className="text-amber-300 font-bold">{trackerHash}</span> (Idéntico)</div>
                  <div className="text-slate-300">GPU: <span className="text-amber-300">{gpuSignature}</span></div>
                  <div className="text-slate-300">Cookies de Sitio A: <span className="text-emerald-400 font-bold">0 (No enviadas)</span></div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-amber-400 font-medium">
              Aunque no hay cookies, la huella matemática es exactamente la misma.
            </div>
          </div>

          <div className={`p-5 rounded-xl border transition-all ${
            step >= 3 ? 'bg-slate-900/90 border-rose-500/50 shadow-xl shadow-rose-950/30' : 'bg-slate-950 border-slate-800 opacity-60'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Network className="h-4 w-4 text-rose-400" />
                <span>Servidor del Broker de Datos</span>
              </div>
              <span className="text-[10px] text-rose-400 font-mono">Fusión de Perfil</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded bg-slate-950 border border-rose-500/30">
                <div className="text-[11px] text-rose-300 font-bold mb-1 flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5" />
                  <span>Resultado del Cruce Algorítmico:</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  El servidor del broker consulta su base de datos indexada por el hash de Canvas <code className="text-cyan-300 font-mono">{trackerHash}</code>.
                  Detecta que pertenece a <strong className="text-white">jpm@correo.com</strong> registrado en el Sitio A.
                </p>
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                <span className="text-slate-400 block mb-1">Perfil Final Enriquecido:</span>
                <div className="text-white font-mono text-[11px]">
                  ID: <span className="text-cyan-400">{trackerHash}</span><br />
                  Historial: Calzado + Tratamiento Médico (Incógnito)
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-rose-400 flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>Privacidad de la sesión privada anulada</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">
            {step === 1 && 'Paso 1: Se establece la identidad en una navegación estándar.'}
            {step === 2 && 'Paso 2: Abres una ventana privada creyendo que nadie sabe quién eres.'}
            {step === 3 && 'Paso 3: Las dos sesiones se unifican sin usar cookies gracias a la huella técnica.'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep((s) => (s > 1 ? s - 1 : 1))}
              disabled={step === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-xs text-slate-400 hover:text-white disabled:opacity-40 cursor-pointer"
            >
              Anterior
            </button>
            <button
              onClick={() => setStep((s) => (s < 3 ? s + 1 : 1))}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>{step < 3 ? 'Siguiente Paso' : 'Reiniciar Simulación'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
