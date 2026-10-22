import { describe, expect, test } from 'bun:test';
import type { AttributeStatus, FullFingerprintReport } from '../src/types/fingerprint';
import {
  ATTRIBUTE_ORDER,
  REFERENCE_BITS,
  STUDIES,
  WORLD_BITS,
  estimateEntropy,
  oneInN,
  riskBand,
  shannonEntropy,
  surprisal,
} from '../src/services/entropyModel';
import { ALL_DEFENSES, NO_DEFENSES, fnv1a, hash64, letterbox, mulberry32, murmurHash3, profileModes } from '../src/services/fingerprintCollector';
import { classifyIp, compareWithHttpIp, parseCandidate, verdict } from '../src/services/webRtcDetector';
import { pdfSafe } from '../src/components/ForensicReportModal';
import { attributeName, statusLabel } from '../src/labels';

function fakeReport(over: Partial<Record<'canvas' | 'webgl' | 'audio' | 'display' | 'hardware' | 'fonts' | 'tz' | 'ua', AttributeStatus>> = {}): FullFingerprintReport {
  const s = (k: keyof typeof over) => over[k] ?? 'exposed';
  return {
    timestamp: 0,
    compositeHash: 'x',
    profileId: 'real',
    canvas: { hash: 'c', dataUrl: '', executionTimeMs: 1, status: s('canvas'), width: 1, height: 1 },
    webgl: {
      vendor: 'v', renderer: 'r', unmaskedVendor: 'NVIDIA', unmaskedRenderer: 'RTX', glVersion: '', shadingLanguageVersion: '',
      maxTextureSize: 0, extensionsCount: 0, hash: 'w', supported: true, status: s('webgl'),
    },
    audio: { hash: 'a', sampleSum: 1, supported: true, status: s('audio') },
    display: {
      screenWidth: 1920, screenHeight: 1080, availWidth: 1920, availHeight: 1040, colorDepth: 24, pixelDepth: 24,
      devicePixelRatio: 1, windowInnerWidth: 1280, windowInnerHeight: 720, status: s('display'),
    },
    hardware: { hardwareConcurrency: 8, deviceMemory: 8, maxTouchPoints: 0, platform: 'Win32', status: s('hardware') },
    environment: {
      userAgent: 'UA', language: 'es-ES', languages: ['es-ES', 'es'], timezone: 'Europe/Madrid', timezoneOffset: -120,
      cookiesEnabled: true, localStorageAvailable: true, indexedDbAvailable: true, doNotTrack: null, globalPrivacyControl: null,
      timezoneStatus: s('tz'), userAgentStatus: s('ua'),
    },
    fonts: { installedFonts: [], testedCount: 39, detectedCount: 10, fontHash: 'f', details: [], status: s('fonts') },
  };
}

describe('datos de referencia', () => {
  test('cifras de la tabla 3 de Laperdrix et al.', () => {
    expect(REFERENCE_BITS.canvas.hiding2018).toBe(8.546);
    expect(REFERENCE_BITS.userAgent.amiunique2016).toBe(9.779);
    expect(REFERENCE_BITS.fonts.panopticlick2010).toBe(13.9);
    expect(REFERENCE_BITS.timezone.hiding2018).toBe(0.164);
    expect(STUDIES.hiding2018.fingerprints).toBe(2067942);
    expect(STUDIES.amiunique2016.maxBits).toBe(16.86);
  });

  test('el máximo de cada estudio es log2 del número de huellas', () => {
    for (const s of Object.values(STUDIES)) {
      expect(Math.abs(Math.log2(s.fingerprints) - s.maxBits)).toBeLessThan(0.01);
    }
  });

  test('ningún atributo supera el máximo medible de su estudio', () => {
    for (const id of ATTRIBUTE_ORDER) {
      for (const s of Object.values(STUDIES)) {
        const v = REFERENCE_BITS[id][s.id];
        if (v !== null) expect(v).toBeLessThanOrEqual(s.maxBits);
      }
    }
  });
});

