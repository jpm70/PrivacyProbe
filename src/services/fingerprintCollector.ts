/**
 * Motor de Recopilación e Inspección de Huella Digital del Navegador
 * Incluye rutinas reales de Canvas, WebGL, AudioContext, Fuentes y Hardware,
 * con soporte para emulación de perfiles (Incógnito, Brave Farbling, Tor Uniformity).
 */

import {
  CanvasFingerprintData,
  WebGLFingerprintData,
  AudioFingerprintData,
  DisplayFingerprintData,
  HardwareFingerprintData,
  SystemEnvironmentData,
  FontFingerprintData,
  FontTestResult,
  FullFingerprintReport,
  AttributeEntropy,
  DefenseSettings,
} from '../types/fingerprint';

/**
 * Función rápida de hash FNV-1a (32-bit) convertida a hex
 */
export function fnv1a(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return ('0000000' + (hash >>> 0).toString(16)).slice(-8);
}

/**
 * Hash Murmur3 sencillo para strings largos
 */
export function murmurHash3(key: string, seed: number = 0): string {
  let remainder = key.length & 3;
  let bytes = key.length - remainder;
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
    h1 = Math.imul(h1, 5) + 0xe6546b64;
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

  return ('0000000' + (h1 >>> 0).toString(16)).slice(-8);
}

/**
 * Recopila la huella real de Canvas 2D
 */
export function captureCanvasFingerprint(poison: boolean = false, poisonSeed: number = 0): CanvasFingerprintData {
  const startTime = performance.now();
  const width = 280;
  const height = 90;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return {
      hash: 'unsupported',
      dataUrl: '',
      executionTimeMs: 0,
      isPoisoned: poison,
      noiseLevel: 0,
      width,
      height,
    };
  }

  // Fondo con gradiente radial y lineal
  const radGrad = ctx.createRadialGradient(70, 45, 10, 140, 45, 120);
  radGrad.addColorStop(0, '#06b6d4');
  radGrad.addColorStop(0.5, '#3b82f6');
  radGrad.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, width, height);

  // Formas geométricas superpuestas con reglas de devanado
  ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
  ctx.beginPath();
  ctx.arc(60, 45, 35, 0, Math.PI * 2, true);
  ctx.fill();

  ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
  ctx.beginPath();
  ctx.arc(100, 45, 30, 0, Math.PI * 2, true);
  ctx.fill();

  // Curva bezier
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(20, 80);
  ctx.bezierCurveTo(40, 10, 180, 80, 260, 20);
  ctx.stroke();

  // Texto tipográfico sensible a subpíxeles y antialiasing
  ctx.font = 'bold 15px Arial, "Helvetica Neue", sans-serif';
  ctx.fillStyle = '#f8fafc';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillText('PrivacyProbe.fp 2026', 15, 32);

  // Texto secundario y glifos / emojis (revelan SO y biblioteca de glifos)
  ctx.shadowColor = 'transparent';
  ctx.font = '13px "Courier New", monospace';
  ctx.fillStyle = '#67e8f9';
  ctx.fillText('CanvasHash-V2 <c> 🛡️ 🔍', 15, 58);

  // Si se solicita farbling (Brave style o laboratorio de defensas)
  if (poison) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const pseudoRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const seed = poisonSeed || Date.now();
    for (let i = 0; i < data.length; i += 16) {
      const noise = Math.floor(pseudoRandom(seed + i) * 3) - 1; // -1, 0, o 1
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    }
    ctx.putImageData(imgData, 0, 0);
  }

  const dataUrl = canvas.toDataURL();
  const rawHash = murmurHash3(dataUrl) + fnv1a(dataUrl.slice(30, 200));
  const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    hash: rawHash,
    dataUrl,
    executionTimeMs,
    isPoisoned: poison,
    noiseLevel: poison ? 1.5 : 0,
    width,
    height,
  };
}

/**
 * Recopila parámetros WebGL y GPU
 */
