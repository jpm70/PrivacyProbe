/**
 * Recolector de huella del navegador: Canvas 2D, WebGL, Web Audio, fuentes, pantalla,
 * hardware y entorno. Todo se calcula en el navegador; nada sale del equipo.
 *
 * Los perfiles Brave, Tor y el laboratorio no ejecutan esos navegadores: aplican sobre
 * tus datos reales el efecto documentado de cada defensa (ruido, valor fijo o bloqueo).
 */

import type {
  AttributeStatus,
  AudioFingerprintData,
  CanvasFingerprintData,
  DefenseSettings,
  DisplayFingerprintData,
  FontCategory,
  FontFingerprintData,
  FontTestResult,
  FullFingerprintReport,
  HardwareFingerprintData,
  ProfileId,
  SystemEnvironmentData,
  WebGLFingerprintData,
} from '../types/fingerprint';

/** FNV-1a de 32 bits en hexadecimal. */
export function fnv1a(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/** MurmurHash3 (x86, 32 bits) sobre los códigos de carácter de la cadena. */
export function murmurHash3(key: string, seed = 0): string {
  const remainder = key.length & 3;
  const bytes = key.length - remainder;
  let h1 = seed;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;
  let i = 0;

  while (i < bytes) {
    let k1 =
      (key.charCodeAt(i) & 0xff) |
      ((key.charCodeAt(i + 1) & 0xff) << 8) |
      ((key.charCodeAt(i + 2) & 0xff) << 16) |
      ((key.charCodeAt(i + 3) & 0xff) << 24);
    i += 4;
    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);
    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1 = (Math.imul(h1, 5) + 0xe6546b64) | 0;
  }

  let k1 = 0;
  switch (remainder) {
    case 3:
      k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
    // fallthrough
    case 2:
      k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
    // fallthrough
    case 1:
      k1 ^= key.charCodeAt(i) & 0xff;
      k1 = Math.imul(k1, c1);
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = Math.imul(k1, c2);
      h1 ^= k1;
  }

  h1 ^= key.length;
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0xc2b2ae35);
  h1 ^= h1 >>> 16;
  return (h1 >>> 0).toString(16).padStart(8, '0');
}

/** Hash de 64 bits (dos funciones distintas concatenadas), suficiente para comparar huellas. */
export function hash64(str: string): string {
  return murmurHash3(str) + fnv1a(str);
}

/** Generador pseudoaleatorio determinista (mulberry32) para el ruido del farbling. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CANVAS_W = 280;
const CANVAS_H = 90;

/**
 * Canvas 2D. Con `mode = 'randomized'` añade ±1 a algunos canales (como el farbling de Brave);
 * con `mode = 'blocked'` devuelve una imagen en blanco, que es lo que lee un script en Tor
 * Browser cuando el usuario no autoriza la extracción del lienzo.
 */
export function captureCanvasFingerprint(mode: AttributeStatus = 'exposed', seed = 0): CanvasFingerprintData {
  const start = performance.now();
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return { hash: 'unsupported', dataUrl: '', executionTimeMs: 0, status: mode, width: CANVAS_W, height: CANVAS_H };
  }

  if (mode === 'blocked') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  } else {
    const radGrad = ctx.createRadialGradient(70, 45, 10, 140, 45, 120);
    radGrad.addColorStop(0, '#06b6d4');
    radGrad.addColorStop(0.5, '#3b82f6');
    radGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.beginPath();
    ctx.arc(60, 45, 35, 0, Math.PI * 2, true);
    ctx.fill();

    ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
    ctx.beginPath();
    ctx.arc(100, 45, 30, 0, Math.PI * 2, true);
    ctx.fill();

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(20, 80);
    ctx.bezierCurveTo(40, 10, 180, 80, 260, 20);
    ctx.stroke();

    // El texto con sombra y los emojis dependen del rasterizador de fuentes del sistema.
    ctx.font = 'bold 15px Arial, "Helvetica Neue", sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText('PrivacyProbe.fp 2026', 15, 32);

    ctx.shadowColor = 'transparent';
    ctx.font = '13px "Courier New", monospace';
    ctx.fillStyle = '#67e8f9';
    ctx.fillText('CanvasHash-V2 <c> 🛡️ 🔍', 15, 58);

    if (mode === 'randomized') {
      const img = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
      const rand = mulberry32(seed || 1);
      for (let i = 0; i < img.data.length; i += 16) {
        const noise = Math.floor(rand() * 3) - 1; // −1, 0 o +1
        img.data[i] = Math.max(0, Math.min(255, img.data[i] + noise));
        img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1] + noise));
      }
      ctx.putImageData(img, 0, 0);
    }
  }

  const dataUrl = canvas.toDataURL();
  return {
    hash: hash64(dataUrl),
    dataUrl,
    executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
    status: mode,
    width: CANVAS_W,
    height: CANVAS_H,
  };
}

