import React, { useState } from 'react';
import { BookMarked, ChevronDown, Cpu, Key, Layers, Scale, Search, Shield } from 'lucide-react';
import { useUi } from '../i18n';

type Category = 'math' | 'api' | 'network' | 'defence' | 'law';
type Pair = [string, string];

interface Term {
  id: string;
  category: Category;
  term: Pair;
  short: Pair;
  detail: Pair;
  example?: string;
  advice: Pair;
}

const TERMS: Term[] = [
  {
    id: 'canvas',
    category: 'api',
    term: ['Huella de canvas', 'Canvas fingerprinting'],
    short: [
      'Identificar un equipo por cómo dibuja una misma imagen en un <canvas> de HTML5.',
      'Identifying a device by how it draws the same image on an HTML5 <canvas>.',
    ],
    detail: [
      'El script dibuja texto, degradados, curvas y emojis en un lienzo invisible y lee el resultado con toDataURL() o getImageData(). Los píxeles dependen de la GPU, el controlador, el rasterizador de fuentes del sistema (DirectWrite, CoreText, FreeType) y la versión del navegador. Con el resultado se calcula un hash que se repite en cada visita.',
      'The script draws text, gradients, curves and emoji on an invisible canvas and reads it back with toDataURL() or getImageData(). Pixels depend on the GPU, driver, system font rasteriser (DirectWrite, CoreText, FreeType) and browser version. A hash of the result repeats on every visit.',
    ],
    example: 'ctx.fillText("Prueba 😀", 10, 20); hash(canvas.toDataURL())',
    advice: ['Ruido por sesión (Brave, Safari privado) o bloqueo de la lectura (Tor Browser).', 'Per-session noise (Brave, private Safari) or blocking the readback (Tor Browser).'],
  },
  {
    id: 'webrtc',
    category: 'network',
    term: ['Fuga de IP por WebRTC', 'WebRTC IP leak'],
    short: [
      'Que una web lea direcciones IP de tu equipo a través de los candidatos ICE de WebRTC.',
      'A site reading your device IP addresses through WebRTC ICE candidates.',
    ],
    detail: [
      'Para establecer llamadas, el navegador reúne las direcciones por las que se le puede alcanzar: las de sus interfaces (host) y la pública que le devuelve un servidor STUN (srflx). Hoy los navegadores ocultan la IP local tras un nombre mDNS aleatorio; el problema real aparece con VPN o proxies que solo cubren parte del tráfico (por ejemplo, solo IPv4), porque entonces WebRTC puede mostrar otra IP distinta de la que ve la web.',
      'To set up calls, the browser gathers the addresses it can be reached at: its interfaces (host) and the public one a STUN server returns (srflx). Browsers now hide the local IP behind a random mDNS name; the real problem shows up with VPNs or proxies that only cover part of the traffic (e.g. only IPv4), because WebRTC can then reveal an IP different from the one the site sees.',
    ],
    example: 'candidate:… 192.168.1.20 54321 typ host  ·  candidate:… 203.0.113.7 54321 typ srflx',
    advice: [
      'Firefox: media.peerconnection.ice.default_address_only o proxy_only. Chrome/Edge: política WebRtcIPHandling. Y una VPN que cubra IPv6.',
      'Firefox: media.peerconnection.ice.default_address_only or proxy_only. Chrome/Edge: WebRtcIPHandling policy. And a VPN that covers IPv6.',
    ],
  },
  {
    id: 'mdns',
    category: 'network',
    term: ['Candidatos mDNS (.local)', 'mDNS candidates (.local)'],
    short: ['Nombres aleatorios que sustituyen a tu IP local en WebRTC.', 'Random names that replace your local IP in WebRTC.'],
    detail: [
      'En lugar de «192.168.1.20», el navegador anuncia algo como «3f1c…-….local», que solo resuelve dentro de tu red. Así las videollamadas en la LAN siguen funcionando sin que una web lea tu IP interna.',
      'Instead of "192.168.1.20", the browser announces something like "3f1c…-….local", which only resolves inside your network. LAN video calls keep working without a site reading your internal IP.',
    ],
    advice: ['Viene activado por defecto en los navegadores actuales.', 'It is on by default in current browsers.'],
  },
  {
    id: 'shannon',
    category: 'math',
    term: ['Entropía de Shannon', 'Shannon entropy'],
    short: ['Cuánta información aporta, de media, un atributo. Se mide en bits.', 'How much information an attribute gives on average. Measured in bits.'],
    detail: [
      'Definida por Claude Shannon en 1948: H(X) = −Σ P(x)·log₂ P(x). Un atributo que reparte a la población en dos grupos iguales aporta 1 bit. Hacen falta unos 33 bits para distinguir a 8.000 millones de personas (2³³ ≈ 8.600 millones). Para medirla hay que conocer cómo se reparten los valores en una población: un solo navegador no puede calcular su propia entropía.',
      'Defined by Claude Shannon in 1948: H(X) = −Σ P(x)·log₂ P(x). An attribute splitting the population into two equal groups gives 1 bit. About 33 bits are needed to tell 8 billion people apart (2³³ ≈ 8.6 billion). Measuring it requires knowing how values are distributed in a population: a single browser cannot compute its own entropy.',
    ],
    example: 'H(X) = −Σ P(xᵢ) · log₂ P(xᵢ)     I(x) = −log₂ P(x)',
    advice: ['Reducir lo que se expone o hacer que el valor sea el mismo para muchos.', 'Expose less, or make the value the same for many people.'],
  },
  {
    id: 'normalized',
    category: 'math',
    term: ['Entropía normalizada y conjunto de anonimato', 'Normalised entropy and anonymity set'],
    short: [
      'Formas de comparar estudios de distinto tamaño y de ver con cuántos compartes huella.',
      'Ways to compare studies of different sizes and see how many people share your fingerprint.',
    ],
    detail: [
      'Con N huellas no se pueden medir más de log₂ N bits (20,98 con 2 millones). La entropía normalizada divide entre ese máximo para comparar estudios. El conjunto de anonimato es el grupo de navegadores con tu misma huella: si es de tamaño 1, eres único en esa muestra.',
      'With N fingerprints you cannot measure more than log₂ N bits (20.98 with 2 million). Normalised entropy divides by that maximum to compare studies. The anonymity set is the group of browsers with your same fingerprint: size 1 means you are unique in that sample.',
    ],
    example: 'H_norm = H(X) / log₂ N',
    advice: ['Cuanto más grande sea tu conjunto de anonimato, mejor.', 'The larger your anonymity set, the better.'],
  },
  {
    id: 'audio',
    category: 'api',
    term: ['Huella de audio', 'Audio fingerprinting'],
    short: ['Identificar el equipo por cómo procesa un sonido que nunca llega a sonar.', 'Identifying the device by how it processes a sound that is never played.'],
    detail: [
      'Con un OfflineAudioContext se genera una onda, se pasa por un compresor y se leen las muestras. Pequeñas diferencias de coma flotante entre CPU, sistema y navegador cambian el resultado.',
      'An OfflineAudioContext generates a wave, runs it through a compressor and reads the samples. Small floating-point differences between CPU, system and browser change the result.',
    ],
    example: 'new OfflineAudioContext(1, 44100, 44100) → compressor → getChannelData(0)',
    advice: ['Ruido en las muestras (Brave, Safari privado) o valor uniforme.', 'Noise in samples (Brave, private Safari) or a uniform value.'],
  },
  {
    id: 'letterboxing',
    category: 'defence',
    term: ['Letterboxing', 'Letterboxing'],
    short: ['Márgenes alrededor de la página para que el tamaño de ventana sea redondo.', 'Margins around the page so the window size is a round number.'],
    detail: [
      'El tamaño exacto de la ventana (que depende de tu monitor, tus barras y cómo la redimensionas) es muy identificativo. Tor Browser rellena con márgenes hasta un múltiplo de 200 × 100 píxeles, y muchos usuarios acaban mostrando el mismo tamaño.',
      'The exact window size (which depends on your monitor, bars and how you resize it) is very identifying. Tor Browser pads with margins to a multiple of 200 × 100 pixels, so many users end up showing the same size.',
    ],
    example: '1912 × 983 → 1800 × 900',
    advice: ['Tor Browser y Mullvad Browser. No maximices la ventana de Tor.', 'Tor Browser and Mullvad Browser. Do not maximise the Tor window.'],
  },
  {
    id: 'farbling',
    category: 'defence',
    term: ['Farbling (ruido)', 'Farbling (noise)'],
    short: ['Alterar un poco lo que leen las APIs, con una semilla distinta por web y sesión.', 'Slightly altering what APIs return, with a different seed per site and session.'],
    detail: [
      'Es el nombre que usa Brave. No bloquea Canvas, WebGL ni Audio (eso rompería webs legítimas): modifica valores de forma imperceptible para que el hash cambie entre webs y sesiones. Dentro de una misma web y sesión el valor es estable, para no romper nada.',
      'This is Brave\'s name for it. It does not block Canvas, WebGL or Audio (that would break legitimate sites): it changes values imperceptibly so the hash differs across sites and sessions. Within the same site and session the value is stable, so nothing breaks.',
    ],
    example: 'pixel[i] += rand(seed(site, session)) < 0.5 ? 1 : -1',
    advice: ['Buen equilibrio para el día a día.', 'A good balance for everyday browsing.'],
  },
  {
    id: 'clamping',
    category: 'defence',
    term: ['Fijación de hardware', 'Hardware clamping'],
    short: ['Devolver siempre el mismo valor en las APIs de hardware.', 'Always returning the same value from hardware APIs.'],
    detail: [
      'navigator.hardwareConcurrency (hilos de CPU) y navigator.deviceMemory (memoria, solo Chromium) dicen mucho de un equipo: 32 hilos y 32 GB no son comunes. La defensa devuelve un valor fijo y oculta la memoria.',
      'navigator.hardwareConcurrency (CPU threads) and navigator.deviceMemory (memory, Chromium only) say a lot about a machine: 32 threads and 32 GB are not common. The defence returns a fixed value and hides memory.',
    ],
    advice: ['Tor Browser, Mullvad Browser y Firefox con resistFingerprinting.', 'Tor Browser, Mullvad Browser and Firefox with resistFingerprinting.'],
  },
  {
    id: 'uach',
    category: 'api',
    term: ['User-Agent Client Hints', 'User-Agent Client Hints'],
    short: ['Sustituto del User-Agent en Chromium: menos datos por defecto, más solo si la web los pide.', 'Chromium\'s User-Agent replacement: less data by default, more only on request.'],
    detail: [
      'La cadena User-Agent clásica aporta entre 7 y 10 bits según el estudio. Con Client Hints, Chromium envía de serie marca y versión principal; la versión exacta del sistema o el modelo del dispositivo solo se envían si la web los pide con Accept-CH.',
      'The classic User-Agent string gives 7 to 10 bits depending on the study. With Client Hints, Chromium sends brand and major version by default; the exact OS version or device model are only sent if the site asks with Accept-CH.',
    ],
    example: 'Sec-CH-UA: "Chromium";v="128", "Not;A=Brand";v="24"',
    advice: ['Reduce la información pasiva, pero una web que la pida la obtiene.', 'Reduces passive information, but a site that asks gets it.'],
  },
  {
    id: 'eprivacy',
    category: 'law',
    term: ['Consentimiento (ePrivacy, art. 5.3)', 'Consent (ePrivacy, art. 5(3))'],
    short: ['En la UE, leer información del dispositivo para rastrear exige consentimiento.', 'In the EU, reading device information for tracking requires consent.'],
    detail: [
      'El artículo 5.3 de la Directiva ePrivacy no habla solo de cookies: cubre cualquier acceso a información del equipo del usuario. El Grupo de Trabajo del Artículo 29 lo aplicó expresamente a la huella digital (Dictamen 9/2014) y el Comité Europeo de Protección de Datos amplió ese alcance en sus Directrices 2/2023. Si además se trata como dato personal, se aplica el RGPD.',
      'Article 5(3) of the ePrivacy Directive is not only about cookies: it covers any access to information on the user\'s device. The Article 29 Working Party applied it explicitly to fingerprinting (Opinion 9/2014) and the European Data Protection Board broadened that scope in its Guidelines 2/2023. If treated as personal data, the GDPR applies too.',
    ],
    advice: ['Rechazar en el banner también debería evitar la huella. Si no, es denunciable ante la AEPD.', 'Rejecting in the banner should also prevent fingerprinting. If not, it can be reported to the data protection authority.'],
  },
];

