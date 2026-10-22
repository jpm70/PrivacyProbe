import React from 'react';
import { Laptop, EyeOff, ShieldCheck, Globe, Sliders } from 'lucide-react';

export type ProfileId = 'real' | 'incognito' | 'brave' | 'tor' | 'custom';

interface ProfileSwitcherProps {
  currentProfile: ProfileId;
  onSelectProfile: (profile: ProfileId) => void;
  totalEntropyBits: number;
}

export const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({
  currentProfile,
  onSelectProfile,
  totalEntropyBits,
}) => {
  const profiles = [
    {
      id: 'real' as ProfileId,
      name: 'Tu Navegador Real',
      icon: Laptop,
      hint: 'Lectura real en vivo sin filtros',
      badge: 'Datos en vivo',
    },
    {
      id: 'incognito' as ProfileId,
      name: 'Modo Incógnito',
      icon: EyeOff,
      hint: 'Mismo hardware, misma huella técnica',
      badge: 'Sin protección de fingerprint',
    },
    {
      id: 'brave' as ProfileId,
      name: 'Brave (Farbling)',
      icon: ShieldCheck,
      hint: 'Canvas Poisoning: ruido aleatorio en píxeles',
      badge: 'Estrategia de Ruido',
    },
    {
      id: 'tor' as ProfileId,
      name: 'Tor Browser',
      icon: Globe,
      hint: 'Letterboxing, fuentes fijas y GPU uniforme',
      badge: 'Estrategia de Homogeneidad',
    },
    {
      id: 'custom' as ProfileId,
      name: 'Laboratorio Sandbox',
      icon: Sliders,
      hint: 'Prueba activar/desactivar cada vector',
      badge: 'Interactivo',
    },
  ];

  return (
    <section id="perfiles" className="border-b border-slate-800/80 bg-slate-900/60 px-6 py-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide">
              Comparativa de Entorno y Mitigaciones
            </h2>
            <p className="text-xs text-slate-400">
              Observa cómo muta la entropía criptográfica y la capacidad de rastreo según las defensas activadas.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <span className="text-slate-400">Entropía Resultante:</span>
            <span className="text-cyan-400 font-bold tabular-nums text-sm">{totalEntropyBits.toFixed(1)} bits</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {profiles.map((p) => {
            const Icon = p.icon;
            const isSelected = currentProfile === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectProfile(p.id)}
                className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500/60 shadow-lg shadow-cyan-950/20'
                    : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span
                    className={`p-1.5 rounded-md ${
                      isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{p.badge}</span>
                </div>
                <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {p.name}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{p.hint}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