/** WebGL: fabricante y modelo de GPU, parámetros y un render de prueba. */
export function captureWebGLFingerprint(mode: AttributeStatus = 'exposed'): WebGLFingerprintData {
  const empty = (hash: string): WebGLFingerprintData => ({
    vendor: '',
    renderer: '',
    unmaskedVendor: '',
    unmaskedRenderer: '',
    glVersion: '',
    shadingLanguageVersion: '',
    maxTextureSize: 0,
    extensionsCount: 0,
    hash,
    supported: false,
    status: mode,
  });

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return empty('unsupported');

    let unmaskedVendor = '';
    let unmaskedRenderer = '';
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      unmaskedVendor = String(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '');
      unmaskedRenderer = String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '');
    }

    const vendor = String(gl.getParameter(gl.VENDOR) || '');
    const renderer = String(gl.getParameter(gl.RENDERER) || '');
    const glVersion = String(gl.getParameter(gl.VERSION) || '');
    const shadingLanguageVersion = String(gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || '');
    const maxTextureSize = Number(gl.getParameter(gl.MAX_TEXTURE_SIZE) || 0);
    const extensions = gl.getSupportedExtensions() || [];

    let renderHash = '00000000';
    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}');
    const fs = compile(
      gl.FRAGMENT_SHADER,
      'precision mediump float;void main(){gl_FragColor=vec4(sin(gl_FragCoord.x*0.1),cos(gl_FragCoord.y*0.1),0.75,1.0);}'
    );
    if (vs && fs) {
      const prog = gl.createProgram();
      if (prog) {
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        gl.useProgram(prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
        const pos = gl.getAttribLocation(prog, 'p');
        gl.enableVertexAttribArray(pos);
        gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        const pixels = new Uint8Array(64 * 64 * 4);
        gl.readPixels(0, 0, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        renderHash = murmurHash3(Array.prototype.join.call(pixels, ','));
      }
    }

    if (mode === 'uniform') {
      // Firefox con resistFingerprinting y Tor Browser responden «Mozilla» a ambas consultas.
      unmaskedVendor = 'Mozilla';
      unmaskedRenderer = 'Mozilla';
      renderHash = 'uniform';
    }

    const signature = [unmaskedVendor, unmaskedRenderer, glVersion, shadingLanguageVersion, maxTextureSize, extensions.length, renderHash].join('|');
    return {
      vendor,
      renderer,
      unmaskedVendor,
      unmaskedRenderer,
      glVersion,
      shadingLanguageVersion,
      maxTextureSize,
      extensionsCount: extensions.length,
      hash: hash64(signature),
      supported: true,
      status: mode,
    };
  } catch {
    return empty('error');
  }
}

