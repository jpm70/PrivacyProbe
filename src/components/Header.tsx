import React from 'react';
import { Compass, Contrast, FileText, Moon, RefreshCw, Sun } from 'lucide-react';
import { BRAND, asset, useUi } from '../i18n';

interface HeaderProps {
  onRescan: () => void;
  isScanning: boolean;
  onOpenReport: () => void;
  onStartTour: () => void;
  reportReady: boolean;
}

const NAV: Array<{ id: string; es: string; en: string }> = [
  { id: 'inicio', es: 'Tu huella', en: 'Your fingerprint' },
  { id: 'incognito', es: 'Incógnito', en: 'Incognito' },
  { id: 'comparativa', es: 'Comparativa', en: 'Comparison' },
  { id: 'inspeccion', es: 'Datos técnicos', en: 'Technical data' },
  { id: 'webrtc-leak', es: 'WebRTC', en: 'WebRTC' },
  { id: 'entropia', es: 'Entropía', en: 'Entropy' },
  { id: 'laboratorio', es: 'Defensas', en: 'Defences' },
  { id: 'glosario', es: 'Glosario', en: 'Glossary' },
];

const iconBtn =
  'items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-2 text-xs font-semibold text-slate-300 hover:text-slate-100 hover:border-slate-700 transition-colors cursor-pointer shrink-0';

export const Header: React.FC<HeaderProps> = ({ onRescan, isScanning, onOpenReport, onStartTour, reportReady }) => {
  const { t, lang, setLang, theme, setTheme, highContrast, setHighContrast } = useUi();

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
        <a
          href={BRAND.web}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2.5 min-w-0"
          title="unfantasmaenelsistema.com"
        >
          <img src={asset('icono.png')} alt="Un fantasma en el sistema" className="h-9 w-9 object-contain shrink-0" />
          <span className="flex flex-col leading-tight min-w-0">
            <span className="text-sm sm:text-base font-bold tracking-tight text-slate-100 truncate">PrivacyProbe</span>
            <span className="text-[11px] text-cyan-400 font-mono truncate">Un fantasma en el sistema</span>
          </span>
        </a>

        <nav className="hidden xl:flex items-center gap-5 text-xs font-medium text-slate-300" aria-label={t('Secciones', 'Sections')}>
          {NAV.map((n) => (
            <button key={n.id} onClick={() => go(n.id)} className="hover:text-cyan-300 transition-colors cursor-pointer whitespace-nowrap">
              {t(n.es, n.en)}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
            className={`${iconBtn} inline-flex`}
            aria-label={t('Switch to English', 'Cambiar a español')}
            title={t('Switch to English', 'Cambiar a español')}
          >
            <span className="font-mono">{lang === 'es' ? 'EN' : 'ES'}</span>
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`${iconBtn} inline-flex`}
            aria-label={theme === 'dark' ? t('Tema claro', 'Light theme') : t('Tema oscuro', 'Dark theme')}
            title={theme === 'dark' ? t('Tema claro', 'Light theme') : t('Tema oscuro', 'Dark theme')}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setHighContrast(!highContrast)}
            aria-pressed={highContrast}
            className={`${iconBtn} hidden sm:inline-flex ${highContrast ? '!bg-yellow-400 !text-black !border-yellow-300' : ''}`}
            title={t('Alto contraste', 'High contrast')}
            aria-label={t('Alto contraste', 'High contrast')}
          >
            <Contrast className="h-4 w-4" />
          </button>
          <button onClick={onStartTour} className={`${iconBtn} hidden md:inline-flex`} title={t('Recorrido guiado', 'Guided tour')}>
            <Compass className="h-4 w-4 text-cyan-400" />
            <span className="hidden lg:inline">{t('Recorrido', 'Tour')}</span>
          </button>
          <button
            onClick={onOpenReport}
            disabled={!reportReady}
            className={`${iconBtn} inline-flex disabled:opacity-50`}
            title={t('Informe descargable', 'Downloadable report')}
            aria-label={t('Informe descargable', 'Downloadable report')}
          >
            <FileText className="h-4 w-4 text-cyan-400" />
            <span className="hidden lg:inline">{t('Informe', 'Report')}</span>
          </button>
          <button
            onClick={onRescan}
            disabled={isScanning}
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50 cursor-pointer shrink-0"
            aria-label={t('Volver a analizar', 'Scan again')}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isScanning ? t('Analizando…', 'Scanning…') : t('Analizar', 'Scan')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
