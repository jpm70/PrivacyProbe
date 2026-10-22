import React, { useState } from 'react';
import { AlertTriangle, ArrowRight, EyeOff, Link2, Network, ShoppingBag, Stethoscope, UserCheck } from 'lucide-react';
import type { FullFingerprintReport } from '../types/fingerprint';
import { useUi } from '../i18n';

export const CrossContextSimulator: React.FC<{ report: FullFingerprintReport }> = ({ report }) => {
  const { t } = useUi();
  const [step, setStep] = useState(1);
  const id = report.compositeHash.slice(0, 13);
  const gpu = (report.webgl.unmaskedRenderer || report.webgl.renderer || 'GPU').split(/[,(]/)[0].trim();

  const card = (active: boolean, ring: string) =>
    `p-5 rounded-xl border transition-all ${active ? `bg-slate-900/80 ${ring}` : 'bg-slate-950 border-slate-800 opacity-50'}`;

  return (
    <section id="rastreo-cruzado" className="scroll-mt-24">
      <div className="mb-6 max-w-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
          <Network className="h-4 w-4" />
          <span>{t('Rastreo entre webs', 'Cross-site tracking')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
          {t('Así te enlazan sin cookies', 'This is how they link you without cookies')}
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          {t(
            'Un mismo script de terceros presente en muchas webs no necesita que inicies sesión en todas: le basta con reconocer la huella. Recorre los tres pasos con tus datos reales.',
            'A single third-party script present on many sites does not need you to log in everywhere: recognising the fingerprint is enough. Walk through the three steps with your real data.'
          )}
        </p>
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1" role="tablist">
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            role="tab"
            aria-selected={step === n}
            onClick={() => setStep(n)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer border ${
              step === n ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-100'
            }`}
          >
            {n === 1 ? t('1 · Tienda', '1 · Shop') : n === 2 ? t('2 · Web de salud', '2 · Health site') : t('3 · Cruce', '3 · Match')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className={card(step >= 1, 'border-cyan-500/40')}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 text-xs">
            <span className="flex items-center gap-2 font-bold text-slate-100">
              <ShoppingBag className="h-4 w-4 text-cyan-400" />
              {t('Web A: tienda online', 'Site A: online shop')}
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">{t('normal', 'normal')}</span>
          </div>
          <p className="text-xs text-slate-300">{t('Inicias sesión como', 'You log in as')} <strong className="text-slate-100">ana@ejemplo.com</strong>.</p>
          <div className="mt-3 p-3 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300">
            <div>{t('huella', 'fingerprint')}: <span className="text-cyan-300">{id}</span></div>
            <div>GPU: <span className="text-cyan-300">{gpu}</span></div>
            <div>{t('fuentes', 'fonts')}: <span className="text-cyan-300">{report.fonts.detectedCount}</span></div>
          </div>
          <p className="mt-3 text-[11px] text-emerald-400 flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5" />
            {t('La huella queda asociada a tu correo.', 'The fingerprint is stored next to your email.')}
          </p>
        </div>

        <div className={card(step >= 2, 'border-amber-500/40')}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 text-xs">
            <span className="flex items-center gap-2 font-bold text-slate-100">
              <Stethoscope className="h-4 w-4 text-amber-400" />
              {t('Web B: portal de salud', 'Site B: health portal')}
            </span>
            <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
              <EyeOff className="h-3 w-3" />
              {t('incógnito', 'incognito')}
            </span>
          </div>
          <p className="text-xs text-slate-300">{t('Buscas un tratamiento sin iniciar sesión.', 'You look up a treatment without logging in.')}</p>
          <div className="mt-3 p-3 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300">
            <div>{t('huella', 'fingerprint')}: <span className="text-amber-300 font-bold">{id}</span> ({t('igual', 'same')})</div>
            <div>{t('cookies de la web A', 'site A cookies')}: <span className="text-emerald-400">0</span></div>
          </div>
          <p className="mt-3 text-[11px] text-amber-300">{t('No hay cookies, pero la huella coincide.', 'No cookies, but the fingerprint matches.')}</p>
        </div>

        <div className={card(step >= 3, 'border-rose-500/50')}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 text-xs">
            <span className="flex items-center gap-2 font-bold text-slate-100">
              <Network className="h-4 w-4 text-rose-400" />
              {t('Servidor del rastreador', "Tracker's server")}
            </span>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-rose-500/30 text-[11px] text-slate-300 leading-relaxed">
            <span className="flex items-center gap-1.5 font-bold text-rose-300 mb-1">
              <Link2 className="h-3.5 w-3.5" />
              {t('Resultado', 'Result')}
            </span>
            {t('La huella', 'Fingerprint')} <code className="text-cyan-300 font-mono">{id}</code>{' '}
            {t('ya estaba asociada a', 'was already linked to')} <strong className="text-slate-100">ana@ejemplo.com</strong>.{' '}
            {t('Perfil: compras + consulta médica.', 'Profile: shopping + medical query.')}
          </div>
          <p className="mt-3 text-[11px] text-rose-400 flex items-center gap-1.5 font-semibold">
            <AlertTriangle className="h-3.5 w-3.5" />
            {t('La ventana privada no ha servido.', 'The private window did not help.')}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
        <span className="text-slate-400">
          {t(
            'En la UE esto exige tu consentimiento: la Directiva ePrivacy (art. 5.3) cubre leer información del dispositivo, no solo las cookies.',
            'In the EU this requires your consent: the ePrivacy Directive (art. 5(3)) covers reading information from the device, not only cookies.'
          )}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-100 disabled:opacity-40 cursor-pointer"
          >
            {t('Anterior', 'Back')}
          </button>
          <button
            onClick={() => setStep((s) => (s < 3 ? s + 1 : 1))}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-semibold text-white cursor-pointer flex items-center gap-1.5"
          >
            {step < 3 ? t('Siguiente', 'Next') : t('Reiniciar', 'Restart')}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
