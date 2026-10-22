/**
 * Definiciones de tipos para el Simulador de Huella Digital y Rastreo de Navegador
 */

export type ProfileId = 'real' | 'incognito' | 'brave' | 'tor' | 'custom';

export interface CanvasFingerprintData {
  hash: string;
  dataUrl: string;
  executionTimeMs: number;
  isPoisoned: boolean;
  noiseLevel: number;
  width: number;
  height: number;
}

export interface WebGLFingerprintData {
  vendor: string;
  renderer: string;
  unmaskedVendor: string;
  unmaskedRenderer: string;
  glVersion: string;
  shadingLanguageVersion: string;
  maxTextureSize: number;
  extensionsCount: number;
  hash: string;
  isMasked: boolean;
}

export interface AudioFingerprintData {
  hash: string;
  sampleSum: number;
  supported: boolean;
  isSpoofed: boolean;
}

export interface DisplayFingerprintData {
  screenWidth: number;
  screenHeight: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  pixelDepth: number;
  devicePixelRatio: number;
  windowInnerWidth: number;
  windowInnerHeight: number;
  isLetterboxed: boolean;
}

export interface HardwareFingerprintData {
  hardwareConcurrency: number;
  deviceMemory: number | null;
  maxTouchPoints: number;
  platform: string;
  batteryStatus?: string;
  networkType?: string;
}

export interface SystemEnvironmentData {
  userAgent: string;
  language: string;
  languages: string[];
  timezone: string;
  timezoneOffset: number;
  cookiesEnabled: boolean;
  localStorageAvailable: boolean;
  indexedDbAvailable: boolean;
  doNotTrack: string | null;
  globalPrivacyControl: boolean | null;
}

export interface FontTestResult {
  name: string;
  isInstalled: boolean;
  category: 'Sistema' | 'Ofimática' | 'Diseño' | 'Desarrollo';
}

export interface FontFingerprintData {
  installedFonts: string[];
  testedCount: number;
  detectedCount: number;
  fontHash: string;
  details: FontTestResult[];
  isRestricted: boolean;
}

export interface AttributeEntropy {
  id: string;
  name: string;
  category: 'Gráficos' | 'Hardware' | 'Pantalla' | 'Entorno' | 'Fuentes' | 'Audio';
  valueSummary: string;
  entropyBits: number;
  maxPossibleBits: number;
  uniquenessRatio: number; // e.g., 1 in X
  riskLevel: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
  description: string;
  incognitoProtected: boolean; // ¿Protegido por Modo Incógnito?
  mitigationAvailable: string;
}

export interface FullFingerprintReport {
  timestamp: number;
  compositeHash: string;
  totalEntropyBits: number;
  uniquenessScore: number; // Percentage, e.g. 99.98%
  oneInX: number; // e.g. 1 in 32,000,000
  profileId: 'real' | 'incognito' | 'brave' | 'tor' | 'custom';
  profileName: string;
  canvas: CanvasFingerprintData;
  webgl: WebGLFingerprintData;
  audio: AudioFingerprintData;
  display: DisplayFingerprintData;
  hardware: HardwareFingerprintData;
  environment: SystemEnvironmentData;
  fonts: FontFingerprintData;
  entropyBreakdown: AttributeEntropy[];
}

export interface WebRTCLeakData {
  supported: boolean;
  localIps: string[];
  publicIps: string[];
  candidateTypes: string[];
  isBlockedOrMitigated: boolean;
  riskSummary: string;
}

export interface DefenseSettings {
  canvasPoisoning: boolean;
  webglMasking: boolean;
  letterboxing: boolean;
  fontRestriction: boolean;
  hardwareClamping: boolean;
  timezoneNormalization: boolean;
  userAgentSpoofing: boolean;
}