/** Web Audio: oscilador + compresor en un OfflineAudioContext (no suena nada). */
export async function captureAudioFingerprint(mode: AttributeStatus = 'exposed', seed = 0): Promise<AudioFingerprintData> {
  const OfflineCtx =
    window.OfflineAudioContext ||
    (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext;
  if (!OfflineCtx) return { hash: 'unsupported', sampleSum: 0, supported: false, status: mode };

  if (mode === 'uniform' || mode === 'blocked') {
    return { hash: 'uniform', sampleSum: 0, supported: true, status: mode };
  }

  try {
    const ctx = new OfflineCtx(1, 44100, 44100);
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(10000, ctx.currentTime);
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.setValueAtTime(-50, ctx.currentTime);
    comp.knee.setValueAtTime(40, ctx.currentTime);
    comp.ratio.setValueAtTime(12, ctx.currentTime);
    comp.attack.setValueAtTime(0, ctx.currentTime);
    comp.release.setValueAtTime(0.25, ctx.currentTime);
    osc.connect(comp);
    comp.connect(ctx.destination);
    osc.start(0);

    const buffer = await ctx.startRendering();
    const data = buffer.getChannelData(0);
    let sum = 0;
    for (let i = 4500; i < 5000; i++) sum += Math.abs(data[i]);
    if (mode === 'randomized') {
      // ruido minúsculo por sesión, como hacen Brave y la navegación privada de Safari
      sum += (mulberry32(seed || 1)() - 0.5) * 1e-7;
    }
    const sample = Array.prototype.slice.call(data, 1000, 1050).join(',');
    return { hash: hash64(sum.toString(16) + '|' + (mode === 'randomized' ? seed : sample)), sampleSum: Math.round(sum * 10000) / 10000, supported: true, status: mode };
  } catch {
    return { hash: 'blocked', sampleSum: 0, supported: false, status: mode };
  }
}

const FONT_TEST_SUITE: Array<{ name: string; category: FontCategory }> = [
  { name: 'Arial', category: 'system' },
  { name: 'Helvetica', category: 'system' },
  { name: 'Times New Roman', category: 'system' },
  { name: 'Courier New', category: 'system' },
  { name: 'Georgia', category: 'system' },
  { name: 'Verdana', category: 'system' },
  { name: 'Trebuchet MS', category: 'system' },
  { name: 'Comic Sans MS', category: 'system' },
  { name: 'Impact', category: 'system' },
  { name: 'Palatino', category: 'system' },
  { name: 'Lucida Grande', category: 'system' },
  { name: 'Segoe UI', category: 'system' },
  { name: 'SF Pro Display', category: 'system' },
  { name: 'Ubuntu', category: 'system' },
  { name: 'Cantarell', category: 'system' },
  { name: 'Roboto', category: 'system' },
  { name: 'Calibri', category: 'office' },
  { name: 'Cambria', category: 'office' },
  { name: 'Candara', category: 'office' },
  { name: 'Corbel', category: 'office' },
  { name: 'Franklin Gothic', category: 'office' },
  { name: 'Garamond', category: 'office' },
  { name: 'Gill Sans', category: 'office' },
  { name: 'Baskerville', category: 'office' },
  { name: 'Aptos', category: 'office' },
  { name: 'Futura', category: 'design' },
  { name: 'Didot', category: 'design' },
  { name: 'Bodoni 72', category: 'design' },
  { name: 'Myriad Pro', category: 'design' },
  { name: 'Minion Pro', category: 'design' },
  { name: 'DIN Alternate', category: 'design' },
  { name: 'Avenir', category: 'design' },
  { name: 'Optima', category: 'design' },
  { name: 'Consolas', category: 'dev' },
  { name: 'Monaco', category: 'dev' },
  { name: 'Menlo', category: 'dev' },
  { name: 'Cascadia Code', category: 'dev' },
  { name: 'JetBrains Mono', category: 'dev' },
  { name: 'Fira Code', category: 'dev' },
];

/** Fuentes que deja ver Tor Browser: las que trae empaquetadas, iguales para todos. */
const UNIFORM_FONTS = ['Arial', 'Courier New', 'Times New Roman', 'Georgia'];

/**
 * Detección de fuentes por diferencia de anchura: si un texto medido con «Fuente, monospace»
 * no mide lo mismo que con «monospace», la fuente está instalada.
 */
export function detectSystemFonts(mode: AttributeStatus = 'exposed'): FontFingerprintData {
  if (mode === 'uniform') {
    const details: FontTestResult[] = FONT_TEST_SUITE.map((f) => ({ ...f, isInstalled: UNIFORM_FONTS.includes(f.name) }));
    return {
      installedFonts: UNIFORM_FONTS,
      testedCount: FONT_TEST_SUITE.length,
      detectedCount: UNIFORM_FONTS.length,
      fontHash: hash64(UNIFORM_FONTS.join(',')),
      details,
      status: mode,
    };
  }

  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) {
    return { installedFonts: [], testedCount: FONT_TEST_SUITE.length, detectedCount: 0, fontHash: 'unsupported', details: [], status: mode };
  }

  const testString = 'mmmmmmmmmmlliwwwwwwwwwWWWWIIIII11119999';
  const baseFonts = ['monospace', 'sans-serif', 'serif'];
  const base: Record<string, number> = {};
  for (const b of baseFonts) {
    ctx.font = `72px ${b}`;
    base[b] = ctx.measureText(testString).width;
  }

  const details: FontTestResult[] = FONT_TEST_SUITE.map((font) => {
    const isInstalled = baseFonts.some((b) => {
      ctx.font = `72px "${font.name}", ${b}`;
      return ctx.measureText(testString).width !== base[b];
    });
    return { ...font, isInstalled };
  });
  const installed = details.filter((d) => d.isInstalled).map((d) => d.name);

  return {
    installedFonts: installed,
    testedCount: FONT_TEST_SUITE.length,
    detectedCount: installed.length,
    fontHash: hash64([...installed].sort().join(',')),
    details,
    status: mode,
  };
}

