/**
 * Detector de fuga de IPs y candidatos ICE mediante WebRTC
 */
import { WebRTCLeakData } from '../types/fingerprint';

export async function detectWebRTCLeak(): Promise<WebRTCLeakData> {
  const RTCPC =
    window.RTCPeerConnection ||
    (window as unknown as { webkitRTCPeerConnection?: typeof RTCPeerConnection }).webkitRTCPeerConnection ||
    (window as unknown as { mozRTCPeerConnection?: typeof RTCPeerConnection }).mozRTCPeerConnection;

  if (!RTCPC) {
    return {
      supported: false,
      localIps: [],
      publicIps: [],
      candidateTypes: [],
      isBlockedOrMitigated: true,
      riskSummary: 'WebRTC está inhabilitado o no está soportado en este navegador.',
    };
  }

  return new Promise<WebRTCLeakData>((resolve) => {
    const localIps = new Set<string>();
    const publicIps = new Set<string>();
    const candidateTypes = new Set<string>();
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        try {
          pc.close();
        } catch {
          // Ignore
        }
        finish();
      }
    }, 2500);

    let pc: RTCPeerConnection;
    try {
      pc = new RTCPC({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
    } catch {
      clearTimeout(timeout);
      return resolve({
        supported: true,
        localIps: [],
        publicIps: [],
        candidateTypes: [],
        isBlockedOrMitigated: true,
        riskSummary: 'La creación de RTCPeerConnection fue bloqueada por políticas del navegador.',
      });
    }

    pc.onicecandidate = (event) => {
      if (!event || !event.candidate || !event.candidate.candidate) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          try {
            pc.close();
          } catch {
            // Ignore
          }
          finish();
        }
        return;
      }

      const candidateStr = event.candidate.candidate;
      const parts = candidateStr.split(' ');
      const ip = parts[4];
      const type = parts[7];

      if (type) candidateTypes.add(type);

      if (ip) {
        if (
          ip.endsWith('.local') ||
          ip.startsWith('192.168.') ||
          ip.startsWith('10.') ||
          ip.startsWith('172.16.') ||
          ip.startsWith('172.31.')
        ) {
          localIps.add(ip);
        } else if (ip.includes('.') || ip.includes(':')) {
          publicIps.add(ip);
        }
      }
    };

    function finish() {
      const localList = Array.from(localIps);
      const publicList = Array.from(publicIps);
      const typesList = Array.from(candidateTypes);

      const hasLocalLeak = localList.some((ip) => !ip.endsWith('.local'));
      const hasPublicLeak = publicList.length > 0;

      let riskSummary = 'WebRTC activo con candidatos mDNS estandarizados.';
      if (hasLocalLeak || hasPublicLeak) {
        riskSummary = 'Vulnerable a correlación de interfaz de red directa o salto de VPN.';
      } else if (localList.length === 0 && publicList.length === 0) {
        riskSummary = 'Protegido / Mitigado (No se expusieron IPs en los candidatos ICE iniciales).';
      }

      resolve({
        supported: true,
        localIps: localList,
        publicIps: publicList,
        candidateTypes: typesList,
        isBlockedOrMitigated: !hasLocalLeak && !hasPublicLeak,
        riskSummary,
      });
    }

    try {
      pc.createDataChannel('privacy-probe-channel');
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => {
          clearTimeout(timeout);
          finish();
        });
    } catch {
      clearTimeout(timeout);
      finish();
    }
  });
}
