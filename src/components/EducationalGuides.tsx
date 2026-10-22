import React from 'react';
import { Compass, CheckCircle2, XCircle, AlertCircle, ExternalLink, ShieldCheck, Cpu } from 'lucide-react';

export const EducationalGuides: React.FC = () => {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-mono">
          08
        </span>
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Compass className="h-5 w-5 text-cyan-400" />
          Guía Práctica de Navegación & Mitigación Real
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Tier 1: Máximo anonimato */}
        <div className="rounded-xl border border-purple-500/40 bg-purple-950/15 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 font-bold border border-purple-700">
                Nivel Máximo (Cohorte)
              </span>
              <ShieldCheck className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="mt-3 text-lg font-bold text-white">Tor Browser & Mullvad Browser</h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Basados en Firefox ESR con <strong className="text-purple-300">RFP (Resist Fingerprinting)</strong> y Letterboxing activados de fábrica. No buscan ser únicos con trucos aleatorios: todos los usuarios presentan exactamente la misma huella visual, de audio y de hardware.
            </p>

            <ul className="mt-4 space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Uniformidad global de pantalla y fuentes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>WebRTC deshabilitado o estrictamente por proxy</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Enrutamiento Tor o soporte para VPN sin fugas DNS</span>
              </li>
            </ul>
          </div>

          <div className="mt-5 pt-3 border-t border-purple-800/40 text-[11px] text-purple-300/80">
            Ideal para: Investigadores de seguridad, periodistas y máxima protección contra vigilancia estatal.
          </div>
        </div>

        {/* Tier 2: Equilibrio y uso diario */}
        <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/15 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 font-bold border border-cyan-700">
                Navegación Diaria
              </span>
              <ShieldCheck className="h-5 w-5 text-cyan-400" />
            </div>
            <h3 className="mt-3 text-lg font-bold text-white">Brave Browser & LibreWolf</h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Equilibrio óptimo entre compatibilidad con sitios modernos (streaming 4K, banca electrónica, webapps) y mitigación activa mediante <strong className="text-cyan-300">Farbling estocástico</strong> por origen.
            </p>

            <ul className="mt-4 space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Ruido en Canvas y Audio sin romper páginas</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Bloqueo nativo de rastreadores y anuncios en C++</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Aislamiento de cookies de terceros por sitio</span>
              </li>
            </ul>
          </div>

          <div className="mt-5 pt-3 border-t border-cyan-800/40 text-[11px] text-cyan-300/80">
            Ideal para: Usuarios particulares que desean privacidad robusta sin renunciar a la velocidad diaria.
          </div>
        </div>

        {/* Tier 3: Navegadores estándar con mitigaciones */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                Endurecimiento Manual
              </span>
              <AlertCircle className="h-5 w-5 text-amber-400" />
            </div>
            <h3 className="mt-3 text-lg font-bold text-white">Firefox Hardened & Safari</h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Firefox estándar configurado mediante `user.js` (Betterfox o Arkenfox) y Apple Safari con su protección avanzada contra rastreo y huellas digitales en pestañas privadas.
            </p>

            <ul className="mt-4 space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Total Partitioning de cookies y caché local</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Protección avanzada contra fingerprinting en Safari iOS/macOS</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Requiere mantenimiento manual tras actualizaciones</span>
              </li>
            </ul>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Recomendación: Evitar el exceso de extensiones disonantes en Chrome o Edge.
          </div>
        </div>
      </div>
    </section>
  );
};
