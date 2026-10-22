import React, { useState } from 'react';
import { Calculator, BarChart3, AlertOctagon, HelpCircle, TrendingDown, Layers, ShieldCheck } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { FullFingerprintReport } from '../types/fingerprint';

interface EntropyMathExplorerProps {
  report: FullFingerprintReport;
}

export const EntropyMathExplorer: React.FC<EntropyMathExplorerProps> = ({ report }) => {
  const [interactiveBits, setInteractiveBits] = useState<number>(Math.round(report.totalEntropyBits));
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [chartView, setChartView] = useState<'profiles' | 'cascade'>('profiles');

  const calculateUniquePopulation = (bits: number): number => {
    return Math.pow(2, bits);
  };

  const formatCalculatedPopulation = (bits: number): { text: string; comparison: string } => {
    const pop = calculateUniquePopulation(bits);
    if (pop >= 100_000_000_000) {
      return {
        text: (pop / 1_000_000_000).toFixed(0) + ' mil millones',
        comparison: 'Más de 10 veces la población total de la Tierra.',
      };
    }
    if (pop >= 8_500_000_000) {
      return {
        text: (pop / 1_000_000_000).toFixed(1) + ' mil millones',
        comparison: 'Suficiente para identificar a cualquier ser humano del planeta.',
      };
    }
    if (pop >= 1_000_000_000) {
      return {
        text: (pop / 1_000_000_000).toFixed(2) + ' mil millones',
        comparison: 'Equivalente a toda la población del continente americano o europeo.',
      };
    }
    if (pop >= 1_000_000) {
      return {
        text: (pop / 1_000_000).toFixed(1) + ' millones',
        comparison: 'Equivalente a una gran metrópolis (ej. Madrid o Nueva York).',
      };
    }
    if (pop >= 1_000) {
      return {
        text: (pop / 1_000).toFixed(0) + ' mil',
        comparison: 'Un estadio pequeño o un barrio.',
      };
    }
    return {
      text: pop.toFixed(0),
      comparison: 'Un grupo pequeño donde compartes huella con muchos otros.',
    };
  };

  const simInfo = formatCalculatedPopulation(interactiveBits);

  const currentBits = Number(report.totalEntropyBits.toFixed(1));
  const profilesChartData = [
    {
      name: 'Chrome Estándar',
      bits: 35.8,
      population: '1 entre 58 mil millones',
      category: 'Convencional',
      color: '#f43f5e',
    },
    {
      name: 'Modo Incógnito',
      bits: 35.5,
      population: '1 entre 48 mil millones',
      category: 'Sin Mitigación Técnica',
      color: '#fb7185',
    },
    {
      name: `Tu Sesión (${report.profileName})`,
      bits: currentBits,
      population: `1 entre ${formatCalculatedPopulation(currentBits).text}`,
      category: 'Medición Activa',
      color: currentBits > 30 ? '#38bdf8' : '#34d399',
      isCurrent: true,
    },
    {
      name: 'Brave (Farbling)',
      bits: 28.4,
      population: '1 entre 350 millones',
      category: 'Ruido Estocástico',
      color: '#fbbf24',
    },
    {
      name: 'Firefox RFP',
      bits: 21.6,
      population: '1 entre 3.2 millones',
      category: 'Mitigación Parcial',
      color: '#2dd4bf',
    },
    {
      name: 'Tor Browser',
      bits: 10.4,
      population: '1 entre 1,350',
      category: 'Homogeneidad Radical',
      color: '#10b981',
    },
  ];

  const cascadeChartData = [
    {
      step: '0. Navegador Base',
      bits: 35.8,
      reduction: '0 bits',
      detail: 'Expone GPU real, fuentes, pantalla completa, AudioContext y timezone.',
    },
    {
      step: '+ Farbling de Canvas',
      bits: 28.4,
      reduction: '-7.4 bits',
      detail: 'Inyección de ruido aleatorio en getImageData() en cada recarga.',
    },
    {
      step: '+ Enmascarar GPU WebGL',
      bits: 22.1,
      reduction: '-6.3 bits',
      detail: 'Oculta el renderizador de vídeo físico y reporta SwiftShader genérico.',
    },
    {
      step: '+ Restringir Fuentes',
      bits: 15.7,
      reduction: '-6.4 bits',
      detail: 'Solo permite tipografías estándar web, bloqueando fuentes locales del SO.',
    },
    {
      step: '+ Letterboxing Pantalla',
      bits: 11.9,
      reduction: '-3.8 bits',
      detail: 'Ventana cuantizada a múltiplos de 200x100 para unificar resolución.',
    },
    {
      step: '+ Fijar CPU (2 Cores)',
      bits: 9.4,
      reduction: '-2.5 bits',
      detail: 'hardwareConcurrency clamped a 2 hilos y memoria oculta.',
    },
    {
      step: '+ Normalizar UTC',
      bits: 8.9,
      reduction: '-0.5 bits',
      detail: 'Huso horario unificado a GMT+0.',
    },
  ];

  const CustomProfileTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 text-xs text-white shadow-xl backdrop-blur-md">
          <div className="font-bold text-cyan-300 mb-1">{data.name}</div>
          <div className="text-slate-300 flex items-center justify-between gap-4 font-mono">
            <span>Entropía:</span>
            <span className="font-bold text-white text-sm">{data.bits} bits</span>
          </div>
          <div className="text-slate-400 text-[11px] mt-1">
            Unicidad estimada: <strong className="text-slate-200">{data.population}</strong>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Categoría: {data.category}</div>
          {data.bits >= 33 ? (
            <div className="text-[10px] text-rose-400 font-semibold mt-1.5 flex items-center gap-1">
              <span>●</span> Unicidad global (supera umbral de 33 bits)
            </div>
          ) : (
            <div className="text-[10px] text-emerald-400 font-semibold mt-1.5 flex items-center gap-1">
              <span>●</span> Anonimato colectivo alcanzado
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomCascadeTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 text-xs text-white shadow-xl backdrop-blur-md max-w-xs">
          <div className="font-bold text-cyan-300 mb-1">{data.step}</div>
          <div className="text-slate-300 flex items-center justify-between gap-4 font-mono">
            <span>Entropía resultante:</span>
            <span className="font-bold text-white text-sm">{data.bits} bits</span>
          </div>
          <div className="text-emerald-400 text-[11px] font-semibold mt-0.5">
            Efecto de la capa: {data.reduction}
          </div>
          <p className="text-slate-400 text-[11px] mt-1 leading-normal">{data.detail}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <section id="entropia" className="px-6 py-12 border-b border-slate-800/80 bg-slate-900/30">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
            <Calculator className="h-4 w-4" />
            <span>Matemática de la Identificación</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Entropía de Shannon y Unicidad en la Red
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            En teoría de la información, la entropía se mide en <strong>bits de sorpresa</strong>. Cada bit adicional de
            información técnica divide a la población mundial a la mitad, reduciendo exponencialmente el anonimato.
          </p>
        </div>

        {/* RECHARTS EVOLUTION GRAPH SECTION */}
        <div className="mb-10 rounded-xl border border-slate-800 bg-slate-950/90 p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <BarChart3 className="h-5 w-5 text-cyan-400" />
                <span>Evolución Gráfica de Entropía: Perfiles y Mitigaciones</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Visualiza cómo disminuyen los bits de identificación al transitar de navegadores convencionales a defensas activas.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setChartView('profiles')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  chartView === 'profiles' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Comparativa de Perfiles</span>
              </button>
              <button
                onClick={() => setChartView('cascade')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  chartView === 'cascade' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingDown className="h-3.5 w-3.5" />
                <span>Cascada de Mitigación</span>
              </button>
            </div>
          </div>

          <div className="w-full h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'profiles' ? (
                <BarChart
                  data={profilesChartData}
                  margin={{ top: 20, right: 25, left: -10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    domain={[0, 42]}
                    tickCount={7}
                    tickFormatter={(val) => `${val}b`}
                  />
                  <Tooltip content={<CustomProfileTooltip />} />
                  <ReferenceLine
                    y={33}
                    stroke="#f43f5e"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{
                      value: 'Umbral Unicidad Global (33 bits = 8.5B hab.)',
                      fill: '#fb7185',
                      fontSize: 11,
                      position: 'top',
                      offset: 6,
                    }}
                  />
                  <Bar dataKey="bits" radius={[6, 6, 0, 0]} barSize={34}>
                    {profilesChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={entry.isCurrent ? '#ffffff' : 'transparent'}
                        strokeWidth={entry.isCurrent ? 2 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <AreaChart
                  data={cascadeChartData}
                  margin={{ top: 20, right: 25, left: -10, bottom: 25 }}
                >
                  <defs>
                    <linearGradient id="entropyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="step"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    domain={[0, 42]}
                    tickCount={7}
                    tickFormatter={(val) => `${val}b`}
                  />
                  <Tooltip content={<CustomCascadeTooltip />} />
                  <ReferenceLine
                    y={33}
                    stroke="#f43f5e"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{
                      value: 'Umbral Unicidad Global (33 bits)',
                      fill: '#fb7185',
                      fontSize: 11,
                      position: 'top',
                      offset: 6,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="bits"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#entropyGradient)"
                    dot={{ fill: '#06b6d4', r: 4, stroke: '#020617', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#38bdf8' }}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
                <span>Rastreo Unívoco (&gt;33 bits)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                <span>Anonimato en la Multitud (&lt;15 bits)</span>
              </span>
            </div>
            <div className="text-[11px] text-cyan-400 font-mono">
              Tu huella actual: <strong>{currentBits} bits</strong>
            </div>
          </div>
        </div>

        {/* Interactive Shannon Slider Experiment */}
        <div className="mb-10 rounded-xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl">
          <div className="flex flex-col lg:flex-row items-stretch justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">
                  Experimenta: ¿Qué significa tener N bits de entropía?
                </span>
                <span className="text-xs font-bold font-mono text-cyan-400">
                  {interactiveBits} bits de información
                </span>
              </div>

              <input
                type="range"
                min="2"
                max="38"
                step="1"
                value={interactiveBits}
                onChange={(e) => setInteractiveBits(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />

              <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
                <span>2 bits (1 de 4)</span>
                <span>15 bits (1 de 32k)</span>
                <span className="text-amber-400 font-semibold">33 bits (Población Mundial)</span>
                <span>38 bits</span>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => setInteractiveBits(Math.round(report.totalEntropyBits))}
                  className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
                >
                  Fijar a la huella actual ({report.totalEntropyBits.toFixed(1)} bits)
                </button>
                <button
                  onClick={() => setShowFormulaDetails(!showFormulaDetails)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>{showFormulaDetails ? 'Ocultar Fórmula' : 'Ver Fórmula de Shannon'}</span>
                </button>
              </div>

              {showFormulaDetails && (
                <div className="mt-3 p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
                  <div className="text-cyan-400 font-semibold mb-1 font-sans">Ecuación de Shannon:</div>
                  <code>H(X) = - ∑ P(x) · log₂(P(x))</code>
                  <p className="mt-2 text-slate-400 text-[11px] font-sans">
                    Si una configuración ocurre solo en 1 de cada 10,000 navegadores, su probabilidad P(x) = 0.0001. Su
                    entropía es -log₂(0.0001) = 13.29 bits. Sumando los distintos vectores independientes, se obtiene
                    la entropía total del dispositivo.
                  </p>
                </div>
              )}
            </div>

            <div className="w-full lg:w-80 shrink-0 p-4 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs text-slate-400 block mb-1">Capacidad de Discriminación:</span>
                <div className="text-xl font-bold font-mono text-white">
                  1 entre <span className="text-cyan-300 tabular-nums">{simInfo.text}</span>
                </div>
                <div className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {simInfo.comparison}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                {interactiveBits >= 33 ? (
                  <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                    <AlertOctagon className="h-3.5 w-3.5 shrink-0" />
                    Unicidad absoluta confirmada
                  </span>
                ) : (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                    Anonimato grupal (compartido con otros)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-5 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <BarChart3 className="h-4 w-4 text-cyan-400" />
              <span>Desglose de Entropía por Vector en tu Navegador</span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Total Acumulado:{' '}
              <strong className="text-cyan-400 font-bold tabular-nums">
                {report.totalEntropyBits.toFixed(1)} bits
              </strong>
            </span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {report.entropyBreakdown.map((attr) => {
              const barPercent = Math.min(100, Math.round((attr.entropyBits / attr.maxPossibleBits) * 100));
              return (
                <div
                  key={attr.id}
                  className="p-4 hover:bg-slate-900/30 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1 max-w-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{attr.name}</span>
                      <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                        {attr.category}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">{attr.description}</p>
                    <div className="text-[11px] text-cyan-300 font-mono mt-1 truncate">
                      {attr.valueSummary}
                    </div>
                  </div>

                  <div className="w-full lg:w-48 shrink-0">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Entropía:</span>
                      <span className="font-mono font-bold text-white tabular-nums">
                        {attr.entropyBits.toFixed(1)} / {attr.maxPossibleBits} bits
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          attr.riskLevel === 'Crítico'
                            ? 'bg-rose-500'
                            : attr.riskLevel === 'Alto'
                            ? 'bg-amber-500'
                            : attr.riskLevel === 'Medio'
                            ? 'bg-cyan-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${barPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="w-full lg:w-36 shrink-0 text-left lg:text-right">
                    <span className="text-[10px] text-slate-500 block">Discriminación:</span>
                    <span className="font-mono text-white font-semibold">
                      1 en {attr.uniquenessRatio.toLocaleString('es-ES')}
                    </span>
                  </div>

                  <div className="w-full lg:w-64 shrink-0 text-slate-400 text-[11px] bg-slate-900/60 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                      Mitigación recomendada:
                    </span>
                    {attr.mitigationAvailable}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