describe('estimación', () => {
  test('navegador sin defensas, con Hiding in the Crowd', () => {
    const e = estimateEntropy(fakeReport(), 'hiding2018');
    expect(e.sumBits).toBe(39);
    expect(e.removedBits).toBe(0);
    expect(e.unmeasured.sort()).toEqual(['audio', 'hardware']);
  });

  test('perfil Tor: solo quedan DNT, almacenamiento y cookies', () => {
    const e = estimateEntropy(
      fakeReport({ canvas: 'blocked', webgl: 'uniform', audio: 'uniform', display: 'uniform', hardware: 'uniform', fonts: 'uniform', tz: 'uniform', ua: 'uniform' }),
      'hiding2018'
    );
    expect(e.sumBits).toBe(2);
    expect(e.removedBits).toBe(37);
    expect(e.unmeasured).toEqual([]);
  });

  test('el ruido (farbling) deja de contar el atributo', () => {
    const base = estimateEntropy(fakeReport(), 'amiunique2016').sumBits;
    const noisy = estimateEntropy(fakeReport({ canvas: 'randomized' }), 'amiunique2016').sumBits;
    expect(Math.round((base - noisy) * 1000) / 1000).toBeCloseTo(8.3, 1);
  });

  test('Panopticlick no midió canvas: no cuenta', () => {
    const e = estimateEntropy(fakeReport(), 'panopticlick2010');
    const canvas = e.attributes.find((a) => a.id === 'canvas')!;
    expect(canvas.referenceBits).toBeNull();
    expect(canvas.countedBits).toBe(0);
    expect(e.unmeasured).toContain('canvas');
  });
});

describe('matemáticas', () => {
  test('autoinformación y entropía', () => {
    expect(surprisal(1 / 8)).toBe(3);
    expect(surprisal(1)).toBe(0);
    expect(shannonEntropy([0.5, 0.5])).toBe(1);
    expect(shannonEntropy([0.25, 0.25, 0.25, 0.25])).toBe(2);
    expect(shannonEntropy([1])).toBe(0);
    expect(() => shannonEntropy([0.5, 0.4])).toThrow();
    expect(() => surprisal(0)).toThrow();
  });

  test('1 entre N no pasa de la población mundial', () => {
    expect(oneInN(10)).toBe(1024);
    expect(oneInN(WORLD_BITS + 0.1)).toBeNull();
    expect(oneInN(45.6)).toBeNull(); // el original decía «1 entre 53 billones»
    expect(WORLD_BITS).toBeGreaterThan(32.9);
    expect(WORLD_BITS).toBeLessThan(33);
  });

  test('bandas de riesgo', () => {
    expect(riskBand(5)).toBe('low');
    expect(riskBand(15)).toBe('medium');
    expect(riskBand(25)).toBe('high');
  });
});

describe('hashes y ruido', () => {
  test('vectores conocidos de FNV-1a y MurmurHash3', () => {
    expect(fnv1a('')).toBe('811c9dc5');
    expect(fnv1a('a')).toBe('e40c292c');
    expect(fnv1a('foobar')).toBe('bf9cf968');
    expect(murmurHash3('')).toBe('00000000');
    expect(murmurHash3('hello')).toBe('248bfa47');
    expect(murmurHash3('The quick brown fox jumps over the lazy dog')).toBe('2e4ff723');
  });

  test('hash64 es determinista y distingue entradas', () => {
    expect(hash64('abc')).toBe(hash64('abc'));
    expect(hash64('abc')).not.toBe(hash64('abd'));
    expect(hash64('abc')).toHaveLength(16);
  });

  test('mulberry32 repite con la misma semilla y cambia con otra', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const c = mulberry32(43);
    const va = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(va);
    expect(c()).not.toBe(va[0]);
    for (const v of va) expect(v >= 0 && v < 1).toBe(true);
  });

  test('letterboxing a múltiplos de 200 × 100', () => {
    expect(letterbox(1912, 983)).toEqual({ width: 1400, height: 900 });
    expect(letterbox(1280, 720)).toEqual({ width: 1200, height: 700 });
    expect(letterbox(150, 50)).toEqual({ width: 200, height: 100 });
  });
});

describe('perfiles', () => {
  test('Tor bloquea el canvas en lugar de meter ruido (el original lo dejaba igual que el real)', () => {
    const m = profileModes('tor');
    expect(m.canvas).toBe('blocked');
    expect(m.webgl).toBe('uniform');
    expect(m.display).toBe('uniform');
  });

  test('incógnito no cambia nada; Brave mete ruido', () => {
    expect(Object.values(profileModes('incognito')).every((v) => v === 'exposed')).toBe(true);
    expect(profileModes('brave').canvas).toBe('randomized');
    expect(profileModes('brave').webgl).toBe('exposed');
  });

  test('el laboratorio respeta cada interruptor', () => {
    expect(Object.values(profileModes('custom', NO_DEFENSES)).every((v) => v === 'exposed')).toBe(true);
    const all = profileModes('custom', ALL_DEFENSES);
    expect(all.canvas).toBe('randomized');
    expect(all.userAgent).toBe('uniform');
    expect(profileModes('custom', { ...NO_DEFENSES, timezoneNormalization: true }).timezone).toBe('uniform');
  });
});

