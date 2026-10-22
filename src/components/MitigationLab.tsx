import React from 'react';
import { AlertTriangle, Shield, ShieldAlert, Sliders, Sparkles } from 'lucide-react';
import type { AttributeId, DefenseSettings, EntropyEstimate, ProfileId } from '../types/fingerprint';
import { REFERENCE_BITS, STUDIES } from '../services/entropyModel';
import { useUi } from '../i18n';
import { attributeName } from '../labels';

interface Props {
  settings: DefenseSettings;
  profileId: ProfileId;
  onUpdate: (key: keyof DefenseSettings, value: boolean) => void;
  onPreset: (p: 'none' | 'brave' | 'tor') => void;
  estimate: EntropyEstimate;
}

export const MitigationLab: React.FC<Props> = ({ settings, profileId, onUpdate, onPreset, estimate }) => {
  const { t, num } = useUi();
  const active = Object.values(settings).filter(Boolean).length;
  const study = STUDIES[estimate.study];

  const defenses: Array<{ key: keyof DefenseSettings; attrs: AttributeId[]; title: string; body: string; who: string }> = [
    {
      key: 'canvasPoisoning',
      attrs: ['canvas', 'audio'],
      title: t('Ruido en canvas y audio (farbling)', 'Canvas and audio noise (farbling)'),
      body: t(
        'Altera mínimamente lo que se lee del lienzo y del audio, con una semilla nueva por web y sesión. Cada visita da otro hash.',
        'Slightly alters what is read from the canvas and audio, with a new seed per site and session. Each visit yields another hash.'
      ),
      who: t('Brave; Safari y Firefox en modo privado', 'Brave; Safari and Firefox in private mode'),
    },
    {
      key: 'webglMasking',
      attrs: ['webgl'],
      title: t('Ocultar el modelo de GPU', 'Hide the GPU model'),
      body: t('WebGL responde «Mozilla» en lugar del fabricante y el modelo reales.', 'WebGL answers "Mozilla" instead of the real vendor and model.'),
      who: 'Tor Browser, Mullvad Browser, Firefox (resistFingerprinting)',
    },
    {
      key: 'letterboxing',
      attrs: ['screen'],
      title: t('Letterboxing de la ventana', 'Window letterboxing'),
      body: t(
        'Redondea la ventana a múltiplos de 200 × 100 píxeles con márgenes, y la pantalla informa ese mismo tamaño.',
        'Rounds the window to multiples of 200 × 100 pixels with margins, and the screen reports that same size.'
      ),
      who: 'Tor Browser, Mullvad Browser',
    },
    {
      key: 'fontRestriction',
      attrs: ['fonts'],
      title: t('Solo fuentes empaquetadas', 'Bundled fonts only'),
      body: t('El navegador solo deja usar las fuentes que trae él mismo: iguales para todos.', 'The browser only allows the fonts it ships: the same for everyone.'),
      who: 'Tor Browser, Mullvad Browser',
    },
    {
      key: 'hardwareClamping',
      attrs: ['hardware'],
      title: t('Núcleos fijos y memoria oculta', 'Fixed cores and hidden memory'),
      body: t('hardwareConcurrency devuelve siempre el mismo número y deviceMemory desaparece.', 'hardwareConcurrency always returns the same number and deviceMemory disappears.'),
      who: 'Tor Browser, Firefox (resistFingerprinting)',
    },
    {
      key: 'timezoneNormalization',
      attrs: ['timezone'],
      title: t('Zona horaria UTC', 'UTC time zone'),
      body: t('La web ve la hora universal en lugar de tu huso horario.', 'The site sees universal time instead of your time zone.'),
      who: 'Tor Browser, Firefox (resistFingerprinting)',
    },
    {
      key: 'userAgentSpoofing',
      attrs: ['userAgent', 'platform', 'language'],
      title: t('User-Agent e idioma comunes', 'Common User-Agent and language'),
      body: t(
        'Todos los usuarios declaran la misma versión del navegador y el idioma en-US.',
        'All users declare the same browser version and the en-US language.'
      ),
      who: 'Tor Browser',
    },
  ];

  const refBits = (ids: AttributeId[]) => ids.reduce((acc, id) => acc + (REFERENCE_BITS[id][estimate.study] ?? 0), 0);

  return (
    <section id="laboratorio" data-tour="mitigaciones" className="scroll-mt-24 space-y-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
            <Sliders className="h-4 w-4" />
            <span>{t('Laboratorio de defensas', 'Defence lab')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">{t('Activa defensas y mira qué cambia', 'Turn defences on and see what changes')}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {t(
              `Cada defensa vuelve a analizar tu navegador aplicando su efecto. Los bits son los de ${study.name} ${study.year}.`,
              `Each defence rescans your browser applying its effect. Bits come from ${study.name} ${study.year}.`
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">{t('Preajustes:', 'Presets:')}</span>
          {(
            [
              ['none', t('Sin defensas', 'No defences'), profileId === 'real'],
              ['brave', t('Estilo Brave', 'Brave-style'), profileId === 'brave'],
              ['tor', t('Estilo Tor', 'Tor-style'), profileId === 'tor'],
            ] as const
          ).map(([p, label, on]) => (
            <button
              key={p}
              onClick={() => onPreset(p)}
              className={`px-2.5 py-1 rounded border cursor-pointer ${on ? 'bg-cyan-950/60 text-cyan-300 border-cyan-700/60' : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-100'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400">{t('Defensas activas', 'Active defences')}</div>
          <div className="mt-1 text-2xl font-bold font-mono text-slate-100">
            {active}
            <span className="text-xs text-slate-500 font-normal"> / 7</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400">{t('Bits expuestos (suma)', 'Exposed bits (sum)')}</div>
          <div className="mt-1 text-2xl font-bold font-mono text-cyan-400">{num(estimate.sumBits, 1)}</div>
          <div className="text-[11px] text-slate-400">
            {t(`${num(estimate.removedBits, 1)} bits de referencia neutralizados`, `${num(estimate.removedBits, 1)} reference bits neutralised`)}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400">{t('Estrategia', 'Strategy')}</div>
          <div className="mt-1 text-sm font-semibold flex items-center gap-1.5">
            {settings.letterboxing || settings.fontRestriction || settings.webglMasking ? (
              <span className="text-purple-400 flex items-center gap-1.5"><Shield className="h-4 w-4" />{t('Uniformidad', 'Uniformity')}</span>
            ) : settings.canvasPoisoning ? (
              <span className="text-amber-400 flex items-center gap-1.5"><Sparkles className="h-4 w-4" />{t('Ruido', 'Noise')}</span>
            ) : active ? (
              <span className="text-cyan-400 flex items-center gap-1.5"><Shield className="h-4 w-4" />{t('Parcial', 'Partial')}</span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1.5"><ShieldAlert className="h-4 w-4" />{t('Ninguna', 'None')}</span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {t('Uniformidad: pareces otro más del grupo. Ruido: cada sesión pareces alguien distinto.', 'Uniformity: you look like one more of the group. Noise: each session you look like someone else.')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {defenses.map((d) => {
          const on = settings[d.key];
          return (
            <button
              key={d.key}
              role="switch"
              aria-checked={on}
              onClick={() => onUpdate(d.key, !on)}
              className={`text-left rounded-xl border p-4 transition-all cursor-pointer ${on ? 'border-cyan-500/50 bg-cyan-950/20' : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-100 text-sm">{d.title}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${on ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                      {on ? t(`−${num(refBits(d.attrs), 1)} bits`, `−${num(refBits(d.attrs), 1)} bits`) : t('desactivada', 'off')}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{d.body}</p>
                  <p className="mt-2 text-[11px] text-slate-400">
                    <span className="text-cyan-400 font-medium">{t('Afecta a:', 'Affects:')}</span> {d.attrs.map((a) => attributeName(a, t)).join(', ')}
                    <span className="mx-1.5 text-slate-600">·</span>
                    <span className="text-cyan-400 font-medium">{t('Lo usa:', 'Used by:')}</span> {d.who}
                  </p>
                </div>
                <span className={`h-6 w-11 rounded-full relative shrink-0 transition-colors ${on ? 'bg-cyan-600' : 'bg-slate-700'}`} aria-hidden="true">
                  <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${on ? 'right-1' : 'left-1'}`} />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-amber-800/60 bg-amber-950/20 p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
          <h3 className="font-semibold text-amber-300 text-sm">{t('Ojo con las extensiones «anti-huella»', 'Beware of "anti-fingerprint" extensions')}</h3>
          <p>
            {t(
              'Cambiar valores a mano suele dejar incoherencias: un User-Agent de Windows con fuentes de macOS, un canvas que cambia mientras la GPU no… Esas incoherencias se detectan y te hacen más raro, no menos. Además, las propias extensiones se pueden detectar.',
              'Changing values by hand often leaves inconsistencies: a Windows User-Agent with macOS fonts, a canvas that changes while the GPU does not… Such inconsistencies can be detected and make you rarer, not less so. The extensions themselves can also be detected.'
            )}
          </p>
          <p className="text-amber-200/90 font-medium">
            {t(
              'Lo que funciona está dentro del propio navegador: o todos iguales (Tor, Mullvad) o ruido coherente (Brave, Safari y Firefox en modo privado).',
              'What works is built into the browser itself: either everyone the same (Tor, Mullvad) or consistent noise (Brave, Safari and Firefox in private mode).'
            )}
          </p>
        </div>
      </div>
    </section>
  );
};
