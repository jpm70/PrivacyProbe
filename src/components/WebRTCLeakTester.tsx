import React, { useState } from 'react';
import { Radio, ShieldAlert, ShieldCheck, RefreshCw, HelpCircle } from 'lucide-react';
import { detectWebRTCLeak } from '../services/webRtcDetector';
import { WebRTCLeakData } from '../types/fingerprint';

export const WebRTCLeakTester: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [leakData, setLeakData] = useState<WebRTCLeakData | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const runTest = async () => {
    setLoading(true);
    try {
      const data = await detectWebRTCLeak();
      setLeakData(data);
    } catch {
      setLeakData({
        supported: false,
        localIps: [],
        publicIps: [],
        candidateTypes: [],
        isBlockedOrMitigated: true,
        riskSummary: 'No se pudo iniciar la consulta WebRTC.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="webrtc-leak" className="px-6 py-12 border-b border-slate-800/80 bg-slate-900/30">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
              <Radio className="h-4 w-4" />
              <span>Diagnóstico de Fuga WebRTC & VPN Bypass</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Prueba de Fuga de Direcciones IP por WebRTC
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              WebRTC permite comunicaciones de audio/vídeo de baja latencia entre navegadores. Sin embargo, para
              establecer conexiones directas P2P, consulta servidores STUN enviando paquetes UDP que pueden eludir
              túneles VPN y exponer tu IP real o interfaces de red locales.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>{showExplanation ? 'Ocultar Detalle' : '¿Cómo funciona el bypass?'}</span>
            </button>

            <button
              onClick={runTest}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Consultando STUN...' : 'Ejecutar Diagnóstico WebRTC'}</span>
            </button>
          </div>
        </div>

        {showExplanation && (
          <div className="mb-8 p-4 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs text-slate-300 leading-relaxed">
            <div className="font-semibold text-cyan-300 mb-1">
              El vector de vulnerabilidad WebRTC (CVE & ICE Candidates):
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Cuando un sitio web ejecuta <code className="text-cyan-300">new RTCPeerConnection()</code>, el navegador
              recolecta todos sus "candidatos ICE" (interfaces WiFi, Ethernet, adaptadores virtuales). Muchas VPNs solo
              enrutan tráfico TCP/DNS del sistema pero no bloquean paquetes UDP directos de WebRTC, permitiendo al
              servidor descubrir la IP verdadera del cliente detrás del proxy o VPN.
            </p>
            <div className="text-[11px] text-slate-300 font-mono">
              Mitigación: En Firefox, cambia <code className="text-cyan-300">media.peerconnection.enabled</code> a false
              en about:config. En Chrome/Brave, utiliza políticas de "Disable non-proxied UDP".
            </div>
          </div>
        )}

        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent mx-auto mb-3" />
              <p className="text-xs text-slate-400">Recolectando candidatos ICE en tiempo real...</p>
            </div>
          ) : !leakData ? (
            <div className="text-center py-8">
              <Radio className="h-8 w-8 text-slate-600 mx-auto mb-3" />
              <p className="text-xs text-slate-400">
                Presiona "Ejecutar Diagnóstico WebRTC" para enviar una solicitud STUN de prueba y auditar si tu navegador expone candidatos de red.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div className="flex items-center gap-2.5">
                  {leakData.isBlockedOrMitigated ? (
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-white">Resultado de la Auditoría WebRTC</h3>
                    <span className="text-xs text-slate-400">{leakData.riskSummary}</span>
                  </div>
                </div>

                <span
                  className={`text-xs px-2.5 py-1 rounded font-semibold ${
                    leakData.isBlockedOrMitigated
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {leakData.isBlockedOrMitigated ? 'Mitigado / Sin Fuga' : 'Fuga Detectada'}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[11px] mb-1">Candidatos Locales (Interfaces LAN):</span>
                  {leakData.localIps.length > 0 ? (
                    <ul className="space-y-1">
                      {leakData.localIps.map((ip, idx) => (
                        <li key={idx} className="font-mono text-cyan-300 font-medium">
                          {ip}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-emerald-400 font-mono text-[11px]">Ninguno expuesto</span>
                  )}
                </div>

                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[11px] mb-1">Candidatos Públicos (Reflexivos STUN):</span>
                  {leakData.publicIps.length > 0 ? (
                    <ul className="space-y-1">
                      {leakData.publicIps.map((ip, idx) => (
                        <li key={idx} className="font-mono text-rose-300 font-medium">
                          {ip}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-emerald-400 font-mono text-[11px]">Ocultos por el navegador / mDNS</span>
                  )}
                </div>

                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[11px] mb-1">Tipos de Candidato Recibidos:</span>
                  {leakData.candidateTypes.length > 0 ? (
                    <span className="font-mono text-white text-[11px]">
                      {leakData.candidateTypes.join(', ')}
                    </span>
                  ) : (
                    <span className="text-slate-500 font-mono text-[11px]">Sin candidatos</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