export function captureWebGLFingerprint(maskVendor: boolean = false): WebGLFingerprintData {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;

    if (!gl) {
      return {
        vendor: 'No soportado',
        renderer: 'No soportado',
        unmaskedVendor: 'No disponible',
        unmaskedRenderer: 'No disponible',
        glVersion: 'N/A',
        shadingLanguageVersion: 'N/A',
        maxTextureSize: 0,
        extensionsCount: 0,
        hash: 'none',
        isMasked: maskVendor,
      };
    }

    let unmaskedVendor = 'Genérico';
    let unmaskedRenderer = 'Genérico';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      unmaskedVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Desconocido';
      unmaskedRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Desconocido';
    }

    const vendor = gl.getParameter(gl.VENDOR) || 'WebKit';
    const renderer = gl.getParameter(gl.RENDERER) || 'WebKit WebGL';
    const glVersion = gl.getParameter(gl.VERSION) || 'WebGL 1.0';
    const shadingLanguageVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || 'WebGL GLSL';
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 4096;
    const extensions = gl.getSupportedExtensions() || [];

    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;
    const fsSource = `
      precision mediump float;
      void main() {
        gl_FragColor = vec4(sin(gl_FragCoord.x * 0.1), cos(gl_FragCoord.y * 0.1), 0.75, 1.0);
      }
    `;

    const compileShader = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
    let renderHash = '00000000';

    if (vs && fs) {
      const prog = gl.createProgram();
      if (prog) {
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        gl.useProgram(prog);

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
          gl.STATIC_DRAW
        );

        const posAttr = gl.getAttribLocation(prog, 'position');
        gl.enableVertexAttribArray(posAttr);
        gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        const pixels = new Uint8Array(64 * 64 * 4);
        gl.readPixels(0, 0, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        renderHash = murmurHash3(pixels.slice(0, 256).toString());
      }
    }

    if (maskVendor) {
      unmaskedVendor = 'Mozilla';
      unmaskedRenderer = 'Mozilla WebGL / SwiftShader (Mascara Tor)';
      renderHash = 'tor-uniform-webgl';
    }

    const fullSignature = `${unmaskedVendor}|${unmaskedRenderer}|${glVersion}|${shadingLanguageVersion}|${maxTextureSize}|${extensions.length}|${renderHash}`;
    const hash = murmurHash3(fullSignature) + fnv1a(fullSignature);

    return {
      vendor,
      renderer,
      unmaskedVendor,
      unmaskedRenderer,
      glVersion,
      shadingLanguageVersion,
      maxTextureSize,
      extensionsCount: extensions.length,
      hash,
      isMasked: maskVendor,
    };
  } catch {
    return {
      vendor: 'Error al consultar',
      renderer: 'Error al consultar',
      unmaskedVendor: 'No disponible',
      unmaskedRenderer: 'No disponible',
      glVersion: 'N/A',
      shadingLanguageVersion: 'N/A',
      maxTextureSize: 0,
      extensionsCount: 0,
      hash: 'error-webgl',
      isMasked: maskVendor,
    };
  }
}

/**
 * Huella de AudioContext
 */
export async function captureAudioFingerprint(spoof: boolean = false): Promise<AudioFingerprintData> {
  if (spoof) {
    return {
      hash: 'audio-tor-standardized',
      sampleSum: 124.0434,
      supported: true,
      isSpoofed: true,
    };
  }

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      return {
        hash: 'unsupported',
        sampleSum: 0,
        supported: false,
        isSpoofed: false,
      };
    }

    const OfflineCtx = window.OfflineAudioContext || (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext;
    if (OfflineCtx) {
      const offlineCtx = new OfflineCtx(1, 44100, 44100);
      const osc = offlineCtx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(10000, offlineCtx.currentTime);

      const compressor = offlineCtx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-50, offlineCtx.currentTime);
      compressor.knee.setValueAtTime(40, offlineCtx.currentTime);
      compressor.ratio.setValueAtTime(12, offlineCtx.currentTime);
      compressor.attack.setValueAtTime(0, offlineCtx.currentTime);
      compressor.release.setValueAtTime(0.25, offlineCtx.currentTime);

      osc.connect(compressor);
      compressor.connect(offlineCtx.destination);
      osc.start(0);

      const renderedBuffer = await offlineCtx.startRendering();
      const channelData = renderedBuffer.getChannelData(0);
      let sum = 0;
      for (let i = 4500; i < 5000; i++) {
        sum += Math.abs(channelData[i]);
      }
      const hash = murmurHash3(sum.toString(16)) + fnv1a(channelData.slice(1000, 1050).toString());
      return {
        hash,
        sampleSum: Math.round(sum * 10000) / 10000,
        supported: true,
        isSpoofed: false,
      };
    }

    return {
      hash: 'audio-no-offline',
      sampleSum: 0,
      supported: true,
      isSpoofed: false,
    };
  } catch {
    return {
      hash: 'audio-blocked',
      sampleSum: 0,
      supported: false,
      isSpoofed: false,
    };
  }
}

