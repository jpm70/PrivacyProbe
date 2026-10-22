import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeftRight,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Cpu,
  Monitor,
  Palette,
  Volume2,
  Layers,
  Copy,
  Check,
  Globe,
  SlidersHorizontal,
  Flame,
  Info,
  Laptop,
  EyeOff,
  Sparkles,
  HelpCircle,
  FileCheck2,
} from 'lucide-react';
import { FullFingerprintReport, ProfileId } from '../types/fingerprint';
import { generateFingerprintReport } from '../services/fingerprintCollector';

interface ProfileComparisonPanelProps {
  currentLiveReport?: FullFingerprintReport;
}

interface ProfileOption {
  id: ProfileId;
  name: string;
  tagline: string;
  badge: string;
  badgeColor: string;
}

const PROFILE_OPTIONS: ProfileOption[] = [
  {
    id: 'real',
    name: 'Tu Navegador Real',
    tagline: 'Hardware y renderizado nativo sin modificaciones',
    badge: 'Datos en Vivo',
    badgeColor: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
  },
  {
    id: 'incognito',
    name: 'Modo Incógnito',
    tagline: 'Mismo hardware, GPU y Canvas (0 mitigación de fingerprint)',
    badge: 'Sin Protección',
    badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
  },
  {
    id: 'brave',
    name: 'Brave (Farbling)',
    tagline: 'Inyección de ruido pseudoaleatorio por sesión en Canvas y Audio',
    badge: 'Estrategia de Ruido',
    badgeColor: 'border-orange-500/30 text-orange-400 bg-orange-500/10',
  },
  {
    id: 'tor',
    name: 'Tor Browser',
    tagline: 'Letterboxing, 2 cores, GPU Mesa genérica y cohorte uniforme',
    badge: 'Homogeneidad Total',
    badgeColor: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
  },
  {
    id: 'custom',
    name: 'Sandbox Mitigado',
    tagline: 'Todas las mitigaciones del laboratorio activadas simultáneamente',
    badge: 'Blindaje Máximo',
    badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
  },
];

type DiffFilter = 'all' | 'diffs' | 'equals';

