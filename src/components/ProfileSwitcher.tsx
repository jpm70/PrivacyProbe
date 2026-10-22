import React from 'react';
import { EyeOff, Globe, Laptop, ShieldCheck, Sliders } from 'lucide-react';
import type { ProfileId } from '../types/fingerprint';
import { useUi } from '../i18n';
import { profileName } from '../labels';

interface ProfileSwitcherProps {
  current: ProfileId;
  onSelect: (p: ProfileId) => void;
  sumBits: number;
  isScanning: boolean;
}

export const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({ current, onSelect, sumBits, isScanning }) => {
  const { t, num } = useUi();

  const profiles: Array<{ id: ProfileId; icon: React.ElementType; hint: string; badge: string }> = [
    { id: 'real', icon: Laptop, hint: t('Lo que tu navegador expone de verdad', 'What your browser really exposes'), badge: t('En vivo', 'Live') },
    {
      id: 'incognito',
      icon: EyeOff,
      hint: t('Mismo equipo, misma huella técnica', 'Same machine, same technical fingerprint'),
      badge: t('Sin defensa', 'No defence'),
    },
    { id: 'brave', icon: ShieldCheck, hint: t('Ruido en canvas, audio y núcleos', 'Noise in canvas, audio and cores'), badge: t('Ruido', 'Noise') },
    {
      id: 'tor',
      icon: Globe,
      hint: t('Canvas bloqueado, GPU, fuentes y ventana uniformes', 'Blocked canvas, uniform GPU, fonts and window'),
      badge: t('Uniformidad', 'Uniformity'),
    },
    { id: 'custom', icon: Sliders, hint: t('Activa cada defensa por separado', 'Toggle each defence separately'), badge: t('Laboratorio', 'Lab') },
  ];

  return (
    <section id="perfiles" className="rounded-xl border border-slate-800/80 bg-slate-900/60 px-4 sm:px-6 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">{t('¿Cómo te ve un rastreador?', 'How does a tracker see you?')}</h2>
          <p className="text-xs text-slate-400">
            {t(
              'Los perfiles aplican sobre tus datos reales el efecto documentado de cada defensa: no son esos navegadores.',
              'Profiles apply the documented effect of each defence to your real data: they are not those browsers.'
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300" aria-live="polite">
          <span className="text-slate-400">{t('Bits expuestos (suma):', 'Exposed bits (sum):')}</span>
          <span className="text-cyan-400 font-bold tabular-nums text-sm">{isScanning ? '…' : num(sumBits, 1)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {profiles.map((p) => {
          const Icon = p.icon;
          const selected = current === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              aria-pressed={selected}
              className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all cursor-pointer ${
                selected ? 'bg-slate-800/90 border-cyan-500/60 shadow-lg' : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <span className={`p-1.5 rounded-md ${selected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{p.badge}</span>
              </div>
              <span className={`text-xs font-semibold ${selected ? 'text-slate-100' : 'text-slate-300'}`}>{profileName(p.id, t)}</span>
              <span className="text-[11px] text-slate-400 mt-0.5">{p.hint}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
