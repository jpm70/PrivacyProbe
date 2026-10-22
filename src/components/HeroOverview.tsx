import React, { useState } from 'react';
import { AlertTriangle, Check, Copy, Fingerprint, Info, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { EntropyEstimate, FullFingerprintReport, StudyId } from '../types/fingerprint';
import { HIGH_RISK_BITS, STUDIES, WORLD_BITS, oneInN, riskBand } from '../services/entropyModel';
import { useUi } from '../i18n';
import { attributeName, bigNumber, profileName } from '../labels';

interface HeroOverviewProps {
  report: FullFingerprintReport;
  estimate: EntropyEstimate;
  study: StudyId;
  onStudyChange: (s: StudyId) => void;
}

export const StudyPicker: React.FC<{ study: StudyId; onChange: (s: StudyId) => void }> = ({ study, onChange }) => {
  const { t } = useUi();
  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/70 p-1 text-[11px]" role="radiogroup" aria-label={t('Estudio de referencia', 'Reference study')}>
      {(Object.keys(STUDIES) as StudyId[]).map((id) => (
        <button
          key={id}
          role="radio"
          aria-checked={study === id}
          onClick={() => onChange(id)}
          className={`px-2 py-1 rounded-md font-medium cursor-pointer transition-colors ${
            study === id ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          {STUDIES[id].name} {STUDIES[id].year}
        </button>
      ))}
    </div>
  );
};

export const HeroOverview: React.FC<HeroOverviewProps> = ({ report, estimate, study, onStudyChange }) => {
  const { t, num } = useUi();
  const [copied, setCopied] = useState(false);
  const info = STUDIES[study];
  const bits = estimate.sumBits;
  const band = riskBand(bits);
  const n = oneInN(bits);
  const scale = 40;
  const pct = Math.min(100, (bits / scale) * 100);

  const copyHash = async () => {
    try {
      await navigator.clipboard.writeText(report.compositeHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* portapapeles no disponible */
    }
  };

  const bandColor = band === 'high' ? 'text-rose-400' : band === 'medium' ? 'text-amber-300' : 'text-emerald-400';
  const barColor =
    band === 'high' ? 'from-amber-500 to-rose-500' : band === 'medium' ? 'from-cyan-500 to-amber-500' : 'from-emerald-500 to-teal-400';

  return (
    <section id="inicio" data-tour="hero" className="relative rounded-2xl border border-slate-800/80 bg-slate-900/40 px-5 sm:px-8 py-10 overflow-hidden scroll-mt-24">
      <div className="relative flex flex-col lg:flex-row items-stretch justify-between gap-8">
        <div className="flex-1 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-3">
            <Fingerprint className="h-4 w-4" />
            <span>{t('Huella digital del navegador', 'Browser fingerprint')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-100 text-balance leading-tight">
            {t('¿Hasta qué punto es único tu navegador?', 'How unique is your browser?')}
          </h1>
          <p className="mt-4 text-base text-slate-300 leading-relaxed">
            {t(
              'Sin cookies y sin pedir permiso, cualquier web puede leer cómo dibuja tu tarjeta gráfica, qué fuentes tienes, tu pantalla o tu zona horaria. Juntos, esos datos forman una huella que puede seguirte de una web a otra. Aquí ves la tuya, medida en tu navegador y sin enviarla a ningún sitio.',
              'Without cookies or permission, any website can read how your graphics card draws, which fonts you have, your screen or your time zone. Together they form a fingerprint that can follow you from site to site. Here you see yours, measured in your browser and sent nowhere.'
            )}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 rounded-lg bg-slate-900/90 border border-slate-800">
            <span className="text-xs font-medium text-slate-400 whitespace-nowrap">{t('Huella combinada:', 'Combined fingerprint:')}</span>
            <code className="text-xs font-mono text-cyan-300 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 select-all break-all">
              {report.compositeHash}
            </code>
            <button
              onClick={copyHash}
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-slate-100 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer shrink-0"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? t('Copiada', 'Copied') : t('Copiar', 'Copy')}</span>
            </button>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {t(
              'Es un resumen (hash) de todos los datos de abajo. Si la vuelves a calcular mañana sin cambiar nada, saldrá igual: por eso sirve para reconocerte.',
              'It is a digest (hash) of all the data below. Recompute it tomorrow without changing anything and it will be the same: that is why it can recognise you.'
            )}
          </p>
        </div>

        <div className="w-full lg:w-[26rem] shrink-0 flex flex-col gap-4 p-5 rounded-xl border border-slate-800 bg-slate-950/70">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-400">{t('Perfil analizado', 'Analysed profile')}</span>
            <span className="text-xs font-bold text-cyan-400 text-right">{profileName(report.profileId, t)}</span>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-400">{t('Bits expuestos (suma)', 'Exposed bits (sum)')}</span>
              <span className={`text-3xl font-bold font-mono tabular-nums ${bandColor}`}>
                {num(bits, 1)} <span className="text-xs font-normal text-slate-400">bits</span>
              </span>
            </div>
            <div className="relative w-full bg-slate-800 rounded-full h-2.5 overflow-hidden" aria-hidden="true">
              <div className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
              <div className="absolute top-0 bottom-0 w-0.5 bg-rose-400" style={{ left: `${(HIGH_RISK_BITS / scale) * 100}%` }} />
              <div className="absolute top-0 bottom-0 w-0.5 bg-slate-400" style={{ left: `${(WORLD_BITS / scale) * 100}%` }} />
            </div>
            <div className="relative h-4 text-[10px] text-slate-400 font-mono mt-1">
              <span className="absolute left-0">0</span>
              <span className="absolute -translate-x-1/2 text-rose-400" style={{ left: `${(HIGH_RISK_BITS / scale) * 100}%` }}>
                20
              </span>
              <span className="absolute -translate-x-1/2" style={{ left: `${(WORLD_BITS / scale) * 100}%` }}>
                33
              </span>
              <span className="absolute right-0">40</span>
            </div>
          </div>

          <div className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
            band === 'high' ? 'bg-rose-950/30 border-rose-500/40' : band === 'medium' ? 'bg-amber-950/30 border-amber-500/40' : 'bg-emerald-950/30 border-emerald-500/40'
          }`}>
            {band === 'high' ? (
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
            ) : band === 'medium' ? (
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
            ) : (
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
            )}
            <div className="text-slate-300 leading-relaxed">
              {n === null ? (
                <>
                  <strong className="block text-slate-100">{t('Más bits que habitantes tiene la Tierra', 'More bits than people on Earth')}</strong>
                  {t(
                    `La suma supera los ${num(WORLD_BITS, 1)} bits que hacen falta para distinguir a toda la población mundial. No significa «1 entre billones»: significa que, con estos datos, probablemente eres único.`,
                    `The sum exceeds the ${num(WORLD_BITS, 1)} bits needed to tell the whole world population apart. It does not mean "1 in trillions": it means that with this data you are probably unique.`
                  )}
                </>
              ) : (
                <>
                  <strong className="block text-slate-100">
                    {t('Equivale a 1 entre', 'Equivalent to 1 in')} {bigNumber(n, t, num)}
                  </strong>
                  {t(
                    'Si los atributos fueran independientes y se repartieran como en el estudio, tu combinación aparecería en un navegador de cada tantos.',
                    'If attributes were independent and distributed as in the study, your combination would show up in one browser out of that many.'
                  )}
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">{t('Bits según el estudio:', 'Bits according to:')}</span>
            </div>
            <StudyPicker study={study} onChange={onStudyChange} />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t(
                `${info.name} (${info.year}) analizó ${num(info.fingerprints)} huellas; con esa muestra no se pueden medir más de ${num(info.maxBits, 1)} bits. Eran únicas el ${num(info.uniqueDesktop, 1)} % de las de escritorio${info.uniqueMobile ? ` y el ${num(info.uniqueMobile, 1)} % de las de móvil` : ''}.`,
                `${info.name} (${info.year}) analysed ${num(info.fingerprints)} fingerprints; that sample cannot measure more than ${num(info.maxBits, 1)} bits. ${num(info.uniqueDesktop, 1)}% of desktop fingerprints${info.uniqueMobile ? ` and ${num(info.uniqueMobile, 1)}% of mobile ones` : ''} were unique.`
              )}
            </p>
          </div>

          <div className="flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed border-t border-slate-800 pt-3">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-cyan-400" />
            <span>
              {t(
                'La suma es una cota superior: los atributos están relacionados (el User-Agent y la plataforma, la GPU y el canvas…) y Google midió en 2024 que la entropía conjunta es claramente menor.',
                'The sum is an upper bound: attributes are related (User-Agent and platform, GPU and canvas…) and Google measured in 2024 that the joint entropy is clearly lower.'
              )}
              {estimate.unmeasured.length > 0 &&
                ' ' +
                  t(
                    `No cuentan, porque el estudio no los midió: ${estimate.unmeasured.map((id) => attributeName(id, t)).join(', ')}.`,
                    `Not counted, because the study did not measure them: ${estimate.unmeasured.map((id) => attributeName(id, t)).join(', ')}.`
                  )}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
