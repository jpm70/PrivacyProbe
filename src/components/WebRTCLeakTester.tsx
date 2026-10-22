import React, { useState } from 'react';
import { HelpCircle, Radio, RefreshCw, ShieldAlert, ShieldCheck, TriangleAlert } from 'lucide-react';
import type { IpKind, WebRTCLeakData } from '../types/fingerprint';
import { compareWithHttpIp, detectWebRTCLeak, fetchHttpIps, verdict } from '../services/webRtcDetector';
import { useUi } from '../i18n';

export const WebRTCLeakTester: React.FC = () => {
  const { t } = useUi();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WebRTCLeakData | null>(null);
  const [httpIps, setHttpIps] = useState<string[] | null>(null);
  const [httpError, setHttpError] = useState(false);
  const [checkingHttp, setCheckingHttp] = useState(false);
  const [help, setHelp] = useState(false);

  const run = async () => {
    setLoading(true);
    setHttpIps(null);
    setHttpError(false);
    try {
      setData(await detectWebRTCLeak());
    } finally {
      setLoading(false);
    }
  };

  const compare = async () => {
    setCheckingHttp(true);
    setHttpError(false);
    try {
      const ips = await fetchHttpIps();
      if (ips.length === 0) setHttpError(true);
      setHttpIps(ips);
    } catch {
      setHttpError(true);
    } finally {
      setCheckingHttp(false);
    }
  };

  const kindLabel = (k: IpKind) =>
    ({
      mdns: t('nombre mDNS (IP oculta)', 'mDNS name (IP hidden)'),
      private: t('IP privada de tu red', 'private IP of your network'),
      cgnat: t('IP del NAT del operador', 'carrier NAT IP'),
      linklocal: t('IP de enlace local', 'link-local IP'),
      loopback: 'loopback',
      ula: t('IPv6 privada', 'private IPv6'),
      public: t('IP pública', 'public IP'),
      unknown: t('otra', 'other'),
    })[k];

  const v = data ? verdict(data) : null;
  const cmp = data && httpIps && httpIps.length ? compareWithHttpIp(data, httpIps) : null;

  const verdictBox = () => {
    if (!v) return null;
    const map = {
      unsupported: { icon: ShieldCheck, cls: 'text-emerald-400', title: t('WebRTC no disponible', 'WebRTC unavailable'), body: t('Tu navegador no ofrece WebRTC o lo bloquea: no puede filtrar nada por esta vía.', 'Your browser does not offer WebRTC or blocks it: nothing can leak this way.') },
      clean: { icon: ShieldCheck, cls: 'text-emerald-400', title: t('Sin direcciones expuestas', 'No addresses exposed'), body: t('Solo aparecen nombres mDNS aleatorios (o nada): el navegador oculta tu IP local, como hacen hoy Chrome, Edge, Firefox y Safari salvo que des permiso de cámara o micrófono.', 'Only random mDNS names show up (or nothing): the browser hides your local IP, as Chrome, Edge, Firefox and Safari do today unless you grant camera or microphone permission.') },
      'local-exposed': { icon: ShieldAlert, cls: 'text-rose-400', title: t('Se ve tu IP local', 'Your local IP is visible'), body: t('La web puede leer la dirección de tu equipo dentro de la red. No es grave por sí sola, pero añade bits a tu huella y describe tu red interna.', 'The site can read your machine address inside the network. Not serious by itself, but it adds bits to your fingerprint and describes your internal network.') },
      'public-ipv6-exposed': { icon: ShieldAlert, cls: 'text-rose-400', title: t('Se ve la IPv6 de tu equipo', 'Your device IPv6 is visible'), body: t('Aparece una IPv6 pública asignada a tu equipo. Si usas una VPN que solo cubre IPv4, esta dirección la delata.', 'A public IPv6 assigned to your device shows up. If you use a VPN that only covers IPv4, this address gives it away.') },
      'public-seen': { icon: TriangleAlert, cls: 'text-amber-300', title: t('STUN ve tu IP pública', 'STUN sees your public IP'), body: t('Es normal: es la misma IP que ve cualquier web. Solo es una fuga si no coincide con la que ven las webs (por ejemplo, con una VPN o proxy que solo cubre el navegador). Compruébalo abajo.', 'This is normal: it is the same IP every website sees. It is only a leak if it differs from what websites see (for example with a VPN or proxy covering only the browser). Check it below.') },
    } as const;
    const m = map[v];
    const Icon = m.icon;
    return (
      <div className="flex items-start gap-3 pb-4 border-b border-slate-800">
        <Icon className={`h-6 w-6 shrink-0 ${m.cls}`} />
        <div>
          <h3 className={`text-sm font-bold ${m.cls}`}>{m.title}</h3>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{m.body}</p>
        </div>
      </div>
    );
  };

  return (
    <section id="webrtc-leak" className="scroll-mt-24">
      <div className="flex flex-col lg:flex-row items-start justify-between gap-5 mb-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
            <Radio className="h-4 w-4" />
            <span>WebRTC</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            {t('¿Deja ver WebRTC tus direcciones IP?', 'Does WebRTC reveal your IP addresses?')}
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            {t(
              'Para llamadas y videollamadas, el navegador reúne «candidatos ICE»: las direcciones por las que se le puede alcanzar. Una web puede pedírselos sin permiso y leer lo que contienen.',
              'For calls and video calls, the browser gathers "ICE candidates": the addresses it can be reached at. A website can request them without permission and read what they contain.'
            )}
          </p>
          <p className="mt-2 text-[11px] text-slate-400">
            {t(
              'Al pulsar el botón se contacta con el servidor STUN público de Google (stun.l.google.com). Antes, nada sale de tu navegador.',
              "Pressing the button contacts Google's public STUN server (stun.l.google.com). Before that, nothing leaves your browser."
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setHelp(!help)}
            className="text-xs text-slate-400 hover:text-slate-100 px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            {help ? t('Ocultar', 'Hide') : t('¿Cómo se corrige?', 'How to fix it?')}
          </button>
          <button
            onClick={run}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-xs font-semibold text-white cursor-pointer inline-flex items-center gap-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? t('Consultando STUN…', 'Querying STUN…') : t('Probar WebRTC', 'Test WebRTC')}
          </button>
        </div>
      </div>

      {help && (
        <div className="mb-6 p-4 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs text-slate-300 leading-relaxed space-y-1.5">
          <p>
            <strong className="text-cyan-300">Firefox:</strong> {t('en about:config, ', 'in about:config, ')}
            <code className="text-cyan-300">media.peerconnection.ice.default_address_only = true</code>{' '}
            {t('(solo la interfaz principal) o', '(main interface only) or')} <code className="text-cyan-300">media.peerconnection.enabled = false</code>{' '}
            {t('(desactiva WebRTC; rompe las videollamadas).', '(disables WebRTC; breaks video calls).')}
          </p>
          <p>
            <strong className="text-cyan-300">Chrome / Edge:</strong> {t('la política', 'the policy')}{' '}
            <code className="text-cyan-300">WebRtcIPHandling = disable_non_proxied_udp</code>.
          </p>
          <p>
            <strong className="text-cyan-300">Brave:</strong> {t('Ajustes › Privacidad › «Política de gestión de IP de WebRTC».', 'Settings › Privacy › "WebRTC IP handling policy".')}
          </p>
          <p>{t('Y con VPN: que cubra IPv6 o que lo desactive; muchas fugas vienen de una VPN que solo enruta IPv4.', 'And with a VPN: make sure it covers IPv6 or disables it; many leaks come from a VPN that only routes IPv4.')}</p>
        </div>
      )}

      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 sm:p-6" aria-live="polite">
        {loading ? (
          <p className="text-center py-8 text-xs text-slate-400">{t('Recogiendo candidatos ICE…', 'Gathering ICE candidates…')}</p>
        ) : !data ? (
          <p className="text-center py-8 text-xs text-slate-400">
            {t('Pulsa «Probar WebRTC» para ver qué direcciones aparecen.', 'Press "Test WebRTC" to see which addresses show up.')}
          </p>
        ) : (
          <div className="space-y-4">
            {verdictBox()}
            {data.addresses.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-slate-400">
                    <tr>
                      <th scope="col" className="text-left py-1.5 pr-3 font-semibold">{t('Dirección', 'Address')}</th>
                      <th scope="col" className="text-left py-1.5 pr-3 font-semibold">{t('Tipo de candidato', 'Candidate type')}</th>
                      <th scope="col" className="text-left py-1.5 font-semibold">{t('Qué es', 'What it is')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {data.addresses.map((a) => (
                      <tr key={a.candidateType + a.address}>
                        <td className="py-1.5 pr-3 font-mono text-cyan-300 break-all">{a.address}</td>
                        <td className="py-1.5 pr-3 font-mono text-slate-300">
                          {a.candidateType}{' '}
                          <span className="text-slate-500">
                            ({a.candidateType === 'host' ? t('tu equipo', 'your device') : a.candidateType === 'srflx' ? t('visto por STUN', 'seen by STUN') : t('retransmisión', 'relay')})
                          </span>
                        </td>
                        <td className="py-1.5 text-slate-300">{kindLabel(a.kind)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {v === 'public-seen' && (
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-xs space-y-2">
                <p className="text-slate-300">
                  {t(
                    'Para saber si es una fuga hay que comparar con la IP que ven las webs. Esto consulta api.ipify.org (solo devuelve tu IP).',
                    'To know whether it is a leak, compare it with the IP websites see. This queries api.ipify.org (it only returns your IP).'
                  )}
                </p>
                <button
                  onClick={compare}
                  disabled={checkingHttp}
                  className="rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-3 py-1.5 font-semibold text-cyan-300 hover:text-cyan-200 disabled:opacity-50 cursor-pointer"
                >
                  {checkingHttp ? t('Comprobando…', 'Checking…') : t('Comparar con la IP que ven las webs', 'Compare with the IP websites see')}
                </button>
                {httpError && <p className="text-amber-300">{t('No se pudo consultar ipify (¿bloqueador o sin conexión?).', 'Could not reach ipify (blocker or offline?).')}</p>}
                {httpIps && httpIps.length > 0 && (
                  <p className={cmp === 'mismatch' ? 'text-rose-300 font-semibold' : 'text-emerald-300 font-semibold'}>
                    {t('Las webs ven: ', 'Websites see: ')}
                    <span className="font-mono">{httpIps.join(', ')}</span>.{' '}
                    {cmp === 'mismatch'
                      ? t('No coincide con la de STUN: WebRTC sale por otro camino y delata tu otra IP.', 'It does not match STUN: WebRTC goes out another way and reveals your other IP.')
                      : t('Coincide: WebRTC no revela nada que la web no supiera ya.', 'It matches: WebRTC reveals nothing the site did not already know.')}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