/**
 * Catálogo de fuentes representativas para testear
 */
const FONT_TEST_SUITE: Array<{ name: string; category: FontTestResult['category'] }> = [
  { name: 'Arial', category: 'Sistema' },
  { name: 'Helvetica', category: 'Sistema' },
  { name: 'Times New Roman', category: 'Sistema' },
  { name: 'Courier New', category: 'Sistema' },
  { name: 'Georgia', category: 'Sistema' },
  { name: 'Verdana', category: 'Sistema' },
  { name: 'Trebuchet MS', category: 'Sistema' },
  { name: 'Comic Sans MS', category: 'Sistema' },
  { name: 'Impact', category: 'Sistema' },
  { name: 'Palatino', category: 'Sistema' },
  { name: 'Lucida Grande', category: 'Sistema' },
  { name: 'Segoe UI', category: 'Sistema' },
  { name: 'SF Pro Display', category: 'Sistema' },
  { name: 'Ubuntu', category: 'Sistema' },
  { name: 'Cantarell', category: 'Sistema' },
  { name: 'Roboto', category: 'Sistema' },
  { name: 'Calibri', category: 'Ofimática' },
  { name: 'Cambria', category: 'Ofimática' },
  { name: 'Candara', category: 'Ofimática' },
  { name: 'Corbel', category: 'Ofimática' },
  { name: 'Franklin Gothic', category: 'Ofimática' },
  { name: 'Garamond', category: 'Ofimática' },
  { name: 'Gill Sans', category: 'Ofimática' },
  { name: 'Baskerville', category: 'Ofimática' },
  { name: 'Aptos', category: 'Ofimática' },
  { name: 'Futura', category: 'Diseño' },
  { name: 'Didot', category: 'Diseño' },
  { name: 'Bodoni 72', category: 'Diseño' },
  { name: 'Myriad Pro', category: 'Diseño' },
  { name: 'Minion Pro', category: 'Diseño' },
  { name: 'DIN Alternate', category: 'Diseño' },
  { name: 'Avenir', category: 'Diseño' },
  { name: 'Optima', category: 'Diseño' },
  { name: 'Consolas', category: 'Desarrollo' },
  { name: 'Monaco', category: 'Desarrollo' },
  { name: 'Menlo', category: 'Desarrollo' },
  { name: 'Cascadia Code', category: 'Desarrollo' },
  { name: 'JetBrains Mono', category: 'Desarrollo' },
  { name: 'Fira Code', category: 'Desarrollo' },
];

/**
 * Detección de fuentes del sistema mediante comparación de dimensiones relativas
 */
