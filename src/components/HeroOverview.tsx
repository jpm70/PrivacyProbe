import React, { useState } from 'react';
import { Copy, Check, Fingerprint, AlertTriangle, ShieldCheck, ShieldAlert, AlertOctagon } from 'lucide-react';
import { FullFingerprintReport } from '../types/fingerprint';

interface HeroOverviewProps {
  report: FullFingerprintReport;
}

export const HeroOverview: React.FC<HeroOverviewProps> = ({ report }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(report.compositeHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isGloballyUnique = report.totalEntropyBits >= 33;
  const isCriticalEntropy = report.totalEntropyBits > 20;
  const isModerateEntropy = report.totalEntropyBits > 15 && report.totalEntropyBits <= 20;
  const entropyPercentage = Math.min(100, Math.round((report.totalEntropyBits / 40) * 100));

  const formatBigNumber = (num: number): string => {
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(1) + ' mil millones';
    }
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + ' millones';
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(0) + ' mil';
    }
    return num.toLocaleString('es-ES');
  };

  return (
    <section id="inicio" className="relative px-6 py-10 lg:py-14 border-b border-slate-800/80 bg-radial from-slate-900/90 via-slate-950 to-slate-950 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-8">
          <div className="flex-1 max-w-2xl">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                <Fingerprint className="h-4 w-4" />
                <span>Simulador de Huella Digital y Rastreo Silencioso</span>
              </div>
              <span className="text-slate-700 hidden sm:inline" aria-hidden="true">·</span>
              <a
                href="https://www.unfantasmaenelsistema.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
                title="Visitar Un Fantasma en el Sistema"
              >
                <img
                  src="/assets/aistudio/icono_81a3db5b.png"
                  alt=""
                  className="h-4 w-4 object-contain aspect-square shrink-0"
                  referrerPolicy="no-referrer"
                />
                <span className="font-medium">Un Fantasma en el Sistema</span>
              </a>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white text-balance leading-tight">
              ¿Qué tan único es tu navegador ante los rastreadores?
            </h1>

            {/* Critical Entropy Warning Header Banner */}
            {isCriticalEntropy && (
              <div
                className={`mt-4 inline-flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium border ${
                  isGloballyUnique
                    ? 'bg-rose-950/70 border-rose-500/50 text-rose-300 ring-1 ring-rose-500/20'
                    : 'bg-amber-950/70 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/20'
                }`}
                role="alert"
                aria-live="polite"
              >
                <ShieldAlert className="h-4 w-4 shrink-0 animate-pulse text-rose-400" />
                <span>
                  <strong>Umbral Crítico Excedido ({report.totalEntropyBits.toFixed(1)} bits &gt; 20 bits):</strong>{' '}
                  Riesgo alto de identificación persistente (1 en {formatBigNumber(report.oneInX)}).
                </span>
              </div>
            )}

            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              Las empresas de publicidad y ciberinteligencia no necesitan cookies para seguirte entre sitios web.
              Al leer variaciones microscópicas en el renderizado de tu tarjeta gráfica, tus fuentes y tu pantalla,
              construyen una <strong>huella digital técnica</strong> persistente e indeleble.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                Firma Criptográfica Compuesta:
              </span>
              <code className="text-xs font-mono text-cyan-300 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 select-all truncate max-w-xs sm:max-w-md">
                {report.compositeHash}
              </code>
              <button
                onClick={handleCopyHash}
                className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                title="Copiar Hash"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          <div
            className={`w-full lg:w-96 shrink-0 flex flex-col justify-between p-6 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
              isGloballyUnique
                ? 'bg-slate-900/80 border-rose-500/60 shadow-2xl shadow-rose-950/40 ring-1 ring-rose-500/30'
                : isCriticalEntropy
                ? 'bg-slate-900/80 border-amber-500/60 shadow-xl shadow-amber-950/30 ring-1 ring-amber-500/30'
                : 'bg-slate-900/70 border-slate-800 shadow-xl'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-400">Perfil Analizado</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-cyan-400">{report.profileName}</span>
                  {isGloballyUnique ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                      <AlertOctagon className="h-3 w-3" />
                      &ge;33b Global
                    </span>
                  ) : isCriticalEntropy ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                      <ShieldAlert className="h-3 w-3" />
                      &gt;20b Crítico
                    </span>
                  ) : isModerateEntropy ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Moderado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <ShieldCheck className="h-3 w-3" />
                      Protegido
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-400">Entropía de Shannon</span>
                    {isCriticalEntropy && (
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                        [Riesgo Crítico]
                      </span>
                    )}
                  </div>
                  <span className={`text-2xl font-bold font-mono tabular-nums ${
                    isGloballyUnique
                      ? 'text-rose-400'
                      : isCriticalEntropy
                      ? 'text-amber-300'
                      : 'text-white'
                  }`}>
                    {report.totalEntropyBits.toFixed(1)}{' '}
                    <span className="text-xs font-normal text-slate-400">bits</span>
                  </span>
                </div>

                {/* Progress bar with 20-bit threshold marker */}
                <div className="relative w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      report.totalEntropyBits >= 33
                        ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600'
                        : report.totalEntropyBits > 20
                        ? 'bg-gradient-to-r from-cyan-500 via-amber-500 to-rose-500'
                        : report.totalEntropyBits > 15
                        ? 'bg-gradient-to-r from-cyan-500 to-amber-500'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    }`}
                    style={{ width: `${entropyPercentage}%` }}
                  />
                  {/* Critical 20-bit threshold line (20/40 = 50%) */}
                  <div
                    className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-rose-400/80 shadow-[0_0_4px_rgba(244,63,94,0.8)] z-10"
                    title="Umbral Crítico de Identificación (20 bits)"
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                  <span>0b (Masa)</span>
                  <span className="text-rose-400 font-semibold flex items-center gap-0.5" title="Umbral Crítico (>20 bits): 1 entre >1 millón">
                    ▲ 20b (Crítico)
                  </span>
                  <span>33b (Global)</span>
                </div>
              </div>

              {/* Dedicated Warning Box when exceeding 20 bits */}
              {isCriticalEntropy && (
                <div
                  className={`mt-4 p-3 rounded-lg border flex items-start gap-2.5 ${
                    isGloballyUnique
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                      : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  }`}
                >
                  <ShieldAlert className={`h-4 w-4 shrink-0 mt-0.5 ${
                    isGloballyUnique ? 'text-rose-400' : 'text-amber-400'
                  }`} />
                  <div className="text-xs">
                    <span className="font-semibold block mb-0.5">
                      {isGloballyUnique
                        ? 'Rastreo Inevitable a Escala Global'
                        : 'Superado el Umbral de Rastreabilidad (>20 bits)'}
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {isGloballyUnique
                        ? `Tu navegador acumula ${report.totalEntropyBits.toFixed(1)} bits de entropía, permitiendo aislarte entre todos los humanos conectados a Internet.`
                        : `Con ${report.totalEntropyBits.toFixed(1)} bits, tu navegador es único entre más de 1 millón de dispositivos (1 en ${formatBigNumber(report.oneInX)}), permitiendo seguimiento entre sitios web sin cookies.`}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
                <div className="text-xs text-slate-400 mb-1">Probabilidad de Identificación:</div>
                <div className="text-lg font-bold text-white flex items-center gap-2">
                  <span>1 entre {formatBigNumber(report.oneInX)}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {isGloballyUnique
                    ? 'Tu navegador posee suficiente información para distinguirte entre todos los habitantes de la Tierra.'
                    : isCriticalEntropy
                    ? 'Tu configuración es altamente singular en cualquier dominio o red publicitaria.'
                    : 'Tu huella se confunde con la de una multitud de otros usuarios con configuración homogénea.'}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 flex items-start gap-2.5">
              {isGloballyUnique ? (
                <>
                  <AlertOctagon className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300">
                    <strong className="text-rose-400 font-semibold block">Huella Altamente Única (Global)</strong>
                    Los scripts de terceros pueden asociar tu navegación sin importar si borras tus cookies o reinicias el router.
                  </div>
                </>
              ) : isCriticalEntropy ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300">
                    <strong className="text-amber-400 font-semibold block">Alto Riesgo de Identificación</strong>
                    Superar los 20 bits de entropía compromete el anonimato estadístico; activa mitigaciones para reducir la superficie expuesta.
                  </div>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300">
                    <strong className="text-emerald-400 font-semibold block">Anonimato por Homogeneidad</strong>
                    Las mitigaciones activadas reducen los bits distintivos por debajo del umbral de seguimiento unívoco.
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

