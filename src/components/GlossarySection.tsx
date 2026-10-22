import React, { useState } from 'react';
import { BookMarked, ChevronDown, ChevronUp, Search, Key, Shield, Layers, HelpCircle, Cpu } from 'lucide-react';

interface GlossaryTerm {
  id: string;
  term: string;
  category: 'Criptografía & Matemáticas' | 'APIs Web & Rastreo' | 'Redes' | 'Contramedidas';
  shortDefinition: string;
  detailedExplanation: string;
  exampleOrFormula?: string;
  mitigationAdvice: string;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'canvas-fingerprinting',
    term: 'Canvas Fingerprinting',
    category: 'APIs Web & Rastreo',
    shortDefinition:
      'Método de rastreo que aprovecha las variaciones microscópicas con las que cada tarjeta gráfica y sistema operativo renderizan imágenes y textos en un elemento <canvas> de HTML5.',
    detailedExplanation:
      'Cuando un navegador web dibuja primitivas 2D (círculos, curvas bézier, sombras y tipografías con antialiasing) en un lienzo invisible, el resultado depende estrechamente de la GPU instalada, la versión del controlador gráfico, el motor de rasterización de fuentes del sistema operativo (DirectWrite en Windows, CoreText en macOS, FreeType en Linux) y la precisión de coma flotante de la CPU. Al exportar ese lienzo con toDataURL() y aplicar una función hash criptográfica, se genera un identificador que permanece constante entre diferentes sesiones y pestañas.',
    exampleOrFormula:
      'ctx.fillText("Texto de prueba", 10, 20) -> canvas.toDataURL() -> SHA256 / MurmurHash3 = 9f8a3c1...',
    mitigationAdvice:
      'Inyección de ruido estocástico (Farbling de Brave) o uso de suites con uniformidad de cohorte estricta (Tor Browser).',
  },
  {
    id: 'webrtc-leak',
    term: 'WebRTC Leak (Fuga de IP por WebRTC)',
    category: 'Redes',
    shortDefinition:
      'Exposición de las direcciones IP locales y públicas reales del usuario mediante el protocolo WebRTC, eludiendo túneles VPN y servidores proxy HTTP/SOCKS.',
    detailedExplanation:
      'WebRTC (Web Real-Time Communication) es una tecnología que permite la comunicación de audio, vídeo y transferencia de archivos directa punto a punto entre navegadores sin plugins. Para establecer conexiones peer-to-peer eficaces atravesando cortafuegos y routers NAT, el navegador ejecuta el protocolo ICE (Interactive Connectivity Establishment) consultando a servidores STUN/TURN. Durante este sondeo, el navegador genera paquetes STUN vinculados a todas las interfaces físicas de red (Wi-Fi, Ethernet, adaptadores virtuales de máquina virtual), revelando la IP privada de la red de área local (LAN) e incluso la IP pública del proveedor de Internet (ISP) a pesar de que el usuario tenga una VPN activa.',
    exampleOrFormula:
      'RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com" }] }) -> onicecandidate expone candidates con IPs 192.168.1.X y 88.X.X.X',
    mitigationAdvice:
      'Deshabilitar WebRTC mediante extensiones de control de políticas, activar el enrutamiento obligatorio de WebRTC a través del proxy en Firefox (media.peerconnection.ice.proxy_only = true) o bloquear candidatos que no provengan del adaptador VPN del sistema.',
  },
  {
    id: 'shannon-entropy',
    term: 'Entropía de Shannon (Bits de Información)',
    category: 'Criptografía & Matemáticas',
    shortDefinition:
      'Medida matemática de la incertidumbre o cantidad de información promedio contenida en una variable aleatoria o atributo de huella digital.',
    detailedExplanation:
      'Formulada por Claude Shannon en 1948 en su teoría matemática de la comunicación, la entropía se expresa en bits mediante la ecuación H(X) = -∑ P(x) * log₂(P(x)). En el ámbito del fingerprinting del navegador, la entropía mide cuántos bits de incertidumbre resuelve un determinado atributo. Por ejemplo, si un atributo clasifica a los usuarios en 2 grupos equiprobables al 50%, aporta exactamente 1 bit de información. Con aproximadamente 33 bits de entropía combinada entre varios atributos independientes, es posible distinguir de manera unívoca a un individuo específico entre toda la población mundial de Internet (2³³ ≈ 8.589.934.592 personas).',
    exampleOrFormula:
      'H(X) = - ∑ [ P(x) · log₂(P(x)) ]  |  Capacidad identificadora = 2^H',
    mitigationAdvice:
      'La única defensa matemática real es reducir la entropía de los atributos (uniformidad masiva) o romper la correlación temporal entre visitas (ruido por sesión).',
  },
  {
    id: 'hardware-clamping',
    term: 'Hardware Clamping (Fijación de Parámetros de Hardware)',
    category: 'Contramedidas',
    shortDefinition:
      'Técnica de defensa en la que el navegador reporta valores genéricos predeterminados y acotados para APIs de hardware, independientemente de los recursos reales de la máquina física.',
    detailedExplanation:
      'Los navegadores modernos ofrecen APIs como navigator.hardwareConcurrency (número de núcleos o subprocesos de la CPU) y navigator.deviceMemory (cantidad de memoria RAM en Gigabytes). Un usuario con un procesador de 32 hilos y 64 GB de RAM tiene una firma de hardware sumamente inusual en comparación con la media. El Hardware Clamping intercepta estas llamadas en el motor de JavaScript y devuelve siempre una respuesta normalizada (por ejemplo, exactamente 2 núcleos y memoria omitida/indefinida), camuflando al usuario dentro de la masa demográfica más frecuente.',
    exampleOrFormula:
      'Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 2 });',
    mitigationAdvice:
      'Activado de forma nativa en Tor Browser, Mullvad Browser y Firefox con la preferencia privacy.resistFingerprinting habilitada.',
  },
  {
    id: 'audiocontext-fingerprint',
    term: 'AudioContext Fingerprinting',
    category: 'APIs Web & Rastreo',
    shortDefinition:
      'Identificación del dispositivo basada en cómo la arquitectura de la máquina procesa señales de audio sintéticas sin necesidad de emitir sonido por los altavoces.',
    detailedExplanation:
      'Utiliza la Web Audio API y el objeto OfflineAudioContext. El script inyecta ondas generadas mediante osciladores matemáticos hacia compresores dinámicos y filtros biquad. Debido a ligeras discrepancias en el cálculo de números de coma flotante entre microarquitecturas de procesadores (Intel, AMD, Apple Silicon, ARM) y la capa del controlador de audio del sistema operativo, el búfer de muestras PCM procesado resultante contiene diferencias infinitesimales medibles en las sumas de comprobación.',
    exampleOrFormula:
      'const ctx = new OfflineAudioContext(1, 44100, 44100); osc.connect(compressor); -> buffer.getChannelData(0)',
    mitigationAdvice:
      'Bloqueo de AudioContext para orígenes no confiables, o inyección de fluctuaciones aleatorias en los búferes de audio renderizados.',
  },
  {
    id: 'letterboxing',
    term: 'Letterboxing (Cuantificación de Ventana)',
    category: 'Contramedidas',
    shortDefinition:
      'Adición de márgenes visuales neutros alrededor del área de navegación para forzar al sitio web a observar únicamente tamaños de pantalla redondeados y estandarizados.',
    detailedExplanation:
      'La resolución del monitor y las dimensiones de la ventana interior (window.innerWidth y window.innerHeight) suelen ser altamente específicas, especialmente si el usuario maximiza el navegador en monitores ultrapanorámicos o con barras de herramientas personalizadas. El Letterboxing empaqueta la vista web en múltiplos fijos (por ejemplo, bloques de 200px de ancho y 100px de alto) rellenando el espacio sobrante con barras grises invisibles o neutras, de modo que cientos de miles de usuarios reportan exactamente la misma resolución al script de rastreo.',
    exampleOrFormula:
      'Ventana real de 1912x983 -> Reportada al JavaScript como 1800x900 con bandas de compensación.',
    mitigationAdvice:
      'Característica emblemática introducida por The Tor Project y disponible en navegadores derivados de Gecko.',
  },
  {
    id: 'farbling',
    term: 'Farbling (Envenenamiento Estocástico de Datos)',
    category: 'Contramedidas',
    shortDefinition:
      'Enfoque de privacidad que altera ligeramente los valores leídos por las APIs del navegador con una cantidad minúscula de ruido determinista o pseudoaleatorio por sitio y por sesión.',
    detailedExplanation:
      'Desarrollado y popularizado por Brave Software, el "farbling" no bloquea el funcionamiento de Canvas, WebGL o Audio (lo cual provocaría errores o roturas visuales en páginas legítimas como editores gráficos o juegos web). En su lugar, intercepta las funciones de lectura de píxeles o coordenadas y modifica valores individuales de forma imperceptible para los ojos u oídos humanos, pero suficiente para cambiar por completo el hash criptográfico calculado por el rastreador.',
    exampleOrFormula:
      'pixel[i] = pixel[i] + (pseudoRandom(seed + domain) > 0.5 ? 1 : -1);',
    mitigationAdvice:
      'Excelente equilibrio entre privacidad robusta y compatibilidad web funcional para navegación diaria.',
  },
  {
    id: 'user-agent-client-hints',
    term: 'User-Agent Client Hints (UA-CH)',
    category: 'APIs Web & Rastreo',
    shortDefinition:
      'Mecanismo moderno de negociación de cabeceras HTTP diseñado para reemplazar la cadena tradicional monolítica de User-Agent por solicitudes de datos granulares bajo demanda.',
    detailedExplanation:
      'Históricamente, la cabecera HTTP User-Agent enviaba de forma obligatoria en cada solicitud HTTP información exhaustiva sobre el sistema operativo, la arquitectura de la CPU y la versión exacta del navegador, otorgando entre 5 y 10 bits de entropía gratis a cualquier servidor. Con UA-CH, el navegador solo envía datos de bajo riesgo por defecto (ejemplo: marca y versión mayor del navegador). Información de alto riesgo (versión exacta del núcleo del SO, modelo de dispositivo) solo se comparte si el sitio web la solicita expresamente mediante cabeceras Accept-CH y el navegador lo aprueba.',
    exampleOrFormula:
      'Sec-CH-UA: "Chromium";v="128", "Not;A=Brand";v="24"  vs  Antiguo User-Agent de 150 caracteres.',
    mitigationAdvice:
      'Adoptado por el consorcio W3C y motores Chromium para mitigar la fuga pasiva de datos en cabeceras de red.',
  },
];