/** Letterboxing de Tor: la ventana se redondea a múltiplos de 200×100 y la pantalla dice lo mismo. */
export function letterbox(width: number, height: number): { width: number; height: number } {
  const w = Math.max(200, Math.floor(width / 200) * 200);
  const h = Math.max(100, Math.floor(height / 100) * 100);
  return { width: Math.min(w, 1400), height: Math.min(h, 900) };
}

export function captureDisplayData(mode: AttributeStatus = 'exposed'): DisplayFingerprintData {
  const s = window.screen;
  if (mode === 'uniform') {
    const box = letterbox(window.innerWidth, window.innerHeight);
    return {
      screenWidth: box.width,
      screenHeight: box.height,
      availWidth: box.width,
      availHeight: box.height,
      colorDepth: 24,
      pixelDepth: 24,
      devicePixelRatio: 1,
      windowInnerWidth: box.width,
      windowInnerHeight: box.height,
      status: mode,
    };
  }
  return {
    screenWidth: s.width,
    screenHeight: s.height,
    availWidth: s.availWidth,
    availHeight: s.availHeight,
    colorDepth: s.colorDepth,
    pixelDepth: s.pixelDepth,
    devicePixelRatio: window.devicePixelRatio || 1,
    windowInnerWidth: window.innerWidth,
    windowInnerHeight: window.innerHeight,
    status: mode,
  };
}

export function captureHardwareData(mode: AttributeStatus = 'exposed', seed = 0): HardwareFingerprintData {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const real = {
    hardwareConcurrency: typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : null,
    deviceMemory: typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null,
    maxTouchPoints: nav.maxTouchPoints || 0,
    platform: nav.platform || '',
  };
  if (mode === 'uniform') {
    // valor fijo igual para todos los usuarios de la defensa (Tor/RFP lo fijaban a 2)
    return { hardwareConcurrency: 2, deviceMemory: null, maxTouchPoints: 0, platform: real.platform, status: mode };
  }
  if (mode === 'randomized' && real.hardwareConcurrency) {
    // Brave devuelve un número de núcleos entre 2 y el real, distinto por sesión
    const n = 2 + Math.floor(mulberry32(seed || 1)() * Math.max(1, real.hardwareConcurrency - 1));
    return { ...real, hardwareConcurrency: Math.min(n, real.hardwareConcurrency), status: mode };
  }
  return { ...real, status: mode };
}

/** User-Agent que comparten los usuarios de Tor Browser en Windows (Firefox ESR 128). */
export const UNIFORM_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; rv:128.0) Gecko/20100101 Firefox/128.0';

export function captureSystemEnvironment(tzMode: AttributeStatus = 'exposed', uaMode: AttributeStatus = 'exposed'): SystemEnvironmentData {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  let timezone = 'UTC';
  let timezoneOffset = 0;
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    timezoneOffset = new Date().getTimezoneOffset();
  } catch {
    /* sin Intl: se queda en UTC */
  }
  if (tzMode === 'uniform') {
    timezone = 'UTC';
    timezoneOffset = 0;
  }

  let localStorageAvailable = false;
  try {
    localStorage.setItem('__pp_probe__', '1');
    localStorage.removeItem('__pp_probe__');
    localStorageAvailable = true;
  } catch {
    localStorageAvailable = false;
  }

  const uniformUA = uaMode === 'uniform';
  return {
    userAgent: uniformUA ? UNIFORM_USER_AGENT : nav.userAgent,
    language: uniformUA ? 'en-US' : nav.language,
    languages: uniformUA ? ['en-US', 'en'] : Array.from(nav.languages || [nav.language]),
    timezone,
    timezoneOffset,
    cookiesEnabled: nav.cookieEnabled,
    localStorageAvailable,
    indexedDbAvailable: typeof window.indexedDB !== 'undefined',
    doNotTrack: nav.doNotTrack ?? null,
    globalPrivacyControl: typeof nav.globalPrivacyControl === 'boolean' ? nav.globalPrivacyControl : null,
    timezoneStatus: tzMode,
    userAgentStatus: uaMode,
  };
}

