/**
 * Tipos de PrivacyProbe. Los datos recogidos no llevan textos: la interfaz los
 * traduce al mostrarlos (ES/EN), así la lógica no depende del idioma.
 */

export type ProfileId = 'real' | 'incognito' | 'brave' | 'tor' | 'custom';

/** Qué le pasa a un atributo con el perfil o las defensas activas. */
export type AttributeStatus =
  | 'exposed' // valor real del equipo
  | 'randomized' // ruido distinto en cada sesión (farbling): no sirve para enlazar visitas
  | 'uniform' // valor fijo compartido por todos los que usan esa defensa
  | 'blocked'; // la lectura se bloquea (p. ej. canvas en Tor devuelve una imagen en blanco)

export interface CanvasFingerprintData {
  hash: string;
  dataUrl: string;
  executionTimeMs: number;
  status: AttributeStatus;
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
  supported: boolean;
  status: AttributeStatus;
}

export interface AudioFingerprintData {
  hash: string;
  sampleSum: number;
  supported: boolean;
  status: AttributeStatus;
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
  status: AttributeStatus;
}

export interface HardwareFingerprintData {
  /** null si el navegador no lo expone */
  hardwareConcurrency: number | null;
  deviceMemory: number | null;
  maxTouchPoints: number;
  platform: string;
  status: AttributeStatus;
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
  timezoneStatus: AttributeStatus;
  userAgentStatus: AttributeStatus;
}

export type FontCategory = 'system' | 'office' | 'design' | 'dev';

export interface FontTestResult {
  name: string;
  isInstalled: boolean;
  category: FontCategory;
}

export interface FontFingerprintData {
  installedFonts: string[];
  testedCount: number;
  detectedCount: number;
  fontHash: string;
  details: FontTestResult[];
  status: AttributeStatus;
}

/** Atributos que se pueden comparar con los estudios publicados. */
export type AttributeId =
  | 'canvas'
  | 'webgl'
  | 'fonts'
  | 'screen'
  | 'userAgent'
  | 'language'
  | 'timezone'
  | 'platform'
  | 'dnt'
  | 'cookies'
  | 'storage'
  | 'audio'
  | 'hardware';

export type StudyId = 'panopticlick2010' | 'amiunique2016' | 'hiding2018';

export interface AttributeEstimate {
  id: AttributeId;
  status: AttributeStatus;
  /** bits medidos en el estudio elegido, o null si ese estudio no midió el atributo */
  referenceBits: number | null;
  /** bits que cuentan en la suma: los de referencia si el atributo está expuesto */
  countedBits: number;
  /** valor observado, ya listo para mostrar (sin traducir) */
  value: string;
}

export interface EntropyEstimate {
  study: StudyId;
  attributes: AttributeEstimate[];
  /** suma de los bits de los atributos expuestos: cota superior (supone independencia) */
  sumBits: number;
  /** bits que las defensas activas han dejado de exponer respecto al navegador real */
  removedBits: number;
  /** atributos expuestos sin dato en el estudio (no cuentan) */
  unmeasured: AttributeId[];
}

export interface FullFingerprintReport {
  timestamp: number;
  compositeHash: string;
  profileId: ProfileId;
  canvas: CanvasFingerprintData;
  webgl: WebGLFingerprintData;
  audio: AudioFingerprintData;
  display: DisplayFingerprintData;
  hardware: HardwareFingerprintData;
  environment: SystemEnvironmentData;
  fonts: FontFingerprintData;
}

export type IpKind =
  | 'mdns' // nombre aleatorio .local: el navegador oculta la IP local
  | 'private' // 10/8, 172.16/12, 192.168/16
  | 'cgnat' // 100.64/10 (NAT del operador)
  | 'linklocal' // 169.254/16 o fe80::/10
  | 'loopback'
  | 'ula' // IPv6 privada fc00::/7
  | 'public'
  | 'unknown';

export interface IceAddress {
  address: string;
  kind: IpKind;
  /** host = interfaz del equipo; srflx = IP pública que ve el servidor STUN */
  candidateType: string;
}

export interface WebRTCLeakData {
  supported: boolean;
  blocked: boolean;
  addresses: IceAddress[];
  candidateTypes: string[];
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
