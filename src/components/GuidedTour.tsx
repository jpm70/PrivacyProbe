import React, { useCallback, useEffect, useState } from 'react';
import { Calculator, CheckCircle, ChevronLeft, ChevronRight, EyeOff, Fingerprint, Layers, Sliders, Users, X } from 'lucide-react';
import { STORAGE, useUi, writeStorage } from '../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

interface Step {
  id: string;
  selector: string;
  icon: React.ElementType;
  title: [string, string];
  body: [string, string];
  tips: Array<[string, string]>;
}

const STEPS: Step[] = [
  {
    id: 'hero',
    selector: '[data-tour="hero"]',
    icon: Fingerprint,
    title: ['Tu huella y su estimación', 'Your fingerprint and its estimate'],
    body: [
      'Arriba ves la huella combinada de tu navegador y cuántos bits expone, sumando lo que midieron estudios reales para cada atributo.',
      'At the top you see your browser\'s combined fingerprint and how many bits it exposes, adding what real studies measured for each attribute.',
    ],
    tips: [
      ['Cambia de estudio de referencia: los bits cambian porque cada población es distinta.', 'Switch the reference study: bits change because each population is different.'],
      ['La suma es una cota superior, no una medida exacta.', 'The sum is an upper bound, not an exact measure.'],
    ],
  },
  {
    id: 'profiles',
    selector: '#perfiles',
    icon: Users,
    title: ['Perfiles', 'Profiles'],
    body: [
      'Aplica a tus datos el efecto de incógnito, del ruido de Brave o de la uniformidad de Tor, y mira qué cambia.',
      'Apply the effect of incognito, Brave\'s noise or Tor\'s uniformity to your data, and see what changes.',
    ],
    tips: [['Incógnito (Chrome/Edge) deja la huella exactamente igual.', 'Incognito (Chrome/Edge) leaves the fingerprint exactly the same.']],
  },
  {
    id: 'incognito',
    selector: '[data-tour="incognito"]',
    icon: EyeOff,
    title: ['El mito del incógnito', 'The incognito myth'],
    body: [
      'Qué protege de verdad la navegación privada en Chrome, Firefox y Safari.',
      'What private browsing really protects in Chrome, Firefox and Safari.',
    ],
    tips: [['Prueba a abrir esta página en una ventana privada y compara el hash del canvas.', 'Try opening this page in a private window and compare the canvas hash.']],
  },
  {
    id: 'inspection',
    selector: '[data-tour="inspeccion"]',
    icon: Layers,
    title: ['Datos técnicos', 'Technical data'],
    body: [
      'Todo lo que una web puede leer sin pedirte permiso: lienzo, GPU, fuentes, pantalla, hardware y entorno.',
      'Everything a website can read without asking: canvas, GPU, fonts, screen, hardware and environment.',
    ],
    tips: [['Mira qué fuentes delatan los programas que tienes instalados.', 'See which fonts reveal the software you have installed.']],
  },
  {
    id: 'entropy',
    selector: '[data-tour="entropia"]',
    icon: Calculator,
    title: ['Entropía de Shannon', 'Shannon entropy'],
    body: [
      'La gráfica muestra la entropía medida por atributo en tres estudios. Debajo, tus atributos y lo que aporta cada uno.',
      'The chart shows the entropy measured per attribute in three studies. Below, your attributes and what each one adds.',
    ],
    tips: [['Compara la zona horaria entre estudios: depende de la población.', 'Compare the time zone across studies: it depends on the population.']],
  },
  {
    id: 'lab',
    selector: '[data-tour="mitigaciones"]',
    icon: Sliders,
    title: ['Laboratorio de defensas', 'Defence lab'],
    body: [
      'Activa defensas una a una y mira cuántos bits de referencia deja de exponer tu navegador.',
      'Turn defences on one by one and see how many reference bits your browser stops exposing.',
    ],
    tips: [['Prueba el preajuste «Estilo Tor» y luego «Estilo Brave».', 'Try the "Tor-style" preset and then "Brave-style".']],
  },
];