export function detectSystemFonts(restrict: boolean = false): FontFingerprintData {
  if (restrict) {
    const standardFonts = ['Arial', 'Courier New', 'Times New Roman', 'Georgia'];
    const details: FontTestResult[] = FONT_TEST_SUITE.map((f) => ({
      name: f.name,
      isInstalled: standardFonts.includes(f.name),
      category: f.category,
    }));
    return {
      installedFonts: standardFonts,
      testedCount: FONT_TEST_SUITE.length,
      detectedCount: standardFonts.length,
      fontHash: 'tor-standard-fonts-001',
      details,
      isRestricted: true,
    };
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
      installedFonts: ['Arial', 'Times New Roman'],
      testedCount: FONT_TEST_SUITE.length,
      detectedCount: 2,
      fontHash: 'fallback-fonts',
      details: [],
      isRestricted: false,
    };
  }

  const testString = 'mmmmmmmmmmlliwwwwwwwwwWWWWIIIII11119999';
  const baseFonts = ['monospace', 'sans-serif', 'serif'];
  const testSize = '72px';

  const defaultWidths: Record<string, number> = {};
  for (const baseFont of baseFonts) {
    ctx.font = `${testSize} ${baseFont}`;
    defaultWidths[baseFont] = ctx.measureText(testString).width;
  }

  const installed: string[] = [];
  const details: FontTestResult[] = [];

  for (const font of FONT_TEST_SUITE) {
    let isPresent = false;

    if (document.fonts && document.fonts.check) {
      try {
        if (document.fonts.check(`12px "${font.name}"`)) {
          for (const baseFont of baseFonts) {
            ctx.font = `${testSize} "${font.name}", ${baseFont}`;
            const matchedWidth = ctx.measureText(testString).width;
            if (matchedWidth !== defaultWidths[baseFont]) {
              isPresent = true;
              break;
            }
          }
        }
      } catch {
        // Fallback
      }
    }

    if (!isPresent) {
      for (const baseFont of baseFonts) {
        ctx.font = `${testSize} "${font.name}", ${baseFont}`;
        const matchedWidth = ctx.measureText(testString).width;
        if (matchedWidth !== defaultWidths[baseFont]) {
          isPresent = true;
          break;
        }
      }
    }

    if (isPresent) {
      installed.push(font.name);
    }

    details.push({
      name: font.name,
      isInstalled: isPresent,
      category: font.category,
    });
  }

  const fontHash = murmurHash3(installed.sort().join(',')) + fnv1a(installed.length.toString());

  return {
    installedFonts: installed,
    testedCount: FONT_TEST_SUITE.length,
    detectedCount: installed.length,
    fontHash,
    details,
    isRestricted: false,
  };
}

/**
 * Detección de parámetros de Pantalla y Geometría
 */
export function captureDisplayData(letterbox: boolean = false): DisplayFingerprintData {
  if (letterbox) {
    return {
      screenWidth: 1000,
      screenHeight: 1000,
      availWidth: 1000,
      availHeight: 1000,
      colorDepth: 24,
      pixelDepth: 24,
      devicePixelRatio: 1,
      windowInnerWidth: 1000,
      windowInnerHeight: 1000,
      isLetterboxed: true,
    };
  }

  return {
    screenWidth: window.screen ? window.screen.width : 1920,
    screenHeight: window.screen ? window.screen.height : 1080,
    availWidth: window.screen ? window.screen.availWidth : 1920,
    availHeight: window.screen ? window.screen.availHeight : 1040,
    colorDepth: window.screen ? window.screen.colorDepth : 24,
    pixelDepth: window.screen ? window.screen.pixelDepth : 24,
    devicePixelRatio: window.devicePixelRatio || 1,
    windowInnerWidth: window.innerWidth,
    windowInnerHeight: window.innerHeight,
    isLetterboxed: false,
  };
}

/**
 * Detección de Hardware y Concurrencia
 */
export function captureHardwareData(clampHardware: boolean = false): HardwareFingerprintData {
  if (clampHardware) {
    return {
      hardwareConcurrency: 2,
      deviceMemory: null,
      maxTouchPoints: 0,
      platform: 'Win32',
    };
  }

  const nav = window.navigator as unknown as {
    hardwareConcurrency?: number;
    deviceMemory?: number;
    maxTouchPoints?: number;
    platform?: string;
  };

  return {
    hardwareConcurrency: nav.hardwareConcurrency || 4,
    deviceMemory: nav.deviceMemory || null,
    maxTouchPoints: nav.maxTouchPoints || 0,
    platform: nav.platform || 'Desconocido',
  };
}

/**
 * Entorno y Configuración del Sistema
 */
