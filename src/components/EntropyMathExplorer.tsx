import React, { useMemo, useState } from 'react';
import { BarChart3, Calculator, HelpCircle } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { EntropyEstimate, StudyId } from '../types/fingerprint';
import { ATTRIBUTE_ORDER, REFERENCE_BITS, STUDIES, WORLD_BITS, oneInN, surprisal } from '../services/entropyModel';
import { useUi } from '../i18n';
import { attributeHint, attributeName, bigNumber, statusClass, statusLabel } from '../labels';
import { StudyPicker } from './HeroOverview';

interface Props {
  estimate: EntropyEstimate;
  study: StudyId;
  onStudyChange: (s: StudyId) => void;
}

const STUDY_COLORS: Record<StudyId, string> = {
  panopticlick2010: '#a78bfa',
  amiunique2016: '#22d3ee',
  hiding2018: '#f59e0b',
};

export const EntropyMathExplorer: React.FC<Props> = ({ estimate, study, onStudyChange }) => {
  const { t, num, theme } = useUi();
  const [shareOneIn, setShareOneIn] = useState(1000);
  const [bits, setBits] = useState(20);
  const [formula, setFormula] = useState(false);

  const chartData = useMemo(
    () =>
      ATTRIBUTE_ORDER.filter((id) => Object.values(REFERENCE_BITS[id]).some((v) => v !== null && v > 0)).map((id) => ({
        name: attributeName(id, t),
        panopticlick2010: REFERENCE_BITS[id].panopticlick2010,
        amiunique2016: REFERENCE_BITS[id].amiunique2016,
        hiding2018: REFERENCE_BITS[id].hiding2018,
      })),
    [t]
  );

  const axis = theme === 'dark' ? '#94a3b8' : '#475569';
  const grid = theme === 'dark' ? '#1e293b' : '#e2e8f0';
  const tooltipBg = theme === 'dark' ? '#0f172a' : '#ffffff';

  const s = surprisal(1 / shareOneIn);
  const n = oneInN(bits);

  return (
    <section id="entropia" data-tour="entropia" className="scroll-mt-24 space-y-8">
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
          <Calculator className="h-4 w-4" />
          <span>{t('Entropía de Shannon', 'Shannon entropy')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
          {t('Cuánta información da cada dato', 'How much information each value gives away')}
        </h2>
        <p className="mt-2 text-sm text-slate-300 leading-relaxed">
          {t(
            'Un bit de información parte la población por la mitad. Si tu valor lo comparte 1 de cada 8 navegadores, aporta 3 bits (2³ = 8). La entropía de un atributo es la media de esos bits en toda la población: por eso no se puede calcular desde un solo navegador y hace falta un estudio con muchas huellas.',
            'One bit of information halves the population. If 1 in 8 browsers shares your value, it gives away 3 bits (2³ = 8). The entropy of an attribute is the average of those bits over the whole population: that is why it cannot be computed from a single browser and a study with many fingerprints is needed.'
          )}
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-100">
            <BarChart3 className="h-4 w-4 text-cyan-400" />
            {t('Entropía medida por atributo en tres estudios', 'Measured entropy per attribute in three studies')}
          </h3>
          <span className="text-[11px] text-slate-400">{t('bits · fuente: Laperdrix et al., tabla 3', 'bits · source: Laperdrix et al., table 3')}</span>
        </div>
        <div className="w-full h-80" role="img" aria-label={t('Gráfica de barras de entropía por atributo y estudio', 'Bar chart of entropy per attribute and study')}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -18, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
              <XAxis dataKey="name" stroke={axis} fontSize={11} tickLine={false} interval={0} angle={-30} textAnchor="end" />
              <YAxis stroke={axis} fontSize={11} domain={[0, 14]} />
              <Tooltip
                contentStyle={{ background: tooltipBg, border: `1px solid ${grid}`, borderRadius: 8, fontSize: 12 }}
                formatter={(value) => (value === null || value === undefined ? t('no medido', 'not measured') : `${num(Number(value), 2)} bits`)}
              />
              <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: 11 }} />
              {(Object.keys(STUDIES) as StudyId[]).map((id) => (
                <Bar key={id} dataKey={id} name={`${STUDIES[id].name} ${STUDIES[id].year}`} fill={STUDY_COLORS[id]} radius={[3, 3, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">
          {t(
            'Fíjate en la zona horaria: 3,3 bits en AmIUnique (visitantes de todo el mundo) y 0,16 en «Hiding in the Crowd», recogido en una web francesa donde casi todos estaban en la misma zona. La entropía depende de la población, no solo del atributo. Y la de las fuentes cae porque cada vez menos navegadores tenían Flash, que las listaba todas.',
            'Look at the time zone: 3.3 bits in AmIUnique (visitors worldwide) and 0.16 in "Hiding in the Crowd", collected on a French site where nearly everyone was in the same zone. Entropy depends on the population, not only on the attribute. And font entropy drops because fewer and fewer browsers had Flash, which listed them all.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5">
          <h3 className="text-sm font-bold text-slate-100 mb-1">{t('Autoinformación de un valor', 'Self-information of a value')}</h3>
          <p className="text-xs text-slate-400 mb-3">{t('¿Cuántos navegadores comparten tu valor? Uno de cada…', 'How many browsers share your value? One in…')}</p>
          <input
            type="range"
            min={1}
            max={6}
            step={0.01}
            value={Math.log10(shareOneIn)}
            onChange={(e) => setShareOneIn(Math.round(Math.pow(10, Number(e.target.value))))}
            className="w-full accent-cyan-400 cursor-pointer"
            aria-label={t('Uno de cada N navegadores', 'One in N browsers')}
          />
          <div className="mt-3 flex items-baseline justify-between text-sm">
            <span className="text-slate-300">
              1 {t('de cada', 'in')} <strong className="text-slate-100 font-mono">{num(shareOneIn)}</strong>
            </span>
            <span className="font-mono text-cyan-300 font-bold">−log₂(1/{num(shareOneIn)}) = {num(s, 2)} bits</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {t(
              'Un valor raro aporta muchos bits; uno común, pocos. Una resolución de 1920 × 1080 dice poco; una de 3440 × 1440, bastante más.',
              'A rare value gives away many bits; a common one, few. A 1920 × 1080 resolution says little; a 3440 × 1440 one, much more.'
            )}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5">
          <h3 className="text-sm font-bold text-slate-100 mb-1">{t('¿Qué son N bits?', 'What are N bits?')}</h3>
          <p className="text-xs text-slate-400 mb-3">{t('Mueve el control:', 'Move the slider:')}</p>
          <input
            type="range"
            min={1}
            max={40}
            value={bits}
            onChange={(e) => setBits(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
            aria-label={t('Bits', 'Bits')}
          />
          <div className="mt-3 text-sm text-slate-300">
            <strong className="font-mono text-cyan-300">{bits} bits</strong> →{' '}
            {n === null ? (
              <span>
                {t(
                  `más de 2^${num(WORLD_BITS, 1)}: ya no hay tanta gente en la Tierra. Basta para distinguir a cualquiera.`,
                  `more than 2^${num(WORLD_BITS, 1)}: there are not that many people on Earth. Enough to tell anyone apart.`
                )}
              </span>
            ) : (
              <span>
                {t('distinguen entre', 'distinguish among')} <strong className="text-slate-100">{bigNumber(n, t, num)}</strong> {t('posibilidades', 'possibilities')}.
              </span>
            )}
          </div>
          <button onClick={() => setFormula(!formula)} className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 cursor-pointer">
            <HelpCircle className="h-3.5 w-3.5" />
            {formula ? t('Ocultar fórmulas', 'Hide formulas') : t('Ver fórmulas', 'Show formulas')}
          </button>
          {formula && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
              <p className="font-mono">H(X) = −Σ P(xᵢ) · log₂ P(xᵢ)</p>
              <p className="font-mono">{t('autoinformación', 'self-information')}: I(x) = −log₂ P(x)</p>
              <p className="font-mono">H(X, Y) ≤ H(X) + H(Y)</p>
              <p className="text-slate-400">
                {t(
                  'La igualdad solo se da si X e Y son independientes. Por eso sumar las entropías de los atributos sobrestima la huella.',
                  'Equality only holds if X and Y are independent. That is why summing attribute entropies overestimates the fingerprint.'
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/70 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/80 px-5 py-3">
          <span className="flex items-center gap-2 text-xs font-semibold text-slate-100">
            <BarChart3 className="h-4 w-4 text-cyan-400" />
            {t('Tus atributos y lo que aportan', 'Your attributes and what they add')}
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <StudyPicker study={study} onChange={onStudyChange} />
            <span className="text-xs font-mono text-slate-300">
              {t('Suma', 'Sum')}: <strong className="text-cyan-400">{num(estimate.sumBits, 1)} bits</strong>
            </span>
          </div>
        </div>
        <ul className="divide-y divide-slate-800/60">
          {estimate.attributes.map((a) => (
            <li key={a.id} className="px-5 py-3 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center text-xs">
              <div className="md:col-span-4 min-w-0">
                <span className="font-semibold text-slate-100">{attributeName(a.id, t)}</span>
                <p className="text-[11px] text-slate-400">{attributeHint(a.id, t)}</p>
              </div>
              <code className="md:col-span-4 font-mono text-[11px] text-cyan-300 break-all">{a.value}</code>
              <span className="md:col-span-2">
                <span className={`px-1.5 py-0.5 rounded border text-[10px] ${statusClass(a.status)}`}>{statusLabel(a.status, t)}</span>
              </span>
              <span className="md:col-span-2 md:text-right font-mono">
                {a.referenceBits === null ? (
                  <span className="text-slate-500">{t('no medido', 'not measured')}</span>
                ) : (
                  <span className={a.status === 'exposed' ? 'text-slate-100 font-semibold' : 'text-slate-500 line-through'}>{num(a.referenceBits, 2)} bits</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
