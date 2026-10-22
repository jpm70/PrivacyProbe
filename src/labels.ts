import type { AttributeId, AttributeStatus, FontCategory, ProfileId } from './types/fingerprint';

type T = (es: string, en: string) => string;

export function attributeName(id: AttributeId, t: T): string {
  const names: Record<AttributeId, [string, string]> = {
    canvas: ['Lienzo (Canvas 2D)', 'Canvas 2D'],
    webgl: ['GPU (WebGL)', 'GPU (WebGL)'],
    fonts: ['Fuentes instaladas', 'Installed fonts'],
    screen: ['Pantalla y color', 'Screen and colour'],
    userAgent: ['User-Agent', 'User-Agent'],
    language: ['Idiomas', 'Languages'],
    timezone: ['Zona horaria', 'Time zone'],
    platform: ['Plataforma', 'Platform'],
    dnt: ['Do Not Track', 'Do Not Track'],
    cookies: ['Cookies activadas', 'Cookies enabled'],
    storage: ['Almacenamiento local', 'Local storage'],
    audio: ['Audio (Web Audio)', 'Audio (Web Audio)'],
    hardware: ['Núcleos y memoria', 'Cores and memory'],
  };
  const [es, en] = names[id];
  return t(es, en);
}

export function attributeHint(id: AttributeId, t: T): string {
  const hints: Record<AttributeId, [string, string]> = {
    canvas: [
      'Cómo dibujan tu GPU, sus controladores y el rasterizador de fuentes un mismo lienzo.',
      'How your GPU, its drivers and the font rasteriser draw the same canvas.',
    ],
    webgl: [
      'Fabricante y modelo de la tarjeta gráfica (WEBGL_debug_renderer_info).',
      'Graphics card vendor and model (WEBGL_debug_renderer_info).',
    ],
    fonts: [
      'Qué tipografías tienes: delatan Office, Adobe, herramientas de desarrollo…',
      'Which typefaces you have: they reveal Office, Adobe, developer tools…',
    ],
    screen: ['Resolución, profundidad de color y escala HiDPI.', 'Resolution, colour depth and HiDPI scale.'],
    userAgent: ['Navegador, versión y sistema operativo.', 'Browser, version and operating system.'],
    language: ['Idiomas preferidos y su orden.', 'Preferred languages and their order.'],
    timezone: ['Huso horario del sistema.', 'System time zone.'],
    platform: ['navigator.platform (Win32, MacIntel, Linux…).', 'navigator.platform (Win32, MacIntel, Linux…).'],
    dnt: ['Si pides «no rastrear». Irónicamente, también distingue.', 'Whether you ask "do not track". Ironically, it also identifies.'],
    cookies: ['Si las cookies están activadas.', 'Whether cookies are enabled.'],
    storage: ['Si localStorage está disponible.', 'Whether localStorage is available.'],
    audio: [
      'Diferencias de coma flotante al procesar un sonido que no llega a sonar.',
      'Floating-point differences when processing a sound that is never played.',
    ],
    hardware: ['navigator.hardwareConcurrency y navigator.deviceMemory.', 'navigator.hardwareConcurrency and navigator.deviceMemory.'],
  };
  const [es, en] = hints[id];
  return t(es, en);
}

export function statusLabel(s: AttributeStatus, t: T): string {
  switch (s) {
    case 'exposed':
      return t('Expuesto', 'Exposed');
    case 'randomized':
      return t('Ruido por sesión', 'Per-session noise');
    case 'uniform':
      return t('Valor uniforme', 'Uniform value');
    case 'blocked':
      return t('Bloqueado', 'Blocked');
  }
}

export function statusClass(s: AttributeStatus): string {
  switch (s) {
    case 'exposed':
      return 'bg-rose-500/15 text-rose-300 border-rose-500/40';
    case 'randomized':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
    case 'uniform':
    case 'blocked':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
  }
}

export function profileName(id: ProfileId, t: T): string {
  switch (id) {
    case 'real':
      return t('Tu navegador', 'Your browser');
    case 'incognito':
      return t('Incógnito (Chrome/Edge)', 'Incognito (Chrome/Edge)');
    case 'brave':
      return t('Estilo Brave (ruido)', 'Brave-style (noise)');
    case 'tor':
      return t('Estilo Tor Browser (uniforme)', 'Tor Browser-style (uniform)');
    case 'custom':
      return t('Laboratorio', 'Lab');
  }
}

export function fontCategory(c: FontCategory, t: T): string {
  switch (c) {
    case 'system':
      return t('Sistema', 'System');
    case 'office':
      return t('Ofimática', 'Office');
    case 'design':
      return t('Diseño', 'Design');
    case 'dev':
      return t('Desarrollo', 'Development');
  }
}

/** «1 entre 2,4 millones» en el idioma de la interfaz. */
export function bigNumber(n: number, t: T, num: (n: number, d?: number) => string): string {
  if (n >= 1e9) return `${num(n / 1e9, 1)} ${t('mil millones', 'billion')}`;
  if (n >= 1e6) return `${num(n / 1e6, 1)} ${t('millones', 'million')}`;
  return num(n);
}
