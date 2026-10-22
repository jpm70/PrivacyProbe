/**
 * Estimación de entropía con datos publicados.
 *
 * Un solo navegador no puede calcular su propia entropía: hace falta saber cómo se
 * reparten los valores en una población. Por eso se usan las cifras medidas en tres
 * estudios a gran escala, recogidas en la tabla 3 de:
 *   P. Laperdrix, N. Bielova, B. Baudry, G. Avoine. «Browser Fingerprinting: A survey».
 *   ACM Transactions on the Web, 2020. arXiv:1905.01051.
 *
 * La suma de entropías de atributos supone que son independientes y por eso es una
 * cota superior: el estudio de Google de 2024 (Bacis et al., arXiv:2403.15607) mide
 * que la entropía conjunta es claramente menor que la suma.
 */

import type {
  AttributeEstimate,
  AttributeId,
  AttributeStatus,
  EntropyEstimate,
  FullFingerprintReport,
  StudyId,
} from '../types/fingerprint';

export interface StudyInfo {
  id: StudyId;
  year: number;
  name: string;
  /** huellas analizadas */
  fingerprints: number;
  /** entropía máxima medible con ese tamaño de muestra: log2(N) */
  maxBits: number;
  /** % de huellas únicas (escritorio / móvil) */
  uniqueDesktop: number;
  uniqueMobile: number | null;
  url: string;
}

export const STUDIES: Record<StudyId, StudyInfo> = {
  panopticlick2010: {
    id: 'panopticlick2010',
    year: 2010,
    name: 'Panopticlick (EFF)',
    fingerprints: 470161,
    maxBits: 18.843,
    uniqueDesktop: 94.2,
    uniqueMobile: null,
    url: 'https://coveryourtracks.eff.org/static/browser-uniqueness.pdf',
  },
  amiunique2016: {
    id: 'amiunique2016',
    year: 2016,
    name: 'AmIUnique',
    fingerprints: 118934,
    maxBits: 16.86,
    uniqueDesktop: 89.4,
    uniqueMobile: 81,
    url: 'https://hal.science/hal-01285470',
  },
  hiding2018: {
    id: 'hiding2018',
    year: 2018,
    name: 'Hiding in the Crowd',
    fingerprints: 2067942,
    maxBits: 20.98,
    uniqueDesktop: 35.7,
    uniqueMobile: 18.5,
    url: 'https://hal.science/hal-01718234',
  },
};

/** Estudio por defecto: el más grande y el único con público generalista. */
export const DEFAULT_STUDY: StudyId = 'hiding2018';

/**
 * Entropía (bits) de cada atributo en cada estudio. null = no se midió.
 * - webgl: «WebGL Renderer» (el fabricante va incluido en el renderizador y no se suma aparte).
 * - fonts: los estudios enumeraban la lista completa con Flash; aquí se prueban 39 fuentes,
 *   así que la cifra es una cota alta.
 * - language: cabecera Accept-Language, equivalente a navigator.languages.
 * - audio y hardware (núcleos/memoria) no se midieron en ninguno de los tres.
 */
export const REFERENCE_BITS: Record<AttributeId, Record<StudyId, number | null>> = {
  canvas: { panopticlick2010: null, amiunique2016: 8.278, hiding2018: 8.546 },
  webgl: { panopticlick2010: null, amiunique2016: 3.406, hiding2018: 5.541 },
  fonts: { panopticlick2010: 13.9, amiunique2016: 8.379, hiding2018: 6.904 },
  screen: { panopticlick2010: 4.83, amiunique2016: 4.889, hiding2018: 4.847 },
  userAgent: { panopticlick2010: 10.0, amiunique2016: 9.779, hiding2018: 7.15 },
  language: { panopticlick2010: null, amiunique2016: 5.918, hiding2018: 2.716 },
  timezone: { panopticlick2010: 3.04, amiunique2016: 3.338, hiding2018: 0.164 },
  platform: { panopticlick2010: null, amiunique2016: 2.31, hiding2018: 1.2 },
  dnt: { panopticlick2010: null, amiunique2016: 0.944, hiding2018: 1.919 },
  cookies: { panopticlick2010: 0.353, amiunique2016: 0.253, hiding2018: 0 },
  storage: { panopticlick2010: null, amiunique2016: 0.405, hiding2018: 0.043 },
  audio: { panopticlick2010: null, amiunique2016: null, hiding2018: null },
  hardware: { panopticlick2010: null, amiunique2016: null, hiding2018: null },
};

export const ATTRIBUTE_ORDER: AttributeId[] = [
  'canvas',
  'userAgent',
  'fonts',
  'webgl',
  'screen',
  'language',
  'dnt',
  'platform',
  'timezone',
  'storage',
  'cookies',
  'audio',
  'hardware',
];