export const GuidedTour: React.FC<Props> = ({ isOpen, onClose, onComplete }) => {
  const { t, lang } = useUi();
  const pick = (p: [string, string]) => (lang === 'es' ? p[0] : p[1]);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [mobile, setMobile] = useState(false);
  const step = STEPS[index];

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const measure = useCallback(() => {
    if (!isOpen) return;
    const el = document.querySelector(step.selector);
    setRect(el ? el.getBoundingClientRect() : null);
  }, [isOpen, step]);

  useEffect(() => {
    if (!isOpen) return;
    const el = document.querySelector(step.selector);
    if (!el) {
      setRect(null);
      return;
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const id = setTimeout(measure, 450);
    return () => clearTimeout(id);
  }, [isOpen, index, step, measure]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [isOpen, measure]);

  const close = useCallback(() => {
    writeStorage(STORAGE.tour, '1');
    onClose();
  }, [onClose]);

  const finish = useCallback(() => {
    writeStorage(STORAGE.tour, '1');
    onComplete?.();
    onClose();
  }, [onClose, onComplete]);

  const next = useCallback(() => (index < STEPS.length - 1 ? setIndex(index + 1) : finish()), [index, finish]);
  const prev = useCallback(() => index > 0 && setIndex(index - 1), [index]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close, next, prev]);

  useEffect(() => {
    if (isOpen) setIndex(0);
  }, [isOpen]);

  if (!isOpen) return null;

  const Icon = step.icon;
  const last = index === STEPS.length - 1;
  let cardStyle: React.CSSProperties = {};
  if (!mobile && rect) {
    const below = window.innerHeight - rect.bottom;
    if (below > 360) cardStyle = { top: Math.min(window.innerHeight - 380, rect.bottom + 16), left: '50%', transform: 'translateX(-50%)' };
    else if (rect.top > 360) cardStyle = { bottom: window.innerHeight - rect.top + 16, left: '50%', transform: 'translateX(-50%)' };
    else cardStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  } else if (!mobile) {
    cardStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={t('Recorrido guiado', 'Guided tour')} className="fixed inset-0 z-[55]">
      <div onClick={close} className="absolute inset-0 bg-black/60" />
      {rect && (
        <div
          className="absolute pointer-events-none rounded-xl border-2 border-cyan-400 shadow-[0_0_0_9999px_rgba(2,6,23,0.55)] transition-all duration-300"
          style={{ top: Math.max(0, rect.top - 8), left: Math.max(0, rect.left - 8), width: rect.width + 16, height: rect.height + 16 }}
        />
      )}
      <div
        style={cardStyle}
        className={`fixed w-[94vw] max-w-lg ${mobile ? 'bottom-4 left-1/2 -translate-x-1/2 max-h-[80vh] overflow-y-auto' : ''}`}
      >
        <div className="relative rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden rounded-t-2xl bg-slate-800">
            <div className="h-full bg-cyan-500 transition-all" style={{ width: `${((index + 1) / STEPS.length) * 100}%` }} />
          </div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
              <Icon className="h-4 w-4" />
              {t(`Paso ${index + 1} de ${STEPS.length}`, `Step ${index + 1} of ${STEPS.length}`)}
            </span>
            <button onClick={close} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 cursor-pointer" aria-label={t('Cerrar', 'Close')}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <h3 className="text-lg font-bold text-slate-100">{pick(step.title)}</h3>
          <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">{pick(step.body)}</p>
          <ul className="mt-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3 space-y-1.5 text-xs text-slate-300">
            {step.tips.map((tip) => (
              <li key={tip[0]} className="flex gap-2">
                <span className="text-cyan-400">▪</span>
                {pick(tip)}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {STEPS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setIndex(i)}
                  aria-label={t(`Ir al paso ${i + 1}`, `Go to step ${i + 1}`)}
                  className={`h-2 rounded-full cursor-pointer ${i === index ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-600 hover:bg-slate-500'}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={close} className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1.5 cursor-pointer">
                {t('Omitir', 'Skip')}
              </button>
              <button
                onClick={prev}
                disabled={index === 0}
                className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-200 disabled:opacity-40 cursor-pointer"
                aria-label={t('Anterior', 'Back')}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button onClick={next} className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-white cursor-pointer">
                {last ? t('Terminar', 'Finish') : t('Siguiente', 'Next')}
                {last ? <CheckCircle className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
