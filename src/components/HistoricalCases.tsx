import React from 'react';
import { ExternalLink, History } from 'lucide-react';
import { useUi } from '../i18n';

type Category = 'research' | 'industry' | 'law' | 'defence';

interface CaseItem {
  year: string;
  category: Category;
  title: [string, string];
  summary: [string, string];
  lesson: [string, string];
  url: string;
}

const CASES: CaseItem[] = [
  {
    year: '2010',
    category: 'research',
    title: ['Panopticlick (EFF), Peter Eckersley', 'Panopticlick (EFF), Peter Eckersley'],
    summary: [
      'De 470.161 navegadores, el 83,6 % tenía una huella única; el 94,2 % entre los que tenían Flash o Java. Los atributos más reveladores eran los plugins, las fuentes y el User-Agent.',
      'Of 470,161 browsers, 83.6% had a unique fingerprint; 94.2% among those with Flash or Java. The most revealing attributes were plugins, fonts and the User-Agent.',
    ],
    lesson: [
      'Fue el primer estudio grande en medir la huella con entropía de Shannon.',
      'It was the first large study to measure fingerprints with Shannon entropy.',
    ],
    url: 'https://coveryourtracks.eff.org/static/browser-uniqueness.pdf',
  },
  {
    year: '2012',
    category: 'research',
    title: ['«Pixel Perfect»: nace la huella de canvas', '"Pixel Perfect": canvas fingerprinting is born'],
    summary: [
      'Mowery y Shacham (UC San Diego) muestran que dibujar texto y formas en un <canvas> da resultados distintos según la GPU, los controladores y el sistema.',
      'Mowery and Shacham (UC San Diego) show that drawing text and shapes on a <canvas> gives different results depending on GPU, drivers and system.',
    ],
    lesson: ['No necesita permisos ni guardar nada en el equipo.', 'It needs no permission and stores nothing on the device.'],
    url: 'https://hovav.net/ucsd/dist/canvas.pdf',
  },
  {
    year: '2014',
    category: 'industry',
    title: ['«The Web Never Forgets»: el canvas ya está en producción', '"The Web Never Forgets": canvas in production'],
    summary: [
      'Acar et al. encuentran huella de canvas en el 5,5 % de las 100.000 webs más visitadas, sobre todo a través del widget para compartir de AddThis.',
      'Acar et al. find canvas fingerprinting on 5.5% of the top 100,000 websites, mostly through the AddThis sharing widget.',
    ],
    lesson: ['Un solo script de terceros basta para rastrear en miles de webs.', 'A single third-party script is enough to track across thousands of sites.'],
    url: 'https://collaborate.princeton.edu/en/publications/the-web-never-forgets-persistent-tracking-mechanisms-in-the-wild/',
  },
  {
    year: '2016',
    category: 'research',
    title: ['Huella de audio y AmIUnique', 'Audio fingerprinting and AmIUnique'],
    summary: [
      'Englehardt y Narayanan (Princeton) detectan scripts que usan la Web Audio API para identificar equipos en un rastreo de 1 millón de webs. Ese año AmIUnique confirma que el 89,4 % de 118.934 huellas son únicas.',
      'Englehardt and Narayanan (Princeton) find scripts using the Web Audio API to identify devices in a 1-million-site crawl. That year AmIUnique confirms 89.4% of 118,934 fingerprints are unique.',
    ],
    lesson: ['Cualquier API con cálculos que dependan del hardware puede servir para rastrear.', 'Any API whose computations depend on hardware can be used for tracking.'],
    url: 'https://www.cs.princeton.edu/~arvindn/publications/OpenWPM_1_million_site_tracking_measurement.pdf',
  },
  {
    year: '2016-2018',
    category: 'defence',
    title: ['Tor Uplift y resistFingerprinting en Firefox', 'Tor Uplift and resistFingerprinting in Firefox'],
    summary: [
      'Mozilla incorpora a Firefox las defensas de Tor Browser tras la preferencia privacy.resistFingerprinting: letterboxing, GPU «Mozilla», zona horaria UTC, núcleos fijos…',
      'Mozilla brings Tor Browser defences into Firefox behind the privacy.resistFingerprinting pref: letterboxing, "Mozilla" GPU, UTC time zone, fixed cores…',
    ],
    lesson: [
      'La defensa más sólida es que todos parezcan iguales, no que cada uno se invente valores.',
      'The strongest defence is making everyone look the same, not letting each user invent values.',
    ],
    url: 'https://wiki.mozilla.org/Security/Tor_Uplift',
  },
  {
    year: '2018',
    category: 'research',
    title: ['«Hiding in the Crowd»: 2 millones de huellas', '"Hiding in the Crowd": 2 million fingerprints'],
    summary: [
      'Gómez-Boix, Laperdrix y Baudry analizan 2.067.942 huellas de una gran web francesa: solo el 33,6 % son únicas, frente a más del 80 % de estudios anteriores.',
      'Gómez-Boix, Laperdrix and Baudry analyse 2,067,942 fingerprints from a large French website: only 33.6% are unique, compared with over 80% in earlier studies.',
    ],
    lesson: [
      'La unicidad depende mucho de la población: los estudios anteriores atraían a público preocupado por la privacidad.',
      'Uniqueness depends heavily on the population: earlier studies attracted privacy-minded visitors.',
    ],
    url: 'https://hal.science/hal-01718234',
  },
  {
    year: '2023',
    category: 'defence',
    title: ['Safari mete ruido en la navegación privada', 'Safari adds noise in private browsing'],
    summary: [
      'Safari 17 activa en navegación privada la protección avanzada contra huellas: ruido en canvas, WebGL y audio, y tamaños de pantalla fijos. Firefox, con su Fingerprinting Protection, aleatoriza el canvas en las ventanas privadas.',
      'Safari 17 turns on advanced fingerprinting protection in private browsing: noise in canvas, WebGL and audio, and fixed screen sizes. Firefox, with its Fingerprinting Protection, randomises the canvas in private windows.',
    ],
    lesson: ['El modo privado empieza a proteger algo frente a la huella, según el navegador.', 'Private mode starts to protect somewhat against fingerprinting, depending on the browser.'],
    url: 'https://webkit.org/blog/14701/private-browsing-2-0/',
  },
  {
    year: '2024',
    category: 'law',
    title: ['Brown contra Google: el incógnito de Chrome', 'Brown v. Google: Chrome incognito'],
    summary: [
      'Para cerrar la demanda colectiva por recoger datos en modo incógnito, Google acepta borrar o desidentificar miles de millones de registros, cambiar el aviso de incógnito y bloquear cookies de terceros en ese modo durante cinco años. No paga daños; los demandantes valoraron el acuerdo en más de 5.000 millones de dólares.',
      'To settle the class action over data collected in incognito mode, Google agrees to delete or de-identify billions of records, change the incognito notice and block third-party cookies in that mode for five years. It pays no damages; plaintiffs valued the deal at over 5 billion dollars.',
    ],
    lesson: ['«Privado» nunca significó «invisible para las webs».', '"Private" never meant "invisible to websites".'],
    url: 'https://www.govtech.com/security/google-to-purge-stored-incognito-mode-records',
  },
  {
    year: '2024',
    category: 'research',
    title: ['Google mide la huella en Chrome', 'Google measures fingerprinting in Chrome'],
    summary: [
      'Con datos de decenas de millones de navegadores Chrome, Bacis et al. muestran que las APIs están muy correlacionadas: la entropía conjunta es mucho menor que la suma, y la mayoría de webs consume o muy poca o mucha (por encima de 20 bits).',
      'Using data from tens of millions of Chrome browsers, Bacis et al. show APIs are strongly correlated: joint entropy is far below the sum, and most sites consume either very little or a lot (above 20 bits).',
    ],
    lesson: ['Sumar bits de atributos exagera; por eso aquí la suma se presenta como cota superior.', 'Summing attribute bits exaggerates; that is why the sum is shown here as an upper bound.'],
    url: 'https://arxiv.org/abs/2403.15607',
  },
  {
    year: '2025',
    category: 'law',
    title: ['Google permite la huella en su publicidad', 'Google allows fingerprinting in its ads'],
    summary: [
      'Desde el 16 de febrero de 2025, la política de Google deja de prohibir el fingerprinting a quien use sus productos publicitarios. La ICO británica lo calificó de «irresponsable» y recordó que la ley sigue exigiendo transparencia y consentimiento.',
      'From 16 February 2025, Google policy no longer forbids fingerprinting for users of its advertising products. The UK ICO called it "irresponsible" and recalled that the law still requires transparency and consent.',
    ],
    lesson: ['En la UE, leer datos del dispositivo para rastrear necesita consentimiento (ePrivacy, art. 5.3).', 'In the EU, reading device data for tracking needs consent (ePrivacy, art. 5(3)).'],
    url: 'https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2024/12/our-response-to-google-s-policy-change-on-fingerprinting/',
  },
];