describe('WebRTC', () => {
  test('clasifica todo el rango privado 172.16.0.0/12 (el original solo veía .16 y .31)', () => {
    expect(classifyIp('172.20.5.4')).toBe('private');
    expect(classifyIp('172.16.0.1')).toBe('private');
    expect(classifyIp('172.31.255.255')).toBe('private');
    expect(classifyIp('172.32.0.1')).toBe('public');
    expect(classifyIp('172.15.0.1')).toBe('public');
  });

  test('otros rangos', () => {
    expect(classifyIp('10.0.0.5')).toBe('private');
    expect(classifyIp('192.168.1.20')).toBe('private');
    expect(classifyIp('100.72.1.1')).toBe('cgnat');
    expect(classifyIp('169.254.3.3')).toBe('linklocal');
    expect(classifyIp('127.0.0.1')).toBe('loopback');
    expect(classifyIp('8.8.8.8')).toBe('public');
    expect(classifyIp('3f1c2a9e-1b2c-4d5e-8f90-1234567890ab.local')).toBe('mdns');
    expect(classifyIp('fe80::1')).toBe('linklocal');
    expect(classifyIp('fd12:3456::1')).toBe('ula');
    expect(classifyIp('2001:db8::1')).toBe('public');
    expect(classifyIp('::1')).toBe('loopback');
    expect(classifyIp('999.1.1.1')).toBe('unknown');
  });

  test('lee las líneas de candidato ICE', () => {
    expect(parseCandidate('candidate:842163049 1 udp 1677729535 203.0.113.7 54321 typ srflx raddr 0.0.0.0 rport 0 generation 0')).toEqual({
      address: '203.0.113.7',
      kind: 'public',
      candidateType: 'srflx',
    });
    expect(parseCandidate('candidate:1 1 udp 2122260223 abcd.local 5000 typ host')?.kind).toBe('mdns');
    expect(parseCandidate('basura')).toBeNull();
  });

  test('veredictos', () => {
    const base = { supported: true, blocked: false, candidateTypes: [] };
    expect(verdict({ ...base, addresses: [] })).toBe('clean');
    expect(verdict({ ...base, addresses: [{ address: 'x.local', kind: 'mdns', candidateType: 'host' }] })).toBe('clean');
    expect(verdict({ ...base, addresses: [{ address: '192.168.1.2', kind: 'private', candidateType: 'host' }] })).toBe('local-exposed');
    expect(verdict({ ...base, addresses: [{ address: '2001:db8::5', kind: 'public', candidateType: 'host' }] })).toBe('public-ipv6-exposed');
    // la IP pública de STUN sola no es una fuga (el original lo marcaba como «vulnerable»)
    expect(verdict({ ...base, addresses: [{ address: '203.0.113.7', kind: 'public', candidateType: 'srflx' }] })).toBe('public-seen');
    expect(verdict({ supported: false, blocked: false, candidateTypes: [], addresses: [] })).toBe('unsupported');
  });

  test('fuga real: la IP de STUN no coincide con la que ve la web', () => {
    const data = { supported: true, blocked: false, candidateTypes: ['srflx'], addresses: [{ address: '203.0.113.7', kind: 'public' as const, candidateType: 'srflx' }] };
    expect(compareWithHttpIp(data, ['203.0.113.7'])).toBe('match');
    expect(compareWithHttpIp(data, ['198.51.100.9'])).toBe('mismatch');
    expect(compareWithHttpIp({ ...data, addresses: [] }, ['1.1.1.1'])).toBe('no-stun-ip');
  });
});

describe('textos', () => {
  test('el PDF solo recibe caracteres WinAnsi', () => {
    const out = pdfSafe('Tor → «uniforme» − 3 bits ≈ ñ 🛡️');
    expect(out).toBe('Tor -> «uniforme» - 3 bits ~ ñ ?');
    expect(/[^\x20-\x7E -ÿ—…•™€]/.test(out)).toBe(false);
  });

  test('todos los atributos y estados tienen nombre en los dos idiomas', () => {
    const es = (a: string) => a;
    const en = (_: string, b: string) => b;
    for (const id of ATTRIBUTE_ORDER) {
      expect(attributeName(id, es).length).toBeGreaterThan(1);
      expect(attributeName(id, en).length).toBeGreaterThan(1);
    }
    for (const s of ['exposed', 'randomized', 'uniform', 'blocked'] as const) {
      expect(statusLabel(s, es)).not.toBe(statusLabel(s, en));
    }
  });
});