export const ProfileComparisonPanel: React.FC<ProfileComparisonPanelProps> = ({ currentLiveReport }) => {
  const [profileA, setProfileA] = useState<ProfileId>('real');
  const [profileB, setProfileB] = useState<ProfileId>('tor');

  const [reportA, setReportA] = useState<FullFingerprintReport | null>(
    profileA === 'real' && currentLiveReport ? currentLiveReport : null
  );
  const [reportB, setReportB] = useState<FullFingerprintReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<DiffFilter>('all');
  const [showCanvasPreview, setShowCanvasPreview] = useState<boolean>(true);

  // Fetch or regenerate reports when profiles change
  useEffect(() => {
    let isCancelled = false;

    const loadReports = async () => {
      setIsLoading(true);
      try {
        const [resA, resB] = await Promise.all([
          profileA === 'real' && currentLiveReport ? Promise.resolve(currentLiveReport) : generateFingerprintReport(profileA),
          profileB === 'real' && currentLiveReport ? Promise.resolve(currentLiveReport) : generateFingerprintReport(profileB),
        ]);

        if (!isCancelled) {
          setReportA(resA);
          setReportB(resB);
        }
      } catch (err) {
        console.error('Error generating comparison reports:', err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadReports();

    return () => {
      isCancelled = true;
    };
  }, [profileA, profileB, currentLiveReport]);

  const handleSwapProfiles = () => {
    const tempA = profileA;
    setProfileA(profileB);
    setProfileB(tempA);
  };

  const applyPreset = (a: ProfileId, b: ProfileId) => {
    setProfileA(a);
    setProfileB(b);
  };

  // Calculations for delta
  const entropyA = reportA?.totalEntropyBits ?? 0;
  const entropyB = reportB?.totalEntropyBits ?? 0;
  const deltaEntropy = Math.round(Math.abs(entropyA - entropyB) * 10) / 10;
  const isIdenticalEntropy = deltaEntropy === 0;
  const isHashIdentical = reportA && reportB ? reportA.compositeHash === reportB.compositeHash : false;

  // Search space reduction factor 2^(delta)
  const reductionFactorText = useMemo(() => {
    if (deltaEntropy === 0) return '1x (Ninguna reducción)';
    if (deltaEntropy > 30) return '> 1.000.000.000x (Mil millones de veces)';
    if (deltaEntropy > 20) return `~ ${(Math.pow(2, deltaEntropy) / 1_000_000).toFixed(1)}M veces`;
    if (deltaEntropy > 10) return `~ ${(Math.pow(2, deltaEntropy) / 1_000).toFixed(1)}k veces`;
    return `${Math.round(Math.pow(2, deltaEntropy))} veces`;
  }, [deltaEntropy]);

  // Comparison matrix items
  interface AttributeComparisonRow {
    id: string;
    category: 'Gráficos' | 'Audio' | 'Pantalla' | 'Hardware' | 'Fuentes' | 'Entorno';
    name: string;
    icon: React.ElementType;
    valA: string;
    valB: string;
    isDifferent: boolean;
    technicalImpact: string;
    mitigationType: string;
  }

  const comparisonRows: AttributeComparisonRow[] = useMemo(() => {
    if (!reportA || !reportB) return [];

    return [
      {
        id: 'composite-hash',
        category: 'Gráficos',
        name: 'Hash Compuesto Global',
        icon: Sparkles,
        valA: reportA.compositeHash,
        valB: reportB.compositeHash,
        isDifferent: reportA.compositeHash !== reportB.compositeHash,
        technicalImpact: 'Identificador único resultante de la mezcla criptográfica FNV-1a y MurmurHash3.',
        mitigationType: reportA.compositeHash !== reportB.compositeHash ? 'Divergencia Total' : 'Rastreo Cruzado Inmediato',
      },
      {
        id: 'canvas-hash',
        category: 'Gráficos',
        name: 'Firma Canvas 2D (Hash)',
        icon: Palette,
        valA: `${reportA.canvas.hash} ${reportA.canvas.isPoisoned ? '(Ruido activo)' : '(Sin mitigar)'}`,
        valB: `${reportB.canvas.hash} ${reportB.canvas.isPoisoned ? '(Ruido activo)' : '(Sin mitigar)'}`,
        isDifferent: reportA.canvas.hash !== reportB.canvas.hash,
        technicalImpact: 'Diferencias a nivel de subpíxel causadas por antialiasing del SO y GPU.',
        mitigationType: reportA.canvas.isPoisoned || reportB.canvas.isPoisoned ? 'Canvas Farbling / Poisoning' : 'Idéntico',
      },
      {
        id: 'webgl-renderer',
        category: 'Gráficos',
        name: 'WebGL GPU Unmasked Renderer',
        icon: Monitor,
        valA: reportA.webgl.unmaskedRenderer || reportA.webgl.renderer,
        valB: reportB.webgl.unmaskedRenderer || reportB.webgl.renderer,
        isDifferent: reportA.webgl.unmaskedRenderer !== reportB.webgl.unmaskedRenderer,
        technicalImpact: 'Revela el modelo exacto de tarjeta gráfica del equipo físico.',
        mitigationType: reportB.webgl.isMasked || reportA.webgl.isMasked ? 'Enmascaramiento de GPU (Mesa)' : 'Exposición directa',
      },
      {
        id: 'audio-hash',
        category: 'Audio',
        name: 'Firma de AudioContext (Hash)',
        icon: Volume2,
        valA: `${reportA.audio.hash.slice(0, 10)}... ${reportA.audio.isSpoofed ? '(Spoofed)' : '(Real)'}`,
        valB: `${reportB.audio.hash.slice(0, 10)}... ${reportB.audio.isSpoofed ? '(Spoofed)' : '(Real)'}`,
        isDifferent: reportA.audio.hash !== reportB.audio.hash,
        technicalImpact: 'Procesamiento en coma flotante a través de filtros Biquad y analizadores FFT.',
        mitigationType: reportA.audio.isSpoofed || reportB.audio.isSpoofed ? 'Perturbación de onda acústica' : 'Idéntico',
      },
      {
        id: 'display-resolution',
        category: 'Pantalla',
        name: 'Resolución de Pantalla y Ventana',
        icon: Monitor,
        valA: `${reportA.display.screenWidth}×${reportA.display.screenHeight} (Ventana: ${reportA.display.windowInnerWidth}×${reportA.display.windowInnerHeight})`,
        valB: `${reportB.display.screenWidth}×${reportB.display.screenHeight} (Ventana: ${reportB.display.windowInnerWidth}×${reportB.display.windowInnerHeight})`,
        isDifferent:
          reportA.display.screenWidth !== reportB.display.screenWidth ||
          reportA.display.screenHeight !== reportB.display.screenHeight ||
          reportA.display.isLetterboxed !== reportB.display.isLetterboxed,
        technicalImpact: 'Las dimensiones reales de pantalla y posición de barras aíslan de forma precisa al usuario.',
        mitigationType: reportA.display.isLetterboxed || reportB.display.isLetterboxed ? 'Letterboxing (Tor Cohort)' : 'Medición nativa',
      },
      {
        id: 'hardware-cores',
        category: 'Hardware',
        name: 'Núcleos de CPU (Concurrency)',
        icon: Cpu,
        valA: `${reportA.hardware.hardwareConcurrency} núcleos lógicos`,
        valB: `${reportB.hardware.hardwareConcurrency} núcleos lógicos`,
        isDifferent: reportA.hardware.hardwareConcurrency !== reportB.hardware.hardwareConcurrency,
        technicalImpact: '`navigator.hardwareConcurrency` revela el rango de potencia del procesador.',
        mitigationType:
          reportA.hardware.hardwareConcurrency <= 2 || reportB.hardware.hardwareConcurrency <= 2
            ? 'Hardware Clamping (2 núcleos)'
            : 'Fuga de arquitectura',
      },
      {
        id: 'hardware-memory',
        category: 'Hardware',
        name: 'Memoria RAM del Dispositivo',
        icon: Layers,
        valA: reportA.hardware.deviceMemory ? `${reportA.hardware.deviceMemory} GB` : 'No reportada / Oculta',
        valB: reportB.hardware.deviceMemory ? `${reportB.hardware.deviceMemory} GB` : 'No reportada / Oculta',
        isDifferent: reportA.hardware.deviceMemory !== reportB.hardware.deviceMemory,
        technicalImpact: 'API `navigator.deviceMemory` (Chrome/Chromium) redondeada a potencias de dos.',
        mitigationType: 'Estandarización de memoria',
      },
      {
        id: 'fonts-installed',
        category: 'Fuentes',
        name: 'Fuentes Tipográficas Detectadas',
        icon: Palette,
        valA: `${reportA.fonts.detectedCount} fuentes (${reportA.fonts.isRestricted ? 'Restringido' : 'Escaneo completo'})`,
        valB: `${reportB.fonts.detectedCount} fuentes (${reportB.fonts.isRestricted ? 'Restringido' : 'Escaneo completo'})`,
        isDifferent: reportA.fonts.detectedCount !== reportB.fonts.detectedCount,
        technicalImpact: 'La lista de fuentes locales de diseño o desarrollo proporciona más de 12 bits de entropía.',
        mitigationType: reportA.fonts.isRestricted || reportB.fonts.isRestricted ? 'Font Whitelist (Tor RFP)' : 'Muestreo no restringido',
      },
      {
        id: 'system-env',
        category: 'Entorno',
        name: 'User-Agent y Plataforma',
        icon: Globe,
        valA: reportA.environment.userAgent.includes('rv:128.0') ? 'Firefox ESR (Tor Standard)' : reportA.environment.userAgent.slice(0, 42) + '...',
        valB: reportB.environment.userAgent.includes('rv:128.0') ? 'Firefox ESR (Tor Standard)' : reportB.environment.userAgent.slice(0, 42) + '...',
        isDifferent: reportA.environment.userAgent !== reportB.environment.userAgent,
        technicalImpact: 'Identifica la arquitectura del SO, versión del kernel y versión exacta del motor web.',
        mitigationType: 'Congelación de User-Agent',
      },
      {
        id: 'timezone',
        category: 'Entorno',
        name: 'Zona Horaria y Localización',
        icon: Globe,
        valA: `${reportA.environment.timezone} (${reportA.environment.timezoneOffset} min)`,
        valB: `${reportB.environment.timezone} (${reportB.environment.timezoneOffset} min)`,
        isDifferent: reportA.environment.timezone !== reportB.environment.timezone,
        technicalImpact: 'Permite acotar el huso geográfico del usuario sin necesidad de permisos de GPS.',
        mitigationType:
          reportA.environment.timezone === 'UTC' || reportB.environment.timezone === 'UTC'
            ? 'Normalización a UTC (GMT+0)'
            : 'Fuga de huso horario',
      },
    ];
  }, [reportA, reportB]);

  const diffCount = comparisonRows.filter((r) => r.isDifferent).length;
  const equalCount = comparisonRows.filter((r) => !r.isDifferent).length;

  const filteredRows = useMemo(() => {
    if (filterMode === 'diffs') return comparisonRows.filter((r) => r.isDifferent);
    if (filterMode === 'equals') return comparisonRows.filter((r) => !r.isDifferent);
    return comparisonRows;
  }, [comparisonRows, filterMode]);

  const copyComparisonToClipboard = () => {
    if (!reportA || !reportB) return;
    const text = `=== PRIVACYPROBE: COMPARATIVA DE HUELLA DIGITAL ===
Perfil A: ${reportA.profileName} (${reportA.totalEntropyBits} bits, 1 en ${reportA.oneInX.toLocaleString()})
Perfil B: ${reportB.profileName} (${reportB.totalEntropyBits} bits, 1 en ${reportB.oneInX.toLocaleString()})
Diferencia de Entropía: ${deltaEntropy} bits (Reducción de espacio: ${reductionFactorText})
Coincidencia de Hash Compuesto: ${isHashIdentical ? 'IDÉNTICO (Misma Identidad Rastreable)' : 'DIVERGENTE (Sesiones desvinculadas)'}

ATRIBUTOS COMPARADOS:
${comparisonRows
  .map(
    (r) =>
      `- [${r.category}] ${r.name}: ${r.isDifferent ? 'DIVERGE' : 'IDÉNTICO'} | A: ${r.valA} vs B: ${r.valB}`
  )
  .join('\n')}

Generado en https://www.unfantasmaenelsistema.com/`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const getEducationalNarrative = () => {
    if (profileA === 'real' && profileB === 'incognito') {
      return {
        type: 'danger',
        title: 'El Mito de Incógnito al Descubierto',
        summary:
          'Observa cómo TODOS los atributos técnicos (Canvas, WebGL, GPU, núcleos, resolución y fuentes) son 100% IDÉNTICOS entre tu navegador normal y el modo incógnito.',
        explanation:
          'El modo incógnito fue diseñado para protegerte de personas que usan físicamente tu mismo ordenador borrando el historial local y las cookies al cerrar la ventana. Sin embargo, frente a empresas de rastreo y anunciantes, tu huella digital es exactamente la misma y te correlacionan al instante.',
      };
    }
    if ((profileA === 'real' || profileA === 'incognito') && profileB === 'tor') {
      return {
        type: 'defense-tor',
        title: 'La Filosofía de Cohorte Uniforme de Tor',
        summary: `Tor reduce la entropía en ${deltaEntropy} bits, disminuyendo tu probabilidad de identificación en un factor de más de ${reductionFactorText}.`,
        explanation:
          'Tor no intenta generar ruido aleatorio falso; en su lugar, hace que todos los usuarios de Tor parezcan idénticos. Fuerza la GPU a Mesa genérica, fija el tamaño de ventana con Letterboxing a múltiplos estándar, enmascara la CPU a 2 núcleos y bloquea la detección de fuentes locales.',
      };
    }
    if ((profileA === 'real' || profileA === 'incognito') && profileB === 'brave') {
      return {
        type: 'defense-brave',
        title: 'Técnica de Farbling (Ruido Dinámico) de Brave',
        summary:
          'Brave altera de forma sutil los canales de color y las funciones matemáticas del Canvas y Audio en cada sesión.',
        explanation:
          'A diferencia de Tor (que estandariza), Brave introduce perturbaciones pseudoaleatorias invisibles al ojo humano pero letales para los algoritmos de hash. Cada vez que visitas un sitio o reinicias sesión, tu hash cambia, impidiendo el seguimiento persistente en el tiempo.',
      };
    }
    if (profileA === 'brave' && profileB === 'tor') {
      return {
        type: 'debate',
        title: 'Duelo Criptográfico: Ruido (Brave) vs Homogeneidad (Tor)',
        summary:
          'Dos visiones radicalmente opuestas de la privacidad digital enfrentadas cara a cara.',
        explanation:
          'Brave apuesta por el Farbling (cambiar de máscara en cada paso para evitar la correlación temporal), mientras que Tor apuesta por la uniformidad total (usar la misma máscara uniforme de millones de personas para que nadie destaque en la multitud).',
      };
    }
    return {
      type: 'general',
      title: 'Análisis Comparativo de Entropía',
      summary: `La divergencia entre perfiles es de ${deltaEntropy} bits de Shannon (${reductionFactorText}).`,
      explanation:
        'Cada bit adicional de entropía duplica el número de perfiles únicos posibles en Internet. Una reducción significativa en bits de entropía te camufla entre grupos más amplios de internautas.',
    };
  };

  const narrative = getEducationalNarrative();

  return (
    <section id="comparativa" className="scroll-mt-20 space-y-6">
      {/* Title & Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-400">
              <ArrowLeftRight className="h-3 w-3" />
              Auditoría Lado a Lado
            </span>
            <span className="text-xs text-slate-400">Diferencial Forense de Atributos</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Panel Comparativo de Perfiles y Huellas Digitales
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl mt-1">
            Contrasta dos configuraciones de navegación simultáneamente. Comprueba si los scripts de rastreo
            te ven como la misma persona o si las mitigaciones rompen la correlación criptográfica.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1">Casos Didácticos:</span>
          <button
            onClick={() => applyPreset('real', 'incognito')}
            className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
              profileA === 'real' && profileB === 'incognito'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            🚨 Real vs Incógnito
          </button>
          <button
            onClick={() => applyPreset('real', 'tor')}
            className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
              profileA === 'real' && profileB === 'tor'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            🛡️ Real vs Tor
          </button>
          <button
            onClick={() => applyPreset('real', 'brave')}
            className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
              profileA === 'real' && profileB === 'brave'
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            🦁 Real vs Brave
          </button>
          <button
            onClick={() => applyPreset('brave', 'tor')}
            className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
              profileA === 'brave' && profileB === 'tor'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            ⚖️ Brave vs Tor
          </button>
        </div>
      </div>

      {/* Profile Selectors & Swap Bar */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-center gap-4 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 sm:p-6 backdrop-blur-md">
        {/* Profile A Select */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Perfil A (Base de Inspección)
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {reportA ? `${reportA.totalEntropyBits.toFixed(1)} bits` : '...'}
            </span>
          </div>
          <select
            value={profileA}
            onChange={(e) => setProfileA(e.target.value as ProfileId)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent cursor-pointer"
          >
            {PROFILE_OPTIONS.map((opt) => (
              <option key={`a-${opt.id}`} value={opt.id} className="bg-slate-950 text-white">
                {opt.name} — {opt.tagline}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 line-clamp-1">
            {PROFILE_OPTIONS.find((p) => p.id === profileA)?.tagline}
          </p>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center py-2 md:py-0">
          <button
            onClick={handleSwapProfiles}
            title="Intercambiar Perfiles A y B"
            className="p-3 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-cyan-300 transition-all border border-slate-700 shadow-md cursor-pointer group active:scale-95"
          >
            <ArrowLeftRight className="h-5 w-5 transition-transform group-hover:rotate-180 duration-300" />
          </button>
        </div>

        {/* Profile B Select */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              Perfil B (Objetivo Comparativo)
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {reportB ? `${reportB.totalEntropyBits.toFixed(1)} bits` : '...'}
            </span>
          </div>
          <select
            value={profileB}
            onChange={(e) => setProfileB(e.target.value as ProfileId)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
          >
            {PROFILE_OPTIONS.map((opt) => (
              <option key={`b-${opt.id}`} value={opt.id} className="bg-slate-950 text-white">
                {opt.name} — {opt.tagline}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 line-clamp-1">
            {PROFILE_OPTIONS.find((p) => p.id === profileB)?.tagline}
          </p>
        </div>
      </div>

      {/* Top Scorecard: Side-by-Side Entropy & Delta Reduction */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profile A Scorecard */}
        <div className="bg-slate-900/60 border border-cyan-950/60 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              {reportA?.profileName || 'Perfil A'}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/40">
              Perfil A
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {reportA ? reportA.totalEntropyBits.toFixed(1) : '--'}
            </span>
            <span className="text-xs text-slate-400 font-mono">bits de entropía</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 mb-3 overflow-hidden border border-slate-800">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, ((reportA?.totalEntropyBits || 0) / 40) * 100)}%` }}
            />
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <p className="flex justify-between">
              <span className="text-slate-400">Unicidad estimada:</span>
              <span className="font-mono text-cyan-300 font-semibold">
                1 en {reportA ? reportA.oneInX.toLocaleString() : '--'}
              </span>
            </p>
            <p className="flex justify-between items-center">
              <span className="text-slate-400">Hash Compuesto:</span>
              <span className="font-mono text-[11px] text-slate-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                {reportA ? `${reportA.compositeHash.slice(0, 12)}...` : '--'}
              </span>
            </p>
          </div>
        </div>

        {/* Center: The Delta Factor & Correlation Verdict */}
        <div className="bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between text-center relative shadow-lg">
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-300 uppercase tracking-wider bg-slate-800/80 px-2.5 py-0.5 rounded-full mb-2">
              <SlidersHorizontal className="h-3 w-3 text-cyan-400" />
              Diferencia Neta (ΔH)
            </div>
            <div className="text-3xl font-black text-white font-mono tabular-nums">
              {deltaEntropy} <span className="text-sm font-normal text-slate-400">bits</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              Factor de escala: <span className="text-cyan-400 font-bold">{reductionFactorText}</span>
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80">
            {isHashIdentical ? (
              <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-2.5 text-xs text-rose-300 flex items-center gap-2 justify-center">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                <span className="font-bold">¡Correlación Positiva! Rastreable como el mismo usuario.</span>
              </div>
            ) : (
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-2.5 text-xs text-emerald-300 flex items-center gap-2 justify-center">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="font-bold">Hashes Divergentes: No correlacionables por scripts.</span>
              </div>
            )}
          </div>
        </div>

        {/* Profile B Scorecard */}
        <div className="bg-slate-900/60 border border-purple-950/60 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
              {reportB?.profileName || 'Perfil B'}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/40">
              Perfil B
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {reportB ? reportB.totalEntropyBits.toFixed(1) : '--'}
            </span>
            <span className="text-xs text-slate-400 font-mono">bits de entropía</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 mb-3 overflow-hidden border border-slate-800">
            <div
              className="bg-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, ((reportB?.totalEntropyBits || 0) / 40) * 100)}%` }}
            />
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <p className="flex justify-between">
              <span className="text-slate-400">Unicidad estimada:</span>
              <span className="font-mono text-purple-300 font-semibold">
                1 en {reportB ? reportB.oneInX.toLocaleString() : '--'}
              </span>
            </p>
            <p className="flex justify-between items-center">
              <span className="text-slate-400">Hash Compuesto:</span>
              <span className="font-mono text-[11px] text-slate-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                {reportB ? `${reportB.compositeHash.slice(0, 12)}...` : '--'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Educational Narrative Callout */}
      <div
        className={`rounded-2xl p-5 border transition-all ${
          narrative.type === 'danger'
            ? 'bg-rose-950/20 border-rose-500/30'
            : narrative.type === 'defense-tor'
            ? 'bg-purple-950/20 border-purple-500/30'
            : narrative.type === 'defense-brave'
            ? 'bg-orange-950/20 border-orange-500/30'
            : 'bg-slate-900/50 border-slate-800'
        }`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`p-2 rounded-xl shrink-0 mt-0.5 ${
              narrative.type === 'danger'
                ? 'bg-rose-500/20 text-rose-400'
                : narrative.type === 'defense-tor'
                ? 'bg-purple-500/20 text-purple-400'
                : narrative.type === 'defense-brave'
                ? 'bg-orange-500/20 text-orange-400'
                : 'bg-cyan-500/20 text-cyan-400'
            }`}
          >
            {narrative.type === 'danger' ? (
              <Flame className="h-5 w-5" />
            ) : narrative.type === 'defense-tor' ? (
              <ShieldCheck className="h-5 w-5" />
            ) : (
              <Info className="h-5 w-5" />
            )}
          </div>
          <div className="space-y-1.5 flex-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              {narrative.title}
            </h4>
            <p className="text-xs font-semibold text-slate-200">{narrative.summary}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{narrative.explanation}</p>
          </div>
        </div>
      </div>

      {/* Canvas Visual Comparison Preview (When available) */}
      {reportA?.canvas.dataUrl && reportB?.canvas.dataUrl && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Inspección Visual de Renderizado Canvas 2D</h3>
            </div>
            <button
              onClick={() => setShowCanvasPreview(!showCanvasPreview)}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {showCanvasPreview ? 'Ocultar miniaturas' : 'Mostrar miniaturas'}
            </button>
          </div>

          {showCanvasPreview && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Canvas A */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-400">{reportA.profileName}</span>
                  <span className="font-mono text-slate-400 text-[11px]">{reportA.canvas.hash}</span>
                </div>
                <div className="flex items-center justify-center bg-black/40 rounded-lg p-2 border border-slate-800/80">
                  <img
                    src={reportA.canvas.dataUrl}
                    alt={`Canvas ${reportA.profileName}`}
                    className="max-h-24 object-contain rounded shadow"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  {reportA.canvas.isPoisoned
                    ? '⚡ Ruido estocástico inyectado en píxeles (Poisoned)'
                    : '🔍 Renderizado determinista nativo por hardware'}
                </p>
              </div>

              {/* Canvas B */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-400">{reportB.profileName}</span>
                  <span className="font-mono text-slate-400 text-[11px]">{reportB.canvas.hash}</span>
                </div>
                <div className="flex items-center justify-center bg-black/40 rounded-lg p-2 border border-slate-800/80">
                  <img
                    src={reportB.canvas.dataUrl}
                    alt={`Canvas ${reportB.profileName}`}
                    className="max-h-24 object-contain rounded shadow"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  {reportB.canvas.isPoisoned
                    ? '⚡ Ruido estocástico inyectado en píxeles (Poisoned)'
                    : '🔍 Renderizado determinista nativo por hardware'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Bar & Export Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterMode === 'all'
                ? 'bg-slate-800 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({comparisonRows.length})
          </button>
          <button
            onClick={() => setFilterMode('diffs')}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              filterMode === 'diffs'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            <CheckCircle2 className="h-3 w-3" />
            Divergencias ({diffCount})
          </button>
          <button
            onClick={() => setFilterMode('equals')}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              filterMode === 'equals'
                ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/40'
                : 'text-slate-400 hover:text-rose-300'
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            Idénticos ({equalCount})
          </button>
        </div>

        <button
          onClick={copyComparisonToClipboard}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 hover:text-white border border-slate-700 transition-colors cursor-pointer w-full sm:w-auto justify-center"
        >
          {copiedSummary ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">¡Copiado al portapapeles!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-slate-400" />
              <span>Copiar Resumen Comparativo</span>
            </>
          )}
        </button>
      </div>

      {/* Attribute Comparison Matrix Table */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold">
                <th className="py-3 px-4 w-1/4">Vector de Huella Digital</th>
                <th className="py-3 px-4 w-1/3 text-cyan-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    {reportA?.profileName || 'Perfil A'}
                  </div>
                </th>
                <th className="py-3 px-3 text-center w-24">Estado</th>
                <th className="py-3 px-4 w-1/3 text-purple-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    {reportB?.profileName || 'Perfil B'}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRows.map((row) => {
                const IconComponent = row.icon;
                return (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      row.isDifferent ? 'hover:bg-slate-800/40' : 'bg-rose-950/10 hover:bg-rose-950/20'
                    }`}
                  >
                    {/* Vector Name & Technical Info */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300 shrink-0 mt-0.5">
                          <IconComponent className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100">{row.name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            {row.technicalImpact}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Value in Profile A */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-mono text-slate-200 bg-slate-950/70 p-2 rounded-lg border border-slate-800/90 break-words leading-relaxed text-[11px]">
                        {row.valA}
                      </div>
                    </td>

                    {/* Diff Status Badge */}
                    <td className="py-3.5 px-2 align-middle text-center">
                      {row.isDifferent ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 whitespace-nowrap">
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          Diverge
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 whitespace-nowrap">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          Idéntico
                        </span>
                      )}
                    </td>

                    {/* Value in Profile B */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-mono text-slate-200 bg-slate-950/70 p-2 rounded-lg border border-slate-800/90 break-words leading-relaxed text-[11px]">
                        {row.valB}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