export function captureSystemEnvironment(
  normalizeTimezone: boolean = false,
  spoofUA: boolean = false
): SystemEnvironmentData {
  const nav = window.navigator;

  let userAgent = nav.userAgent;
  let timezone = 'UTC';
  let timezoneOffset = 0;

  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    timezoneOffset = new Date().getTimezoneOffset();
  } catch {
    timezone = 'UTC';
  }

  if (normalizeTimezone) {
    timezone = 'UTC';
    timezoneOffset = 0;
  }

  if (spoofUA) {
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; rv:128.0) Gecko/20100101 Firefox/128.0';
  }

  let localStorageAvailable = false;
  try {
    localStorage.setItem('__probe_test__', '1');
    localStorage.removeItem('__probe_test__');
    localStorageAvailable = true;
  } catch {
    localStorageAvailable = false;
  }

  return {
    userAgent,
    language: nav.language || 'es-ES',
    languages: Array.from(nav.languages || ['es-ES']),
    timezone,
    timezoneOffset,
    cookiesEnabled: nav.cookieEnabled,
    localStorageAvailable,
    indexedDbAvailable: typeof window.indexedDB !== 'undefined',
    doNotTrack: nav.doNotTrack || null,
    globalPrivacyControl: (nav as unknown as { globalPrivacyControl?: boolean }).globalPrivacyControl || null,
  };
}

/**
 * Cálculo de Entropía de Shannon individual y total
 */
