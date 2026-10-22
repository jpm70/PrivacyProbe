import React from 'react';
import { DefenseSettings } from '../types/fingerprint';
import { Shield, ShieldAlert, Sparkles, Sliders, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface MitigationLabProps {
  settings: DefenseSettings;
  onUpdateSetting: (key: keyof DefenseSettings, value: boolean) => void;
  onApplyPreset: (preset: 'none' | 'brave' | 'tor' | 'max') => void;
  totalEntropyBits: number;
}

export const MitigationLab: React.FC<MitigationLabProps> = ({
  settings,
  onUpdateSetting,
  onApplyPreset,
  totalEntropyBits,
}) => {
  const activeCount = Object.values(settings).filter(Boolean).length;

  return (
    <section id="laboratorio" data-tour="mitigaciones" className="scroll-mt-20 space-y-6 relative">
      <div id="mitigaciones" className="absolute -top-24 left-0 pointer-events-none" aria-hidden="true" />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-mono">
              05
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sliders className="h-5 w-5 text-cyan-400" />
              Laboratorio Interactivo de Mitigaciones y Defensas
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Experimenta cómo la activación de diferentes contramedidas criptográficas y de aislamiento modifica la entropía de Shannon y rompe la estabilidad de tu huella digital.
          </p>
        </div>

        {/* Preset selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Preajustes:</span>
          <button
            onClick={() => onApplyPreset('none')}
            className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors cursor-pointer ${
              activeCount === 0
                ? 'bg-slate-800 text-white border-slate-600'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Sin defensas
          </button>
          <button
            onClick={() => onApplyPreset('brave')}
            className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors cursor-pointer ${
              settings.canvasPoisoning && !settings.letterboxing
                ? 'bg-amber-950/60 text-amber-300 border-amber-700/60'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-amber-300'
            }`}
          >
            Estilo Brave (Farbling)
          </button>
          <button
            onClick={() => onApplyPreset('tor')}
            className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors cursor-pointer ${
              settings.webglMasking && settings.letterboxing && settings.fontRestriction
                ? 'bg-purple-950/60 text-purple-300 border-purple-700/60'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-purple-300'
            }`}
          >
            Estilo Tor Browser
          </button>
          <button
            onClick={() => onApplyPreset('max')}
            className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors cursor-pointer ${
              activeCount === 7
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-emerald-300'
            }`}
          >
            Defensa Total (7/7)
          </button>
        </div>
      </div>

      {/* Dynamic Impact Indicator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs font-medium text-slate-400">Contramedidas Activas</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{activeCount}</span>
            <span className="text-xs text-slate-500">de 7 vectores protegidos</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                activeCount >= 5 ? 'bg-emerald-500' : activeCount >= 2 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${(activeCount / 7) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs font-medium text-slate-400">Entropía Resultante Actual</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-400">{totalEntropyBits}</span>
            <span className="text-xs text-slate-500">bits de Shannon</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {totalEntropyBits > 30
              ? 'Riesgo crítico: Identificación unívoca casi instantánea.'
              : totalEntropyBits > 18
              ? 'Riesgo medio: Rastreo posible en audiencias acotadas.'
              : 'Alta resistencia: Te camuflas entre millones de usuarios idénticos.'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs font-medium text-slate-400">Estrategia Predominante</div>
          <div className="mt-1 flex items-center gap-2">
            {settings.canvasPoisoning && !settings.letterboxing ? (
              <span className="text-amber-400 font-semibold text-sm flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" /> Farbling (Ruido Estocástico)
              </span>
            ) : settings.letterboxing ? (
              <span className="text-purple-400 font-semibold text-sm flex items-center gap-1.5">
                <Shield className="h-4 w-4" /> Uniformidad de Cohorte (Tor)
              </span>
            ) : (
              <span className="text-red-400 font-semibold text-sm flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4" /> Sin Protección Activa
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {settings.letterboxing
              ? 'Misma huella que la cohorte mundial de Tor Browser.'
              : settings.canvasPoisoning
              ? 'Huella efímera que cambia en cada sesión o sitio web.'
              : 'Huella estática e inmutable en todas tus sesiones.'}
          </p>
        </div>
      </div>

      {/* Control Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Canvas Farbling */}
        <div
          onClick={() => onUpdateSetting('canvasPoisoning', !settings.canvasPoisoning)}
          className={`group rounded-xl border p-4 transition-all cursor-pointer ${
            settings.canvasPoisoning
              ? 'border-cyan-500/50 bg-cyan-950/20 shadow-sm'
              : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-white text-sm">Inyección de Ruido en Canvas (Farbling)</h4>
                {settings.canvasPoisoning ? (
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700">
                    Activo (-7.4 bits)
                  </span>
                ) : (
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    Desactivado
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Añade micro-perturbaciones aleatorias imperceptibles al ojo humano en los canales RGB de cada lectura de Canvas 2D (`toDataURL`/`getImageData`). Esto produce un hash distinto en cada visita, impidiendo el enlace temporal.
              </p>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                <span className="text-cyan-400 font-medium">Usado por:</span> Brave Shields, extensiones Canvas Defender.
              </div>
            </div>
            <div
              className={`h-6 w-11 rounded-full transition-colors relative shrink-0 ${
                settings.canvasPoisoning ? 'bg-cyan-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  settings.canvasPoisoning ? 'right-1' : 'left-1'
                }`}
              />
            </div>
          </div>
        </div>

        {/* 2. WebGL Masking */}
        <div
          onClick={() => onUpdateSetting('webglMasking', !settings.webglMasking)}
          className={`group rounded-xl border p-4 transition-all cursor-pointer ${
            settings.webglMasking
              ? 'border-purple-500/50 bg-purple-950/20 shadow-sm'
              : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-white text-sm">Enmascaramiento de GPU WebGL</h4>
                {settings.webglMasking ? (
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700">
                    Activo (-6.3 bits)
                  </span>
                ) : (
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    Desactivado
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Intercepta la extensión `WEBGL_debug_renderer_info` para no exponer el modelo exacto de tarjeta gráfica (`NVIDIA GeForce RTX`, `Apple M2/M3`) y reportar un renderizador de software genérico.
              </p>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                <span className="text-purple-400 font-medium">Usado por:</span> Tor Browser, Firefox (`privacy.resistFingerprinting`).
              </div>
            </div>
            <div
              className={`h-6 w-11 rounded-full transition-colors relative shrink-0 ${
                settings.webglMasking ? 'bg-purple-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  settings.webglMasking ? 'right-1' : 'left-1'
                }`}
              />
            </div>
          </div>
        </div>

        {/* 3. Letterboxing */}
        <div
          onClick={() => onUpdateSetting('letterboxing', !settings.letterboxing)}
          className={`group rounded-xl border p-4 transition-all cursor-pointer ${
            settings.letterboxing
              ? 'border-cyan-500/50 bg-cyan-950/20 shadow-sm'
              : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-white text-sm">Letterboxing de Pantalla</h4>
                {settings.letterboxing ? (
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700">
                    Activo (-3.8 bits)
                  </span>
                ) : (
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    Desactivado
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Agrega márgenes grises alrededor del viewport para que la ventana exponga dimensiones cuantificadas (múltiplos de 200x100px o cuadrantes fijos de 1000x1000px), evitando que la resolución exacta te identifique.
              </p>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                <span className="text-cyan-400 font-medium">Usado por:</span> Tor Browser, Mullvad Browser.
              </div>
            </div>
            <div
              className={`h-6 w-11 rounded-full transition-colors relative shrink-0 ${
                settings.letterboxing ? 'bg-cyan-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  settings.letterboxing ? 'right-1' : 'left-1'
                }`}
              />
            </div>
          </div>
        </div>

        {/* 4. Font Restriction */}
        <div
          onClick={() => onUpdateSetting('fontRestriction', !settings.fontRestriction)}
          className={`group rounded-xl border p-4 transition-all cursor-pointer ${
            settings.fontRestriction
              ? 'border-cyan-500/50 bg-cyan-950/20 shadow-sm'
              : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-white text-sm">Restricción de Fuentes del Sistema</h4>
                {settings.fontRestriction ? (
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700">
                    Activo (-6.4 bits)
                  </span>
                ) : (
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    Desactivado
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Bloquea el sondeo de fuentes locales no estándar. El navegador solo informa y renderiza una lista canónica cerrada de tipografías web genéricas, neutralizando la detección de software instalado.
              </p>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                <span className="text-cyan-400 font-medium">Usado por:</span> Tor Browser, LibreWolf.
              </div>
            </div>
            <div
              className={`h-6 w-11 rounded-full transition-colors relative shrink-0 ${
                settings.fontRestriction ? 'bg-cyan-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  settings.fontRestriction ? 'right-1' : 'left-1'
                }`}
              />
            </div>
          </div>
        </div>

        {/* 5. Hardware Clamping */}
        <div
          onClick={() => onUpdateSetting('hardwareClamping', !settings.hardwareClamping)}
          className={`group rounded-xl border p-4 transition-all cursor-pointer ${
            settings.hardwareClamping
              ? 'border-emerald-500/50 bg-emerald-950/20 shadow-sm'
              : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-white text-sm">Hardware Clamping (Fijación de CPU/RAM)</h4>
                {settings.hardwareClamping ? (
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                    Activo (-2.5 bits)
                  </span>
                ) : (
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    Desactivado
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Reporta `navigator.hardwareConcurrency` siempre como 2 núcleos y oculta `navigator.deviceMemory`, impidiendo segmentar tu perfil según la potencia de cálculo del equipo.
              </p>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                <span className="text-emerald-400 font-medium">Usado por:</span> Tor Browser, Firefox RFP.
              </div>
            </div>
            <div
              className={`h-6 w-11 rounded-full transition-colors relative shrink-0 ${
                settings.hardwareClamping ? 'bg-emerald-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  settings.hardwareClamping ? 'right-1' : 'left-1'
                }`}
              />
            </div>
          </div>
        </div>

        {/* 6. Timezone Normalization */}
        <div
          onClick={() => onUpdateSetting('timezoneNormalization', !settings.timezoneNormalization)}
          className={`group rounded-xl border p-4 transition-all cursor-pointer ${
            settings.timezoneNormalization
              ? 'border-emerald-500/50 bg-emerald-950/20 shadow-sm'
              : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-white text-sm">Normalización Horaria a UTC (GMT+0)</h4>
                {settings.timezoneNormalization ? (
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                    Activo (-2.7 bits)
                  </span>
                ) : (
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    Desactivado
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Fuerza `Intl.DateTimeFormat` y `getTimezoneOffset` a retornar hora universal coordinada (UTC). Neutraliza la detección geográfica por desfase horario.
              </p>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                <span className="text-emerald-400 font-medium">Usado por:</span> Tor Browser, perfiles anonimizados.
              </div>
            </div>
            <div
              className={`h-6 w-11 rounded-full transition-colors relative shrink-0 ${
                settings.timezoneNormalization ? 'bg-emerald-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  settings.timezoneNormalization ? 'right-1' : 'left-1'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Educational Notice: The Extension Paradox */}
      <div className="rounded-xl border border-amber-800/60 bg-amber-950/20 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <h5 className="font-semibold text-amber-300 text-sm">
              La paradoja de las extensiones anti-fingerprint de terceros
            </h5>
            <p>
              Instalar múltiples extensiones de la Chrome Web Store como &quot;Canvas Blocker&quot; o &quot;User-Agent Switcher&quot; a menudo <strong className="text-white">empeora la privacidad</strong> en lugar de protegerla. Si tu extensión bloquea una llamada arrojando un error inhabitual o falsifica un User-Agent de Windows en un sistema con fuentes de macOS, crea una firma aberrante extremadamente atípica (1 en 10.000.000).
            </p>
            <p className="text-amber-200/90 font-medium pt-1">
              La única solución sólida frente a la huella digital es el camuflaje en manada (como Tor Browser o Mullvad Browser) o el envenenamiento criptográfico nativo en el código del motor del navegador (como Brave).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
