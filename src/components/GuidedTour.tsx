import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  HelpCircle,
  Sliders,
  Calculator,
  EyeOff,
  Fingerprint,
  Layers,
  Network,
  Sparkles,
} from 'lucide-react';

export interface TourStep {
  id: string;
  targetSelector: string;
  title: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  description: string;
  highlights: string[];
  suggestedAction?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'hero',
    targetSelector: '#inicio',
    title: 'Firma Digital Compuesta y Alerta Crítica',
    badge: 'Paso 1: Diagnóstico en Vivo',
    badgeColor: 'text-cyan-400 bg-cyan-950/70 border-cyan-800',
    icon: Fingerprint,
    description:
      'Aquí se sintetizan todas las señales de hardware, renderizado gráfico y pila de red en un hash SHA-256 único. Si tu entropía supera los 20 bits, el sistema activa una alerta visual advirtiendo un riesgo crítico de unicidad.',
    highlights: [
      'Hash SHA-256 compuesto de 64 caracteres hexadecimales',
      'Cálculo de entropía total en bits de Shannon',
      'Sistema de advertencia de unicidad global (> 20 y > 33 bits)',
    ],
    suggestedAction: 'Revisa la unicidad estimada de tu navegador actual.',
  },
  {
    id: 'perfiles',
    targetSelector: '#perfiles',
    title: 'Selector de Perfiles y Sandbox de Navegadores',
    badge: 'Paso 2: Comparación en Tiempo Real',
    badgeColor: 'text-indigo-400 bg-indigo-950/70 border-indigo-800',
    icon: Layers,
    description:
      'Compara al instante cómo varía tu huella entre tu navegador real, el modo incógnito (que no protege la huella física), Brave con inyección de ruido Farbling, y Tor Browser con uniformidad colectiva.',
    highlights: [
      'Navegador Real: valores exactos de tu sistema',
      'Modo Incógnito: comprueba que la huella técnica es idéntica',
      'Brave & Tor: dos filosofías opuestas de privacidad',
    ],
    suggestedAction: 'Haz clic en cualquier perfil para simular su comportamiento.',
  },
  {
    id: 'incognito',
    targetSelector: '#incognito',
    title: 'Desmitificación Formativa: El Modo Incógnito',
    badge: 'Paso 3: Realidad vs Mito',
    badgeColor: 'text-amber-400 bg-amber-950/70 border-amber-800',
    icon: EyeOff,
    description:
      'El modo incógnito solo borra tu historial local al cerrar la ventana; no enmascara tu GPU, ni altera el renderizado de Canvas, ni oculta tu IP. Cualquier rastreador puede reconocerte instantáneamente.',
    highlights: [
      'Protege contra personas en tu misma máquina local',
      'Cero protección contra canvas, WebGL o font fingerprinting',
      'Demostración interactiva de coincidencia de hashes',
    ],
  },
  {
    id: 'entropia',
    targetSelector: '#entropia',
    title: 'Panel Matemático de Entropía de Shannon (Crítico)',
    badge: 'Paso 4: Núcleo Matemático',
    badgeColor: 'text-rose-400 bg-rose-950/70 border-rose-800',
    icon: Calculator,
    description:
      'La entropía mide la cantidad de información identificatoria en bits. 33 bits bastan para individualizar a cualquier habitante del planeta (2³³ > 8.500 millones). Este panel incluye un gráfico Recharts con la evolución de bits según las mitigaciones aplicadas.',
    highlights: [
      'Fórmula clásica de Shannon: H = -∑ P(x) log₂(P(x))',
      'Gráfica interactiva de Recharts comparando perfiles y cascada defensiva',
      'Calculadora de población estimada 1 en 2^H',
    ],
    suggestedAction: 'Arrastra el slider o cambia la vista del gráfico para explorar la cascada.',
  },
  {
    id: 'mitigaciones',
    targetSelector: '#laboratorio',
    title: 'Laboratorio de Defensas y Mitigaciones (Crítico)',
    badge: 'Paso 5: Contramedidas Activas',
    badgeColor: 'text-emerald-400 bg-emerald-950/70 border-emerald-800',
    icon: Sliders,
    description:
      'Experimenta activando contramedidas reales de ciberseguridad: inyección de ruido (Canvas Farbling), spoofing de GPU WebGL, Letterboxing de resolución y clamping de hardware para reducir la entropía de forma medible.',
    highlights: [
      'Farbling de Canvas: ruido aleatorio en getImageData()',
      'Enmascaramiento de GPU física por SwiftShader',
      'Preajustes rápidos: Sin defensas, Brave, Tor y Blindaje Máximo',
    ],
    suggestedAction: 'Activa o desactiva interruptores para ver el cambio de entropía en tiempo real.',
  },
  {
    id: 'rastreo-cruzado',
    targetSelector: '#rastreo-cruzado',
    title: 'Simulador de Rastreo Cruzado entre Dominios',
    badge: 'Paso 6: Vigilancia Silenciosa',
    badgeColor: 'text-purple-400 bg-purple-950/70 border-purple-800',
    icon: Network,
    description:
      'Observa cómo un rastreador comercial (como Google Analytics o Criteo) correlaciona tu visita en una farmacia online con un portal inmobiliario y tu sesión privada sin requerir cookies de terceros.',
    highlights: [
      'Simulación secuencial en 3 fases de navegación',
      'Identificación cruzada basada en el hash de Canvas y GPU',
      'Grafo visual de perfilado comercial',
    ],
  },
  {
    id: 'inspeccion',
    targetSelector: '#inspeccion',
    title: 'Inspección Forense de Telemetría Profunda',
    badge: 'Paso 7: Vectores Técnicos',
    badgeColor: 'text-sky-400 bg-sky-950/70 border-sky-800',
    icon: Layers,
    description:
      'Explora en detalle los vectores técnicos: el Canvas 2D con renderizado sub-píxel, la GPU con WebGL unmasked vendor, el micro-offset de fase en AudioContext y la detección tipográfica diferencial.',
    highlights: [
      'Microscopio de Canvas con hash criptográfico',
      'Detección de fuentes tipográficas instaladas en el SO',
      'Datos de pantalla, profundidad de color y APIs de hardware',
    ],
  },
];

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const currentStep = TOUR_STEPS[currentStepIndex];

  // Check viewport size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update position of highlight & auto-scroll
  const updateTargetPosition = useCallback(() => {
    if (!isOpen || !currentStep) return;

    const element = document.querySelector(currentStep.targetSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStep]);

  // Scroll element into view when step changes
  useEffect(() => {
    if (!isOpen || !currentStep) return;

    const element = document.querySelector(currentStep.targetSelector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Allow scroll animation to settle before measuring rect
      const timeoutId = setTimeout(() => {
        updateTargetPosition();
      }, 400);
      return () => clearTimeout(timeoutId);
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStepIndex, currentStep, updateTargetPosition]);

  // Listen for scroll and resize while tour is active
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updateTargetPosition();
    };

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, updateTargetPosition]);

  // Keyboard navigation: Escape, ArrowRight, ArrowLeft, Enter
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight' || (e.key === 'Enter' && !e.shiftKey)) {
        if (currentStepIndex < TOUR_STEPS.length - 1) {
          handleNext();
        } else {
          handleFinish();
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStepIndex > 0) {
          handlePrev();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('privacy_probe_tour_completed', 'true');
    if (onComplete) onComplete();
    onClose();
  };

  const handleClose = () => {
    localStorage.setItem('privacy_probe_tour_completed', 'true');
    onClose();
  };

  const jumpToStep = (index: number) => {
    setCurrentStepIndex(index);
  };

  if (!isOpen) return null;

  const StepIcon = currentStep.icon;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;
  const progressPercent = Math.round(((currentStepIndex + 1) / TOUR_STEPS.length) * 100);

  // Calculate card position on desktop relative to target
  let cardPositionStyle: React.CSSProperties = {};
  if (!isMobile && targetRect) {
    const spaceBelow = window.innerHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;

    if (spaceBelow > 380) {
      // Place below target
      cardPositionStyle = {
        top: `${Math.max(20, Math.min(window.innerHeight - 440, targetRect.bottom + 16))}px`,
        left: '50%',
        transform: 'translateX(-50%)',
      };
    } else if (spaceAbove > 380) {
      // Place above target
      cardPositionStyle = {
        bottom: `${Math.max(20, window.innerHeight - targetRect.top + 16)}px`,
        left: '50%',
        transform: 'translateX(-50%)',
      };
    } else {
      // Center on screen
      cardPositionStyle = {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tour guiado de PrivacyProbe"
      className="fixed inset-0 z-50 overflow-hidden font-sans select-none"
    >
      {/* Dark overlay backdrop */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] transition-opacity duration-300"
      />

      {/* Target element spotlight frame (if element found) */}
      {targetRect && (
        <div
          className="absolute pointer-events-none rounded-xl transition-all duration-300 ease-out border-2 border-cyan-400 shadow-[0_0_0_9999px_rgba(2,6,23,0.75),0_0_35px_rgba(6,182,212,0.45)] ring-4 ring-cyan-500/20"
          style={{
            top: `${Math.max(0, targetRect.top - 8)}px`,
            left: `${Math.max(0, targetRect.left - 8)}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`,
          }}
        >
          {/* Subtle pulsating beacon badge in top-right corner of highlighted element */}
          <div className="absolute -top-3 -right-3 flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-cyan-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 border-2 border-slate-950 text-[9px] font-bold text-slate-950 items-center justify-center">
              {currentStepIndex + 1}
            </span>
          </div>
        </div>
      )}

      {/* Tour Dialog Card */}
      <div
        ref={cardRef}
        style={cardPositionStyle}
        className={`fixed z-50 w-[94vw] max-w-xl transition-all duration-200 ${
          isMobile
            ? 'bottom-4 left-1/2 -translate-x-1/2 max-h-[85vh] overflow-y-auto'
            : ''
        }`}
      >
        <div className="relative rounded-2xl border border-slate-700/80 bg-slate-900/95 p-5 sm:p-6 text-white shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
          {/* Top progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 overflow-hidden rounded-t-2xl bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Header row: Step badge, quick jump pills, close button */}
          <div className="flex items-center justify-between gap-3 pt-1 mb-3">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${currentStep.badgeColor}`}
              >
                <StepIcon className="h-3.5 w-3.5" />
                <span>{currentStep.badge}</span>
              </span>
              <span className="text-xs font-mono text-slate-400">
                Paso {currentStepIndex + 1} de {TOUR_STEPS.length}
              </span>
            </div>

            <button
              onClick={handleClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              title="Cerrar tour (Escape)"
              aria-label="Cerrar tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Step Title & Description */}
          <div className="space-y-2 mb-4">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{currentStep.title}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Key highlights bullets */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 mb-4 space-y-1.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-1">
              <Sparkles className="h-3 w-3" />
              <span>Aspectos Clave a Observar</span>
            </div>
            {currentStep.highlights.map((h, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="text-cyan-400 text-xs shrink-0 mt-0.5">▪</span>
                <span>{h}</span>
              </div>
            ))}
            {currentStep.suggestedAction && (
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-amber-300 font-medium">
                <HelpCircle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                <span>Sugerencia: {currentStep.suggestedAction}</span>
              </div>
            )}
          </div>

          {/* Bottom Step Indicator Dots */}
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {TOUR_STEPS.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => jumpToStep(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentStepIndex
                      ? 'w-6 bg-cyan-400'
                      : idx < currentStepIndex
                      ? 'w-2 bg-cyan-600/60 hover:bg-cyan-500'
                      : 'w-2 bg-slate-750 bg-slate-700 hover:bg-slate-600'
                  }`}
                  title={`Ir al ${s.title}`}
                  aria-label={`Paso ${idx + 1}: ${s.title}`}
                />
              ))}
            </div>

            {/* Actions: Skip, Prev, Next / Finish */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleClose}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1.5 transition-colors cursor-pointer"
              >
                Omitir
              </button>

              <button
                onClick={handlePrev}
                disabled={isFirstStep}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Paso anterior"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Anterior</span>
              </button>

              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-950/50 transition-all active:scale-95 cursor-pointer"
                aria-label={isLastStep ? 'Finalizar tour' : 'Siguiente paso'}
              >
                <span>{isLastStep ? 'Finalizar Tour' : 'Siguiente'}</span>
                {isLastStep ? (
                  <CheckCircle className="h-3.5 w-3.5 text-white" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Quick jump to critical points (Entropy & Mitigation Lab) */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <span className="text-slate-500">Puntos críticos:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => jumpToStep(3)} // step 4: Entropía
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  currentStepIndex === 3
                    ? 'bg-rose-950/80 text-rose-300 font-semibold border border-rose-800'
                    : 'text-rose-400/90 hover:text-rose-300 hover:bg-rose-950/40'
                }`}
              >
                <Calculator className="h-3 w-3" />
                <span>Panel Entropía</span>
              </button>
              <span className="text-slate-700">·</span>
              <button
                onClick={() => jumpToStep(4)} // step 5: Mitigaciones
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  currentStepIndex === 4
                    ? 'bg-emerald-950/80 text-emerald-300 font-semibold border border-emerald-800'
                    : 'text-emerald-400/90 hover:text-emerald-300 hover:bg-emerald-950/40'
                }`}
              >
                <Sliders className="h-3 w-3" />
                <span>Laboratorio Mitigaciones</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