/** Población mundial aproximada (ONU, 2024): por encima, «1 entre N» deja de tener sentido. */
export const WORLD_POPULATION = 8_100_000_000;
/** log2 de la población mundial ≈ 32,9 bits */
export const WORLD_BITS = Math.log2(WORLD_POPULATION);

/** El estudio de Google 2024 ve que casi todas las webs consumen muy por debajo o muy por encima de 20 bits. */
export const HIGH_RISK_BITS = 20;

function statusOf(report: FullFingerprintReport, id: AttributeId): AttributeStatus {
  switch (id) {
    case 'canvas':
      return report.canvas.status;
    case 'webgl':
      return report.webgl.status;
    case 'fonts':
      return report.fonts.status;
    case 'screen':
      return report.display.status;
    case 'userAgent':
    case 'platform':
      return report.environment.userAgentStatus;
    case 'language':
      // quien uniformiza el User-Agent (Tor) también fija el idioma a en-US
      return report.environment.userAgentStatus;
    case 'timezone':
      return report.environment.timezoneStatus;
    case 'audio':
      return report.audio.status;
    case 'hardware':
      return report.hardware.status;
    default:
      return 'exposed';
  }
}

function valueOf(report: FullFingerprintReport, id: AttributeId): string {
  const r = report;
  switch (id) {
    case 'canvas':
      return r.canvas.hash;
    case 'webgl':
      return r.webgl.unmaskedRenderer || r.webgl.renderer;
    case 'fonts':
      return `${r.fonts.detectedCount}/${r.fonts.testedCount}`;
    case 'screen':
      return `${r.display.screenWidth}×${r.display.screenHeight} · ${r.display.colorDepth} bit · ${r.display.devicePixelRatio}x`;
    case 'userAgent':
      return r.environment.userAgent;
    case 'language':
      return r.environment.languages.join(', ') || r.environment.language;
    case 'timezone':
      return r.environment.timezone;
    case 'platform':
      return r.hardware.platform;
    case 'dnt':
      return r.environment.doNotTrack ?? '—';
    case 'cookies':
      return String(r.environment.cookiesEnabled);
    case 'storage':
      return String(r.environment.localStorageAvailable);
    case 'audio':
      return r.audio.supported ? r.audio.hash : '—';
    case 'hardware': {
      const cores = r.hardware.hardwareConcurrency ?? '—';
      const mem = r.hardware.deviceMemory === null ? '—' : `${r.hardware.deviceMemory} GB`;
      return `${cores} · ${mem}`;
    }
  }
}

const round = (n: number) => Math.round(n * 10) / 10;

export function estimateEntropy(report: FullFingerprintReport, study: StudyId = DEFAULT_STUDY): EntropyEstimate {
  const attributes: AttributeEstimate[] = ATTRIBUTE_ORDER.map((id) => {
    const status = statusOf(report, id);
    const referenceBits = REFERENCE_BITS[id][study];
    const countedBits = status === 'exposed' && referenceBits !== null ? referenceBits : 0;
    return { id, status, referenceBits, countedBits, value: valueOf(report, id) };
  });

  const sumBits = round(attributes.reduce((acc, a) => acc + a.countedBits, 0));
  const fullBits = round(
    attributes.reduce((acc, a) => acc + (a.referenceBits ?? 0), 0)
  );
  const unmeasured = attributes
    .filter((a) => a.status === 'exposed' && a.referenceBits === null)
    .map((a) => a.id);

  return {
    study,
    attributes,
    sumBits,
    removedBits: round(fullBits - sumBits),
    unmeasured,
  };
}

/**
 * «1 entre N» equivalente a unos bits. Devuelve null cuando N supera la población
 * mundial: a partir de ahí la cifra no describe nada real.
 */
export function oneInN(bits: number): number | null {
  if (bits >= WORLD_BITS) return null;
  return Math.round(Math.pow(2, bits));
}

export type RiskBand = 'low' | 'medium' | 'high';

export function riskBand(bits: number): RiskBand {
  if (bits > HIGH_RISK_BITS) return 'high';
  if (bits > 10) return 'medium';
  return 'low';
}

/** Autoinformación de un valor que aparece con probabilidad p: −log2(p). */
export function surprisal(p: number): number {
  if (p <= 0 || p > 1) throw new RangeError('p debe estar en (0, 1]');
  return -Math.log2(p) || 0; // evita −0 cuando p = 1
}

/** Entropía de Shannon de una distribución (las probabilidades deben sumar 1). */
export function shannonEntropy(probabilities: number[]): number {
  const total = probabilities.reduce((a, b) => a + b, 0);
  if (Math.abs(total - 1) > 1e-9) throw new RangeError('las probabilidades deben sumar 1');
  return probabilities.reduce((acc, p) => (p > 0 ? acc - p * Math.log2(p) : acc), 0);
}