export function calculateEntropyBreakdown(
  canvas: CanvasFingerprintData,
  webgl: WebGLFingerprintData,
  audio: AudioFingerprintData,
  display: DisplayFingerprintData,
  hardware: HardwareFingerprintData,
  env: SystemEnvironmentData,
  fonts: FontFingerprintData
): { breakdown: AttributeEntropy[]; totalBits: number; oneInX: number; uniquenessScore: number } {
  const breakdown: AttributeEntropy[] = [];

  // 1. Canvas
  const canvasBits = canvas.isPoisoned ? 1.2 : 8.6;
  breakdown.push({
    id: 'canvas',
    name: 'Hash de Lienzo (Canvas 2D)',
    category: 'Gráficos',
    valueSummary: canvas.isPoisoned ? `Ruido activo (Farbling): ${canvas.hash}` : `Fijo: ${canvas.hash}`,
    entropyBits: canvasBits,
    maxPossibleBits: 10.0,
    uniquenessRatio: Math.round(Math.pow(2, canvasBits)),
    riskLevel: canvas.isPoisoned ? 'Bajo' : 'Crítico',
    description:
      'Diferencias sub-píxel causadas por el motor de rasterización 2D, antialiasing y renderizado de texto de la GPU.',
    incognitoProtected: false,
    mitigationAvailable: 'Canvas Poisoning (Ruido estocástico por sesión como en Brave Browser)',
  });

  // 2. WebGL GPU
  const webglBits = webgl.isMasked ? 1.5 : 7.8;
  breakdown.push({
    id: 'webgl',
    name: 'Firma GPU & WebGL',
    category: 'Gráficos',
    valueSummary: webgl.isMasked ? 'Máscara Genérica Mozilla' : `${webgl.unmaskedRenderer}`,
    entropyBits: webglBits,
    maxPossibleBits: 9.0,
    uniquenessRatio: Math.round(Math.pow(2, webglBits)),
    riskLevel: webgl.isMasked ? 'Bajo' : 'Crítico',
    description:
      'Modelo exacto de tarjeta gráfica, controlador de vídeo del fabricante y precisión de shaders de coma flotante.',
    incognitoProtected: false,
    mitigationAvailable: 'Enmascaramiento WebGL y deshabilitación de debug_renderer_info',
  });

  // 3. Fuentes Instaladas
  const fontBits = fonts.isRestricted ? 1.8 : Math.min(8.2, 3.0 + fonts.detectedCount * 0.28);
  breakdown.push({
    id: 'fonts',
    name: 'Lista de Fuentes del Sistema',
    category: 'Fuentes',
    valueSummary: fonts.isRestricted ? '4 fuentes estándar' : `${fonts.detectedCount} fuentes detectadas`,
    entropyBits: Math.round(fontBits * 10) / 10,
    maxPossibleBits: 9.5,
    uniquenessRatio: Math.round(Math.pow(2, fontBits)),
    riskLevel: fonts.isRestricted ? 'Bajo' : 'Alto',
    description:
      'La combinación de fuentes instaladas revela suites ofimáticas, programas de diseño y el sistema operativo.',
    incognitoProtected: false,
    mitigationAvailable: 'Restricción de fuentes a tipografías estándar de la web (Tor / resistFingerprinting)',
  });

  // 4. Pantalla y Pixel Ratio
  const displayBits = display.isLetterboxed ? 1.0 : 4.8;
  breakdown.push({
    id: 'display',
    name: 'Geometría de Pantalla y DPI',
    category: 'Pantalla',
    valueSummary: display.isLetterboxed
      ? '1000x1000 (Letterbox Tor)'
      : `${display.screenWidth}x${display.screenHeight} @ ${display.devicePixelRatio}x`,
    entropyBits: displayBits,
    maxPossibleBits: 6.0,
    uniquenessRatio: Math.round(Math.pow(2, displayBits)),
    riskLevel: display.isLetterboxed ? 'Bajo' : 'Medio',
    description: 'Resolución de monitor, barra de tareas disponible y factor de escala de alta densidad (HiDPI).',
    incognitoProtected: false,
    mitigationAvailable: 'Letterboxing (márgenes automáticos para uniformizar tamaño de ventana)',
  });

  // 5. Hardware Concurrency y Memoria
  const hardwareBits = hardware.hardwareConcurrency === 2 && hardware.deviceMemory === null ? 0.9 : 3.4;
  breakdown.push({
    id: 'hardware',
    name: 'Concurrencia de CPU y RAM',
    category: 'Hardware',
    valueSummary: `${hardware.hardwareConcurrency} núcleos ${hardware.deviceMemory ? `· ${hardware.deviceMemory} GB RAM` : ''}`,
    entropyBits: hardwareBits,
    maxPossibleBits: 4.5,
    uniquenessRatio: Math.round(Math.pow(2, hardwareBits)),
    riskLevel: hardwareBits > 2 ? 'Medio' : 'Bajo',
    description: 'Número de hilos lógicos de procesamiento disponibles y memoria del dispositivo expuesta al navegador.',
    incognitoProtected: false,
    mitigationAvailable: 'Fijación uniforme de hardwareConcurrency a 2 hilos',
  });

  // 6. User-Agent y Plataforma
  const uaBits = env.userAgent.includes('rv:128.0') ? 2.1 : 6.2;
  breakdown.push({
    id: 'environment',
    name: 'User-Agent y Plataforma',
    category: 'Entorno',
    valueSummary: env.userAgent.includes('rv:128.0') ? 'Firefox ESR estandarizado' : env.userAgent.slice(0, 48) + '...',
    entropyBits: uaBits,
    maxPossibleBits: 8.0,
    uniquenessRatio: Math.round(Math.pow(2, uaBits)),
    riskLevel: uaBits > 4 ? 'Alto' : 'Bajo',
    description: 'Versión del navegador, arquitectura de CPU, versión de SO y extensiones de renderizado.',
    incognitoProtected: false,
    mitigationAvailable: 'Client Hints genéricos y User-Agent congelado',
  });

  // 7. Zona Horaria e Idioma
  const tzBits = env.timezone === 'UTC' ? 0.5 : 3.2;
  breakdown.push({
    id: 'timezone',
    name: 'Zona Horaria y Localización',
    category: 'Entorno',
    valueSummary: `${env.timezone} (${env.timezoneOffset} min)`,
    entropyBits: tzBits,
    maxPossibleBits: 4.0,
    uniquenessRatio: Math.round(Math.pow(2, tzBits)),
    riskLevel: tzBits > 2 ? 'Medio' : 'Bajo',
    description: 'Huso horario y desfase con UTC que estrechan la localización geográfica del usuario.',
    incognitoProtected: false,
    mitigationAvailable: 'Normalización a UTC (GMT+0)',
  });

  // 8. AudioContext
  const audioBits = audio.isSpoofed ? 0.4 : 3.6;
  breakdown.push({
    id: 'audio',
    name: 'Firma de Procesamiento de Audio',
    category: 'Audio',
    valueSummary: audio.isSpoofed ? 'Estandarizado' : `Hash: ${audio.hash.slice(0, 8)}`,
    entropyBits: audioBits,
    maxPossibleBits: 4.5,
    uniquenessRatio: Math.round(Math.pow(2, audioBits)),
    riskLevel: audio.isSpoofed ? 'Bajo' : 'Medio',
    description: 'Variaciones microscópicas de coma flotante en el filtro de audio causadas por el procesador y el SO.',
    incognitoProtected: false,
    mitigationAvailable: 'Inyección de ruido de audio o deshabilitación en modo restrictivo',
  });

  const totalBits = Math.round(breakdown.reduce((acc, curr) => acc + curr.entropyBits, 0) * 10) / 10;
  const oneInX = Math.round(Math.pow(2, totalBits));
  const uniquenessScore = Math.min(99.999, Math.round((1 - 1 / Math.max(2, oneInX)) * 100000) / 1000);

  return {
    breakdown,
    totalBits,
    oneInX,
    uniquenessScore,
  };
}