export const GlossarySection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('canvas-fingerprinting');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  const categories = ['Todas', 'Criptografía & Matemáticas', 'APIs Web & Rastreo', 'Redes', 'Contramedidas'];

  const filteredTerms = GLOSSARY_TERMS.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shortDefinition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.detailedExplanation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleTerm = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="glosario" className="scroll-mt-20 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-mono">
              07
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-cyan-400" />
              Glosario Didáctico de Ciberseguridad & Fingerprinting
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Conceptos técnicos clave explicados con rigor pedagógico para comprender la arquitectura de la privacidad en la web.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar término, fórmula o vector..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900/90 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-slate-400 font-medium">Categorías:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 text-xs rounded-full border transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-cyan-950 text-cyan-300 border-cyan-700 font-semibold'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredTerms.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-slate-400 text-sm">
            No se encontraron términos que coincidan con la búsqueda.
          </div>
        ) : (
          filteredTerms.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isOpen
                    ? 'border-cyan-500/50 bg-slate-900/80 shadow-md ring-1 ring-cyan-500/20'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => toggleTerm(item.id)}
                  className="w-full flex items-center justify-between p-4 text-left cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/80 text-cyan-400 border border-slate-700 shrink-0">
                      {item.category === 'Criptografía & Matemáticas' ? (
                        <Key className="h-4 w-4" />
                      ) : item.category === 'Contramedidas' ? (
                        <Shield className="h-4 w-4" />
                      ) : item.category === 'Redes' ? (
                        <Layers className="h-4 w-4" />
                      ) : (
                        <Cpu className="h-4 w-4" />
                      )}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-base">{item.term}</span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.shortDefinition}</p>
                    </div>
                  </div>
                  <div className="ml-4 shrink-0 text-slate-400">
                    {isOpen ? <ChevronUp className="h-5 w-5 text-cyan-400" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-800/80 space-y-4 text-xs text-slate-300">
                    <div>
                      <h4 className="font-semibold text-cyan-300 uppercase tracking-wider text-[11px] mb-1">
                        Explicación Técnica Detallada
                      </h4>
                      <p className="leading-relaxed text-slate-300 text-sm">{item.detailedExplanation}</p>
                    </div>

                    {item.exampleOrFormula && (
                      <div>
                        <h4 className="font-semibold text-slate-400 uppercase tracking-wider text-[11px] mb-1">
                          Ejemplo de Ejecución / Representación
                        </h4>
                        <pre className="p-3 rounded-lg bg-slate-950 font-mono text-[12px] text-cyan-300 border border-slate-800 overflow-x-auto">
                          {item.exampleOrFormula}
                        </pre>
                      </div>
                    )}

                    <div className="rounded-lg bg-emerald-950/20 border border-emerald-800/50 p-3 flex items-start gap-2.5">
                      <Shield className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-emerald-300 block text-[11px] uppercase tracking-wider">
                          Estrategia de Mitigación Recomendada
                        </span>
                        <p className="text-slate-300 mt-0.5">{item.mitigationAdvice}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
