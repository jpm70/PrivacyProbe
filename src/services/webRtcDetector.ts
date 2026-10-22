/**
 * Prueba de WebRTC: qué direcciones aparecen en los candidatos ICE.
 *
 * Solo se ejecuta cuando el usuario pulsa el botón, porque consulta un servidor STUN
 * público (stun.l.google.com). La comparación con la IP que ven las webs consulta
 * además api.ipify.org, también solo a petición.
 */

import type { IceAddress, IpKind, WebRTCLeakData } from '../types/fingerprint';

export const STUN_SERVER = 'stun:stun.l.google.com:19302';
export const IP_ECHO_URLS = ['https://api64.ipify.org?format=json', 'https://api.ipify.org?format=json'];

function ipv4Parts(ip: string): number[] | null {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip);
  if (!m) return null;
  const parts = m.slice(1).map(Number);
  return parts.every((n) => n <= 255) ? parts : null;
}

/** Tipo de dirección según los rangos reservados (RFC 1918, 6598, 3927, 4193, 4291). */
export function classifyIp(address: string): IpKind {
  const ip = address.trim().toLowerCase().replace(/^\[|\]$/g, '');
  if (ip.endsWith('.local')) return 'mdns';

  const v4 = ipv4Parts(ip);
  if (v4) {
    const [a, b] = v4;
    if (a === 10) return 'private';
    if (a === 172 && b >= 16 && b <= 31) return 'private';
    if (a === 192 && b === 168) return 'private';
    if (a === 100 && b >= 64 && b <= 127) return 'cgnat';
    if (a === 169 && b === 254) return 'linklocal';
    if (a === 127) return 'loopback';
    if (a === 0 || a >= 224) return 'unknown';
    return 'public';
  }

  if (ip.includes(':')) {
    if (ip === '::1') return 'loopback';
    if (/^fe[89ab]/.test(ip)) return 'linklocal';
    if (/^f[cd]/.test(ip)) return 'ula';
    if (/^[23]/.test(ip)) return 'public';
    return 'unknown';
  }
  return 'unknown';
}

/** Extrae dirección y tipo de una línea «candidate:…» de ICE. */
export function parseCandidate(line: string): IceAddress | null {
  const parts = line.trim().split(/\s+/);
  // candidate:<foundation> <componente> <protocolo> <prioridad> <dirección> <puerto> typ <tipo> …
  const typIndex = parts.indexOf('typ');
  if (parts.length < 8 || typIndex < 0) return null;
  const address = parts[4];
  const candidateType = parts[typIndex + 1] || '';
  if (!address) return null;
  return { address, kind: classifyIp(address), candidateType };
}

export type WebRTCVerdict =
  | 'unsupported' // el navegador no tiene WebRTC o lo bloquea
  | 'clean' // sin direcciones o solo nombres mDNS
  | 'local-exposed' // aparece una IP de la red local real
  | 'public-ipv6-exposed' // aparece la IPv6 global del equipo
  | 'public-seen'; // solo la IP pública que STUN ve (la misma que cualquier web, salvo VPN mal configurada)

export function verdict(data: WebRTCLeakData): WebRTCVerdict {
  if (!data.supported || data.blocked) return 'unsupported';
  const host = data.addresses.filter((a) => a.candidateType === 'host');
  if (host.some((a) => a.kind === 'private' || a.kind === 'cgnat' || a.kind === 'linklocal' || a.kind === 'ula')) {
    return 'local-exposed';
  }
  if (host.some((a) => a.kind === 'public' && a.address.includes(':'))) return 'public-ipv6-exposed';
  if (data.addresses.some((a) => a.kind === 'public')) return 'public-seen';
  return 'clean';
}

/**
 * Compara la IP pública que ve STUN con la que ven las webs. Si difieren, el tráfico
 * de WebRTC sale por otro camino (típico de una VPN o proxy que solo cubre el navegador).
 */
export function compareWithHttpIp(data: WebRTCLeakData, httpIps: string[]): 'match' | 'mismatch' | 'no-stun-ip' {
  const stunIps = data.addresses.filter((a) => a.candidateType === 'srflx' && a.kind === 'public').map((a) => a.address.toLowerCase());
  if (stunIps.length === 0) return 'no-stun-ip';
  const seen = new Set(httpIps.map((ip) => ip.toLowerCase()));
  return stunIps.every((ip) => seen.has(ip)) ? 'match' : 'mismatch';
}

export async function fetchHttpIps(): Promise<string[]> {
  const results = await Promise.allSettled(
    IP_ECHO_URLS.map(async (url) => {
      const res = await fetch(url, { cache: 'no-store', referrerPolicy: 'no-referrer' });
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as { ip?: string };
      return typeof json.ip === 'string' ? json.ip : '';
    })
  );
  return Array.from(new Set(results.flatMap((r) => (r.status === 'fulfilled' && r.value ? [r.value] : []))));
}

export async function detectWebRTCLeak(timeoutMs = 3000): Promise<WebRTCLeakData> {
  const RTCPC =
    window.RTCPeerConnection ||
    (window as unknown as { webkitRTCPeerConnection?: typeof RTCPeerConnection }).webkitRTCPeerConnection;
  if (!RTCPC) return { supported: false, blocked: false, addresses: [], candidateTypes: [] };

  let pc: RTCPeerConnection;
  try {
    pc = new RTCPC({ iceServers: [{ urls: STUN_SERVER }] });
  } catch {
    return { supported: true, blocked: true, addresses: [], candidateTypes: [] };
  }

  return new Promise<WebRTCLeakData>((resolve) => {
    const found = new Map<string, IceAddress>();
    const types = new Set<string>();
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try {
        pc.close();
      } catch {
        /* ya cerrada */
      }
      resolve({ supported: true, blocked: false, addresses: Array.from(found.values()), candidateTypes: Array.from(types) });
    };
    const timer = setTimeout(finish, timeoutMs);

    pc.onicecandidate = (event) => {
      if (!event.candidate || !event.candidate.candidate) {
        finish();
        return;
      }
      const parsed = parseCandidate(event.candidate.candidate);
      if (!parsed) return;
      types.add(parsed.candidateType);
      found.set(`${parsed.candidateType}|${parsed.address}`, parsed);
    };

    try {
      pc.createDataChannel('privacyprobe');
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(finish);
    } catch {
      finish();
    }
  });
}
