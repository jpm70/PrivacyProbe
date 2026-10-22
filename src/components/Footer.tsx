import React from 'react';
import { Shield, ExternalLink, Heart, Terminal, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/80 pt-10 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-900">
          <a
            href="https://www.unfantasmaenelsistema.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <img
              src="/assets/aistudio/icono_81a3db5b.png"
              alt="Logo Un Fantasma en el Sistema"
              className="h-10 w-10 object-contain aspect-square shrink-0 transition-transform group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="text-base font-bold text-white tracking-tight block">
                Un Fantasma en el Sistema
              </span>
              <span className="text-xs text-cyan-400 font-mono">
                Divulgación e Investigación en Ciberseguridad & Privacidad
              </span>
            </div>
          </a>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <a
              href="https://www.unfantasmaenelsistema.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors text-cyan-400 font-medium"
            >
              <span>Visitar Sitio Web Oficial</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              100% Procesamiento Local en Navegador (Zero Telemetría)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-400">
          <div>
            <h4 className="text-white font-semibold mb-2 flex items-center gap-1.5 text-sm">
              <Shield className="h-4 w-4 text-cyan-400" />
              Acerca de PrivacyProbe
            </h4>
            <p className="leading-relaxed">
              Herramienta didáctica de inspección forense diseñada para demostrar cómo los vectores de renderizado (Canvas, WebGL, fuentes y hardware) permiten identificar de forma determinista el navegador de un usuario, desmontando el falso mito del anonimato del Modo Incógnito.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2 flex items-center gap-1.5 text-sm">
              <Terminal className="h-4 w-4 text-cyan-400" />
              Principios de Privacidad
            </h4>
            <p className="leading-relaxed">
              Esta aplicación no envía tus hashes ni información de hardware a ningún servidor externo. Todas las pruebas de canvas, shaders de GPU, WebRTC y cálculos de Shannon se realizan íntegramente en la memoria de tu dispositivo.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2 flex items-center gap-1.5 text-sm">
              <Heart className="h-4 w-4 text-rose-400" />
              Comunidad & Divulgación
            </h4>
            <p className="leading-relaxed">
              Creado para la comunidad hispanohablante de seguridad informática por{' '}
              <a
                href="https://www.unfantasmaenelsistema.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline font-medium"
              >
                Un Fantasma en el Sistema
              </a>
              . Material educativo de libre consulta para estudiantes, auditores y entusiastas de la privacidad.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Un Fantasma en el Sistema. Todos los derechos reservados.</p>
          <p className="font-mono text-slate-400">PrivacyProbe v1.0.0 · Shannon Entropy Engine</p>
        </div>
      </div>
    </footer>
  );
};
