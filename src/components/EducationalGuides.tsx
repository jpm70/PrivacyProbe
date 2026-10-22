import React from 'react';
import { AlertCircle, CheckCircle2, Compass, ShieldCheck } from 'lucide-react';
import { useUi } from '../i18n';

export const EducationalGuides: React.FC = () => {
  const { t } = useUi();

  const tiers = [
    {
      badge: t('Máxima uniformidad', 'Maximum uniformity'),
      title: 'Tor Browser · Mullvad Browser',
      color: 'purple',
      body: t(
        'Basados en Firefox ESR con resistFingerprinting y letterboxing de serie. No inventan valores: todos sus usuarios muestran la misma huella. Tor además oculta tu IP; Mullvad Browser es el mismo navegador para usar con una VPN.',
        'Based on Firefox ESR with resistFingerprinting and letterboxing out of the box. They do not invent values: all their users show the same fingerprint. Tor also hides your IP; Mullvad Browser is the same browser meant for use with a VPN.'
      ),
      ok: [t('Pantalla, fuentes y GPU iguales para todos', 'Same screen, fonts and GPU for everyone'), t('Canvas bloqueado salvo que lo permitas', 'Canvas blocked unless you allow it')],
      warn: [t('No lo personalices: extensiones o ventana maximizada te hacen destacar', 'Do not customise it: extensions or a maximised window make you stand out')],
      who: t('Periodistas, activistas, investigación sensible.', 'Journalists, activists, sensitive research.'),
    },
    {
      badge: t('Día a día', 'Everyday'),
      title: 'Brave',
      color: 'cyan',
      body: t(
        'Ruido (farbling) en canvas, WebGL, audio y otras APIs, distinto por web y sesión, sin romper las webs. Bloquea rastreadores y anuncios de serie.',
        'Noise (farbling) in canvas, WebGL, audio and other APIs, different per site and session, without breaking websites. Blocks trackers and ads out of the box.'
      ),
      ok: [t('Huellas que no se pueden enlazar entre sesiones', 'Fingerprints that cannot be linked across sessions'), t('Compatible con casi todo', 'Works with nearly everything')],
      warn: [t('La GPU, la pantalla y el User-Agent siguen siendo los tuyos', 'GPU, screen and User-Agent are still yours')],
      who: t('Quien quiere más privacidad sin complicarse.', 'Anyone wanting more privacy without hassle.'),
    },
    {
      badge: t('Ajuste manual', 'Manual tuning'),
      title: 'Firefox · LibreWolf · Safari',
      color: 'slate',
      body: t(
        'Firefox en modo estricto y en ventanas privadas aleatoriza el canvas; con resistFingerprinting (o LibreWolf, que lo trae activado) se acerca a Tor. Safari mete ruido en navegación privada y, desde Safari 26, en todas las sesiones.',
        'Firefox in strict mode and private windows randomises the canvas; with resistFingerprinting (or LibreWolf, which ships with it on) it gets close to Tor. Safari adds noise in private browsing and, since Safari 26, in all sessions.'
      ),
      ok: [t('Aislamiento total de cookies por web', 'Total cookie isolation per site'), t('Protecciones sin instalar nada', 'Protection without installing anything')],
      warn: [t('resistFingerprinting puede romper algunas webs', 'resistFingerprinting can break some sites')],
      who: t('Usuarios que no temen tocar la configuración.', 'Users not afraid of tweaking settings.'),
    },
  ];

  const border: Record<string, string> = {
    purple: 'border-purple-500/40 bg-purple-950/15',
    cyan: 'border-cyan-500/40 bg-cyan-950/15',
    slate: 'border-slate-800 bg-slate-900/50',
  };

  return (
    <section id="guia" className="scroll-mt-24 space-y-5">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <Compass className="h-5 w-5 text-cyan-400" />
          {t('Qué navegador usar', 'Which browser to use')}
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          {t('Ninguno es perfecto: elige según contra quién te quieras proteger.', 'None is perfect: choose according to who you want protection from.')}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tiers.map((tier) => (
          <div key={tier.title} className={`rounded-xl border p-5 flex flex-col justify-between ${border[tier.color]}`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">{tier.badge}</span>
                <ShieldCheck className="h-5 w-5 text-cyan-400" />
              </div>
              <h3 className="mt-3 text-lg font-bold text-slate-100">{tier.title}</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">{tier.body}</p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                {tier.ok.map((x) => (
                  <li key={x} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    {x}
                  </li>
                ))}
                {tier.warn.map((x) => (
                  <li key={x} className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-5 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              {t('Para: ', 'For: ')}
              {tier.who}
            </p>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400">
        {t(
          'En Chrome o Edge, lo más útil es no llenar el navegador de extensiones «anti-huella» y rechazar el seguimiento en los banners de consentimiento: en la UE la huella también necesita tu permiso.',
          'In Chrome or Edge, the most useful thing is not to pile up "anti-fingerprint" extensions and to refuse tracking in consent banners: in the EU fingerprinting also needs your permission.'
        )}
      </p>
    </section>
  );
};
