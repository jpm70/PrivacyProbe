import React from 'react';
import { BookOpen, ShieldCheck, Scale, History, Terminal, Globe, Lock } from 'lucide-react';

interface CaseItem {
  id: string;
  year: string;
  title: string;
  category: 'Investigación Académica' | 'Industria & Fraude' | 'Regulación & Juicios' | 'Evolución de Defensas';
  summary: string;
  technicalImpact: string;
  lessonsLearned: string;
}

const HISTORICAL_CASES: CaseItem[] = [
  {
    id: 'panopticlick-2010',
    year: '2010',
    title: 'Estudio Panopticlick (EFF) - Peter Eckersley',
    category: 'Investigación Académica',
    summary:
      'La Electronic Frontier Foundation (EFF) analizó más de 470.000 navegadores y demostró que el 83.6% de los visitantes tenían una huella digital unívoca, ascendiendo al 94.2% si contaban con soporte para Flash o Java.',
    technicalImpact:
      'Formalizó el uso de la Entropía de Shannon (bits) en la seguridad informática web. Mostró que la lista de plugins y fuentes del sistema superaba con creces los 18 bits necesarios para identificar a un usuario entre millones.',
    lessonsLearned:
      'Dio inicio a la era moderna del fingerprinting pasivo. Condujo a la paulatina eliminación de plugins NPAPI (Flash, Java, Silverlight) en los navegadores.',
  },
  {
    id: 'canvas-fp-2012',
    year: '2012',
    title: 'Descubrimiento del Canvas Fingerprinting (Mowery & Shacham)',
    category: 'Investigación Académica',
    summary:
      'Investigadores de UC San Diego demostraron en el paper "Pixel Perfect: Fingerprinting Canvas in HTML5" cómo las diferencias en tarjetas gráficas y motores de renderizado de fuentes 2D producían variaciones de píxeles invisibles al ojo pero computacionalmente distintivas.',
    technicalImpact:
      'No requería permisos de usuario ni almacenamiento local; bastaba un elemento <canvas> oculto en JavaScript ejecutando comandos de dibujo.',
    lessonsLearned:
      'Marcó el declive de las cookies como único vector de rastreo. La industria publicitaria empezó a desplegar scripts de canvas a escala masiva sin consentimiento del usuario.',
  },
  {
    id: 'audio-fp-2016',
    year: '2016',
    title: 'AudioContext Fingerprinting (Englehardt & Narayanan - Princeton)',
    category: 'Investigación Académica',
    summary:
      'El estudio de 1 millón de sitios web de Princeton reveló que trackers comerciales usaban la Web Audio API para procesar señales sinusoidales a través de osciladores y compresores de dinámica.',
    technicalImpact:
      'La coma flotante de la FPU del microprocesador y el subsistema de sonido del SO dejaban una firma residual matemática detectable en milisegundos sin reproducir ningún sonido audible.',
    lessonsLearned:
      'Demostró que cualquier API web con complejidad matemática y operaciones de hardware se convierte potencialmente en un canal encubierto de fingerprinting.',
  },
  {
    id: 'threatmetrix-2018',
    year: '2018',
    title: 'El auge de la detección de fraude bancario (ThreatMetrix / Sift)',
    category: 'Industria & Fraude',
    summary:
      'Entidades bancarias globales adoptaron masivamente suites de fingerprinting en tiempo real para verificar inicios de sesión y transacciones sospechosas sin requerir autenticación en dos pasos adicional.',
    technicalImpact:
      'Correlación de Device ID generado por WebGL, Canvas, fuentes locales y latencia de red TCP/IP para autenticar que el cliente es quien dice ser, o alertar de apropiación de cuenta (Account Takeover).',
    lessonsLearned:
      'Ilustra el uso dual de la tecnología: el mismo vector que viola la privacidad en redes de publicidad es empleado para proteger cuentas financieras contra bots.',
  },
  {
    id: 'tor-rfp-2019',
    year: '2019',
    title: 'Estandarización de RFP (Resist Fingerprinting) en Firefox',
    category: 'Evolución de Defensas',
    summary:
      'Mozilla y The Tor Project cooperaron a través de la iniciativa "Tor Uplift" para portar las defensas avanzadas de Tor Browser directamente al código base de Firefox mediante la bandera privacy.resistFingerprinting.',
    technicalImpact:
      'Introdujo letterboxing automático, enmascaramiento genérico de GPU a Mozilla SwiftShader, bloqueo de enumeración de fuentes y fijación de hardwareConcurrency a 2 hilos.',
    lessonsLearned:
      'Sentó el estándar de oro de la industria: la defensa efectiva contra el fingerprinting no consiste en engañar con datos aleatorios individuales, sino en agrupar a todos los usuarios en una misma cohorte idéntica.',
  },
  {
    id: 'google-settlement-2024',
    year: '2024',
    title: 'Acuerdo judicial de Google sobre el Modo Incógnito (5.000M$)',
    category: 'Regulación & Juicios',
    summary:
      'En el caso federal Brown v. Google LLC, demandantes alegaron que Google continuaba rastreando la actividad de navegación y recopilando telemetría de usuarios a través de Google Analytics y Google Ad Manager incluso cuando navegaban en Modo Incógnito.',
    technicalImpact:
      'Se evidenció formalmente que el Modo Incógnito no oculta la dirección IP pública ni previene técnicas de huella digital por hardware o identificadores de sesión pasivos.',
    lessonsLearned:
      'Google se comprometió a actualizar la redacción del aviso de bienvenida de Incógnito para clarificar explícitamente que los sitios web y rastreadores de terceros siguen recopilando información técnica del visitante.',
  },
];

export const HistoricalCases: React.FC = () => {
  return (
    <section id="casos-reales" className="scroll-mt-20 space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-mono">
          06
        </span>
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <History className="h-5 w-5 text-cyan-400" />
          Cronología y Casos Reales de la Huella Digital
        </h2>
      </div>

      <p className="text-sm text-slate-400">
        La huella digital no es una vulnerabilidad de software tradicional con un parche inmediato, sino la consecuencia directa de cómo la web moderna otorga acceso a recursos de renderizado y aceleración por hardware. Descubre cómo ha evolucionado en los últimos 15 años.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {HISTORICAL_CASES.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-slate-700 transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <span className="inline-flex items-center gap-1.5 rounded bg-cyan-950/70 px-2 py-0.5 text-xs font-mono font-bold text-cyan-400 border border-cyan-800/60">
                  {item.year}
                </span>
                <span className="text-[11px] font-medium text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                  {item.category}
                </span>
              </div>

              <h3 className="mt-3 font-semibold text-white text-base leading-snug">
                {item.title}
              </h3>

              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                {item.summary}
              </p>

              <div className="mt-3 rounded-lg bg-slate-950/60 p-3 border border-slate-800/80 space-y-2">
                <div>
                  <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold block">
                    Impacto Técnico
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {item.technicalImpact}
                  </p>
                </div>
                <div className="pt-1.5 border-t border-slate-800/60">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold block">
                    Lección para la Seguridad Web
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {item.lessonsLearned}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