export const GlossarySection: React.FC = () => {
  const { t, lang } = useUi();
  const pick = (p: Pair) => (lang === 'es' ? p[0] : p[1]);
  const [open, setOpen] = useState<string | null>('canvas');
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<Category | 'all'>('all');

  const cats: Array<[Category | 'all', string]> = [
    ['all', t('Todas', 'All')],
    ['math', t('Matemáticas', 'Maths')],
    ['api', t('APIs y rastreo', 'APIs and tracking')],
    ['network', t('Redes', 'Networking')],
    ['defence', t('Defensas', 'Defences')],
    ['law', t('Ley', 'Law')],
  ];
  const icon = (c: Category) => (c === 'math' ? Key : c === 'defence' ? Shield : c === 'network' ? Layers : c === 'law' ? Scale : Cpu);

  const q = query.toLowerCase();
  const list = TERMS.filter(
    (x) => (cat === 'all' || x.category === cat) && [pick(x.term), pick(x.short), pick(x.detail)].some((s) => s.toLowerCase().includes(q))
  );

  return (
    <section id="glosario" className="scroll-mt-24 space-y-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-cyan-400" />
            {t('Glosario', 'Glossary')}
          </h2>
          <p className="mt-1 text-sm text-slate-400">{t('Los conceptos de esta página, explicados.', 'The concepts on this page, explained.')}</p>
        </div>
        <label className="relative md:min-w-[260px]">
          <span className="sr-only">{t('Buscar en el glosario', 'Search the glossary')}</span>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('Buscar término…', 'Search term…')}
            className="w-full rounded-lg border border-slate-800 bg-slate-900/90 pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {cats.map(([c, label]) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`px-2.5 py-1 text-xs rounded-full border cursor-pointer ${cat === c ? 'bg-cyan-950 text-cyan-300 border-cyan-700 font-semibold' : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-100'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {list.length === 0 && (
          <p className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-slate-400 text-sm">{t('No hay coincidencias.', 'No matches.')}</p>
        )}
        {list.map((x) => {
          const isOpen = open === x.id;
          const Icon = icon(x.category);
          return (
            <div key={x.id} className={`rounded-xl border overflow-hidden ${isOpen ? 'border-cyan-500/50 bg-slate-900/80' : 'border-slate-800 bg-slate-900/40'}`}>
              <button
                onClick={() => setOpen(isOpen ? null : x.id)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-3 p-4 text-left cursor-pointer"
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/80 text-cyan-400 border border-slate-700 shrink-0">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="font-bold text-slate-100 text-sm sm:text-base block">{pick(x.term)}</span>
                    <span className="text-xs text-slate-400 block">{pick(x.short)}</span>
                  </span>
                </span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-800/80 space-y-4 text-xs text-slate-300">
                  <p className="leading-relaxed text-sm">{pick(x.detail)}</p>
                  {x.example && (
                    <pre className="p-3 rounded-lg bg-slate-950 font-mono text-[12px] text-cyan-300 border border-slate-800 overflow-x-auto whitespace-pre-wrap">{x.example}</pre>
                  )}
                  <div className="rounded-lg bg-emerald-950/20 border border-emerald-800/50 p-3 flex items-start gap-2.5">
                    <Shield className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p>{pick(x.advice)}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
