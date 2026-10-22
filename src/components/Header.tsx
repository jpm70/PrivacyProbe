import React from 'react';
import { RefreshCw, ExternalLink, FileText, Contrast, Compass } from 'lucide-react';

interface HeaderProps {
  onRescan: () => void;
  isScanning: boolean;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenReport: () => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  onStartTour: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onRescan,
  isScanning,
  activeSection,
  onNavigate,
  onOpenReport,
  isHighContrast,
  onToggleHighContrast,
  onStartTour,
}) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-6 border-b border-slate-800/80 bg-slate-950/90 px-6 py-3.5 backdrop-blur-md">
      {/* Zone 1: Single text element wordmark with logo */}
      <a
        href="https://www.unfantasmaenelsistema.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 transition-opacity hover:opacity-90 whitespace-nowrap shrink-0"
        title="Visitar Un Fantasma en el Sistema (unfantasmaenelsistema.com)"
      >
        <img
          src="/assets/aistudio/icono_81a3db5b.png"
          alt="Logo Un Fantasma en el Sistema"
          className="h-9 w-9 object-contain aspect-square shrink-0 transition-transform group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="flex flex-col text-left">
          <span className="text-sm sm:text-base font-bold tracking-tight text-white leading-tight">
            Un Fantasma en el Sistema
          </span>
          <span className="text-[11px] text-cyan-400 font-mono tracking-tight">
            PrivacyProbe
          </span>
        </div>
      </a>

      {/* Zone 2: 5 clean single-line text navigation links */}
      <nav className="hidden xl:flex items-center gap-6 text-xs font-medium text-slate-300">
        <button
          onClick={() => onNavigate('inspeccion')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 text-left ${
            activeSection === 'inspeccion' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Inspección Técnica
        </button>
        <button
          onClick={() => onNavigate('incognito')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 text-left ${
            activeSection === 'incognito' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Mito de Incógnito
        </button>
        <button
          onClick={() => onNavigate('comparativa')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 text-left ${
            activeSection === 'comparativa' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Comparativa
        </button>
        <button
          onClick={() => onNavigate('rastreo-cruzado')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 text-left ${
            activeSection === 'rastreo-cruzado' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Rastreo Cruzado
        </button>
        <button
          onClick={() => onNavigate('webrtc-leak')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 text-left ${
            activeSection === 'webrtc-leak' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Fuga WebRTC
        </button>
        <button
          onClick={() => onNavigate('laboratorio')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 text-left ${
            activeSection === 'laboratorio' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Laboratorio Defensas
        </button>
        <button
          onClick={() => onNavigate('casos-reales')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 text-left ${
            activeSection === 'casos-reales' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Casos Reales
        </button>
        <button
          onClick={() => onNavigate('glosario')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 text-left ${
            activeSection === 'glosario' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Glosario
        </button>
      </nav>

      {/* Zone 3: 1 primary action + external link + audit report + high contrast toggle + guided tour */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <button
          onClick={onStartTour}
          title="Iniciar Tour Guiado Interactivo por los puntos críticos de la aplicación"
          aria-label="Iniciar Tour Guiado"
          className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-2.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-400 hover:text-white transition-all cursor-pointer whitespace-nowrap shrink-0 group"
        >
          <Compass className="h-4 w-4 text-cyan-400 transition-transform group-hover:rotate-45" />
          <span className="hidden sm:inline">Tour Guiado</span>
        </button>

        <button
          onClick={onToggleHighContrast}
          aria-pressed={isHighContrast}
          title={isHighContrast ? 'Desactivar Modo de Alto Contraste' : 'Activar Modo de Alto Contraste (Accesibilidad Visual AAA)'}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            isHighContrast
              ? 'bg-yellow-400 text-black border-2 border-yellow-300 font-bold shadow-md ring-2 ring-yellow-400'
              : 'border border-slate-800 bg-slate-900/90 text-slate-300 hover:text-white hover:border-slate-700'
          }`}
        >
          <Contrast className="h-4 w-4" />
          <span className="hidden sm:inline">Alto Contraste</span>
        </button>

        <button
          onClick={onOpenReport}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs font-medium text-cyan-300 hover:border-cyan-500/40 hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <FileText className="h-3.5 w-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Informe Forense</span>
        </button>

        <a
          href="https://www.unfantasmaenelsistema.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 hover:text-white whitespace-nowrap shrink-0"
        >
          <span>unfantasmaenelsistema.com</span>
          <ExternalLink className="h-3 w-3 text-cyan-400" />
        </a>

        <button
          onClick={onRescan}
          disabled={isScanning}
          className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-cyan-500 active:scale-95 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Escaneando...' : 'Escanear'}</span>
        </button>
      </div>
    </header>
  );
};