export const HistoricalCases: React.FC = () => {
  const { t, lang } = useUi();
  const pick = (pair: [string, string]) => (lang === 'es' ? pair[0] : pair[1]);
  const catLabel: Record<Category, string> = {
    research: t('Investigación', 'Research'),
    industry: t('Industria', 'Industry'),
    law: t('Ley y tribunales', 'Law and courts'),
    defence: t('Defensas', 'Defences'),
  };

  return (
    <section id="casos-reales" className="scroll-mt-24 space-y-5">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <History className="h-5 w-5 text-cyan-400" />
          {t('Casos reales, de 2010 a hoy', 'Real cases, from 2010 to today')}
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          {t('Cada tarjeta enlaza a su fuente original.', 'Each card links to its original source.')}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CASES.map((c) => (
          <article key={c.year + c.url} className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <span className="rounded bg-cyan-950/70 px-2 py-0.5 text-xs font-mono font-bold text-cyan-400 border border-cyan-800/60">{c.year}</span>
              <span className="text-[11px] font-medium text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">{catLabel[c.category]}</span>
            </div>
            <h3 className="mt-3 font-semibold text-slate-100 text-base leading-snug">{pick(c.title)}</h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed flex-1">{pick(c.summary)}</p>
            <p className="mt-3 rounded-lg bg-slate-950/60 p-3 border border-slate-800/80 text-xs text-slate-400 leading-relaxed">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold block">{t('Lección', 'Lesson')}</span>
              {pick(c.lesson)}
            </p>
            <a href={c.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300">
              {t('Fuente', 'Source')} <ExternalLink className="h-3 w-3" />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
};