export const NO_DEFENSES: DefenseSettings = {
  canvasPoisoning: false,
  webglMasking: false,
  letterboxing: false,
  fontRestriction: false,
  hardwareClamping: false,
  timezoneNormalization: false,
  userAgentSpoofing: false,
};

export const ALL_DEFENSES: DefenseSettings = {
  canvasPoisoning: true,
  webglMasking: true,
  letterboxing: true,
  fontRestriction: true,
  hardwareClamping: true,
  timezoneNormalization: true,
  userAgentSpoofing: true,
};

/** Estado de cada vector según el perfil. Tor bloquea el canvas; Brave mete ruido. */
export function profileModes(profileId: ProfileId, settings: DefenseSettings = NO_DEFENSES) {
  if (profileId === 'tor') {
    return { canvas: 'blocked', webgl: 'uniform', audio: 'uniform', fonts: 'uniform', display: 'uniform', hardware: 'uniform', timezone: 'uniform', userAgent: 'uniform' } as const;
  }
  if (profileId === 'brave') {
    return { canvas: 'randomized', webgl: 'exposed', audio: 'randomized', fonts: 'exposed', display: 'exposed', hardware: 'randomized', timezone: 'exposed', userAgent: 'exposed' } as const;
  }
  if (profileId === 'custom') {
    const pick = (on: boolean, mode: AttributeStatus): AttributeStatus => (on ? mode : 'exposed');
    return {
      canvas: pick(settings.canvasPoisoning, 'randomized'),
      webgl: pick(settings.webglMasking, 'uniform'),
      audio: pick(settings.canvasPoisoning, 'randomized'),
      fonts: pick(settings.fontRestriction, 'uniform'),
      display: pick(settings.letterboxing, 'uniform'),
      hardware: pick(settings.hardwareClamping, 'uniform'),
      timezone: pick(settings.timezoneNormalization, 'uniform'),
      userAgent: pick(settings.userAgentSpoofing, 'uniform'),
    };
  }
  // real e incógnito (Chrome/Edge): todo expuesto
  return { canvas: 'exposed', webgl: 'exposed', audio: 'exposed', fonts: 'exposed', display: 'exposed', hardware: 'exposed', timezone: 'exposed', userAgent: 'exposed' } as const;
}

/** Huella completa para un perfil. `seed` cambia en cada sesión simulada (farbling). */
export async function generateFingerprintReport(
  profileId: ProfileId = 'real',
  settings: DefenseSettings = NO_DEFENSES,
  seed: number = Date.now()
): Promise<FullFingerprintReport> {
  const m = profileModes(profileId, settings);
  const canvas = captureCanvasFingerprint(m.canvas, seed);
  const webgl = captureWebGLFingerprint(m.webgl);
  const audio = await captureAudioFingerprint(m.audio, seed);
  const display = captureDisplayData(m.display);
  const hardware = captureHardwareData(m.hardware, seed);
  const environment = captureSystemEnvironment(m.timezone, m.userAgent);
  const fonts = detectSystemFonts(m.fonts);

  const composite = [
    canvas.hash,
    webgl.hash,
    audio.hash,
    fonts.fontHash,
    `${display.screenWidth}x${display.screenHeight}x${display.colorDepth}@${display.devicePixelRatio}`,
    hardware.hardwareConcurrency,
    hardware.deviceMemory,
    environment.userAgent,
    environment.languages.join(','),
    environment.timezone,
  ].join('|');

  return {
    timestamp: Date.now(),
    compositeHash: `${murmurHash3(composite)}-${fnv1a(composite)}`,
    profileId,
    canvas,
    webgl,
    audio,
    display,
    hardware,
    environment,
    fonts,
  };
}