/**
 * Generador principal del informe completo para cualquier perfil o configuración
 */
export async function generateFingerprintReport(
  profileId: 'real' | 'incognito' | 'brave' | 'tor' | 'custom' = 'real',
  customSettings?: DefenseSettings
): Promise<FullFingerprintReport> {
  const settings: DefenseSettings = customSettings || {
    canvasPoisoning: profileId === 'brave',
    webglMasking: profileId === 'tor',
    letterboxing: profileId === 'tor',
    fontRestriction: profileId === 'tor',
    hardwareClamping: profileId === 'tor',
    timezoneNormalization: profileId === 'tor',
    userAgentSpoofing: profileId === 'tor',
  };

  const isBrave = profileId === 'brave' || settings.canvasPoisoning;
  const isTor = profileId === 'tor';

  const canvas = captureCanvasFingerprint(settings.canvasPoisoning, isBrave ? Date.now() : 42);
  const webgl = captureWebGLFingerprint(settings.webglMasking || isTor);
  const audio = await captureAudioFingerprint(settings.hardwareClamping || isTor);
  const display = captureDisplayData(settings.letterboxing || isTor);
  const hardware = captureHardwareData(settings.hardwareClamping || isTor);
  const environment = captureSystemEnvironment(
    settings.timezoneNormalization || isTor,
    settings.userAgentSpoofing || isTor
  );
  const fonts = detectSystemFonts(settings.fontRestriction || isTor);

  const { breakdown, totalBits, oneInX, uniquenessScore } = calculateEntropyBreakdown(
    canvas,
    webgl,
    audio,
    display,
    hardware,
    environment,
    fonts
  );

  const rawComposite = `${canvas.hash}|${webgl.hash}|${fonts.fontHash}|${display.screenWidth}x${display.screenHeight}|${hardware.hardwareConcurrency}|${environment.timezone}|${audio.hash}`;
  const compositeHash = murmurHash3(rawComposite) + '-' + fnv1a(rawComposite);

  const profileNames: Record<typeof profileId, string> = {
    real: 'Tu Navegador Real',
    incognito: 'Modo Incógnito / Privado',
    brave: 'Brave Browser (Canvas Farbling)',
    tor: 'Tor Browser (Uniformidad Total)',
    custom: 'Laboratorio de Defensas',
  };

  return {
    timestamp: Date.now(),
    compositeHash,
    totalEntropyBits: totalBits,
    uniquenessScore,
    oneInX,
    profileId,
    profileName: profileNames[profileId],
    canvas,
    webgl,
    audio,
    display,
    hardware,
    environment,
    fonts,
    entropyBreakdown: breakdown,
  };
}
