import React, { useState } from 'react';
import {
  Layers,
  Cpu,
  Monitor,
  Type,
  Volume2,
  Compass,
  Check,
  X,
  Search,
  ZoomIn,
} from 'lucide-react';
import { FullFingerprintReport } from '../types/fingerprint';

interface TelemetryInspectionGridProps {
  report: FullFingerprintReport;
}

export const TelemetryInspectionGrid: React.FC<TelemetryInspectionGridProps> = ({ report }) => {
  const [fontFilter, setFontFilter] = useState<'all' | 'installed' | 'missing'>('all');
  const [fontSearch, setFontSearch] = useState('');
  const [showCanvasMicroscope, setShowCanvasMicroscope] = useState(false);

  const filteredFonts = report.fonts.details.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(fontSearch.toLowerCase());
    if (fontFilter === 'installed') return matchesSearch && f.isInstalled;
    if (fontFilter === 'missing') return matchesSearch && !f.isInstalled;
    return matchesSearch;
  });

  return (
    <section id="inspeccion" className="px-6 py-12 border-b border-slate-800/80 bg-slate-950">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
            <Layers className="h-4 w-4" />
            <span>Inspección Técnica en Profundidad</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Datos técnicos expuestos por tu navegador
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Cada bloque a continuación representa un canal de información que cualquier sitio web o script de terceros
            puede consultar de forma silenciosa mediante APIs públicas de JavaScript.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Canvas 2D Fingerprint */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Huella Gráfica de Canvas (2D)</h3>
                    <span className="text-xs text-slate-400">Renderizado de subpíxeles y antialiasing</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400">8.6 bits</span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Lienzo renderizado por tu GPU:</span>
                  <button
                    onClick={() => setShowCanvasMicroscope(!showCanvasMicroscope)}
                    className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                    <span>{showCanvasMicroscope ? 'Ocultar Microscopio' : 'Microscopio de Píxeles'}</span>
                  </button>
                </div>

                <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-slate-950 flex items-center justify-center p-2">
                  {report.canvas.dataUrl ? (
                    <img
                      src={report.canvas.dataUrl}
                      alt="Canvas Fingerprint Render"
                      className="max-h-24 object-contain rounded"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-24 w-full flex items-center justify-center text-xs text-slate-500">
                      Lienzo no soportado
                    </div>
                  )}

                  {report.canvas.isPoisoned && (
                    <div className="absolute top-2 right-2 bg-amber-500/90 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      Ruido Activo (Farbling)
                    </div>
                  )}
                </div>

                {showCanvasMicroscope && (
                  <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-cyan-500/30 text-xs">
                    <div className="font-semibold text-cyan-300 mb-1">
                      ¿Cómo funciona la mitigación por ruido (Farbling)?
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Navegadores como Brave inyectan una variación estocástica de ±1 en los canales RGB de píxeles
                      seleccionados al invocar <code className="text-cyan-300">getImageData()</code> o <code className="text-cyan-300">toDataURL()</code>.
                      El ojo humano percibe la misma imagen, pero la función de dispersión (hash criptográfico) cambia
                      por completo en cada nueva sesión, imposibilitando el rastreo a largo plazo.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Hash del Lienzo:</span>
                  <code className="text-cyan-300 font-mono font-semibold block truncate mt-0.5">
                    {report.canvas.hash}
                  </code>
                </div>
                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Tiempo de Render:</span>
                  <span className="text-white font-mono font-semibold block mt-0.5">
                    {report.canvas.executionTimeMs} ms
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              Incluso con el mismo navegador, una gráfica Intel vs NVIDIA o controladores distintos generan valores de píxel divergentes.
            </div>
          </div>

          {/* Card 2: WebGL & GPU */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">WebGL & Tarjeta Gráfica</h3>
                    <span className="text-xs text-slate-400">Identificación por hardware de vídeo 3D</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">7.8 bits</span>
              </div>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400">Fabricante de GPU (Vendor):</span>
                  <span className="text-white font-mono font-semibold truncate max-w-xs">
                    {report.webgl.unmaskedVendor}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400">Modelo Renderizador:</span>
                  <span className="text-cyan-300 font-mono font-semibold truncate max-w-xs">
                    {report.webgl.unmaskedRenderer}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
                    <span className="text-slate-400 block text-[11px]">Versión de Shaders:</span>
                    <span className="text-white font-mono block mt-0.5 truncate">{report.webgl.glVersion}</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
                    <span className="text-slate-400 block text-[11px]">Extensiones WebGL:</span>
                    <span className="text-white font-mono block mt-0.5">{report.webgl.extensionsCount} soportadas</span>
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400">Hash WebGL Shaders:</span>
                  <code className="text-emerald-300 font-mono font-semibold">{report.webgl.hash}</code>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              La extensión <code className="text-slate-300 font-mono">WEBGL_debug_renderer_info</code> revela la marca y
              modelo físico de tu chip gráfico. Tor Browser la bloquea completamente.
            </div>
          </div>

          {/* Card 3: System Fonts Catalog */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                    <Type className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Enumeración de Fuentes Locales</h3>
                    <span className="text-xs text-slate-400">
                      {report.fonts.detectedCount} de {report.fonts.testedCount} tipografías detectadas
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-purple-400">
                  {report.entropyBreakdown.find((b) => b.id === 'fonts')?.entropyBits.toFixed(1) || '8.2'} bits
                </span>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={fontSearch}
                    onChange={(e) => setFontSearch(e.target.value)}
                    placeholder="Buscar fuente..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setFontFilter('all')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      fontFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Todas ({report.fonts.testedCount})
                  </button>
                  <button
                    onClick={() => setFontFilter('installed')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      fontFilter === 'installed' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Detectadas ({report.fonts.detectedCount})
                  </button>
                  <button
                    onClick={() => setFontFilter('missing')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      fontFilter === 'missing' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Ausentes
                  </button>
                </div>
              </div>

              <div className="mt-3 max-h-48 overflow-y-auto pr-1 space-y-1.5">
                {filteredFonts.slice(0, 20).map((font) => (
                  <div
                    key={font.name}
                    className="flex items-center justify-between px-3 py-1.5 rounded bg-slate-950/70 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {font.isInstalled ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                      )}
                      <span
                        className={font.isInstalled ? 'text-white font-medium' : 'text-slate-500'}
                        style={font.isInstalled ? { fontFamily: `"${font.name}", sans-serif` } : undefined}
                      >
                        {font.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">{font.category}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              La presencia de fuentes como Calibri o Cascadia Code revela la instalación de Microsoft Office o Windows Terminal.
            </div>
          </div>

          {/* Card 4: Screen & Display Geometry */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Monitor className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Geometría de Pantalla y DPI</h3>
                    <span className="text-xs text-slate-400">Resolución, ventana y escala HiDPI</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-blue-400">4.8 bits</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Resolución de Monitor:</span>
                  <span className="text-white font-mono font-semibold block mt-0.5">
                    {report.display.screenWidth} x {report.display.screenHeight} px
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Área Disponible:</span>
                  <span className="text-white font-mono font-semibold block mt-0.5">
                    {report.display.availWidth} x {report.display.availHeight} px
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Ratio de Píxeles (HiDPI):</span>
                  <span className="text-white font-mono font-semibold block mt-0.5">
                    {report.display.devicePixelRatio}x
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Profundidad de Color:</span>
                  <span className="text-white font-mono font-semibold block mt-0.5">
                    {report.display.colorDepth} bits por píxel
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-white">Mitigación por Letterboxing (Estilo Tor):</span>
                  <span className="text-[11px] text-slate-400">
                    {report.display.isLetterboxed ? 'Activo (1000x1000)' : 'Inactivo (Resolución Natural)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Para evitar que los rastreadores deduzcan el tamaño exacto de tu ventana maximizada, Tor Browser
                  añade barras grises automáticas alrededor del contenido para forzar una resolución fija estándar compartida.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              La diferencia entre screen.height y availHeight revela el grosor exacto de tu barra de tareas.
            </div>
          </div>

          {/* Card 5: Hardware APIs & Audio */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                    <Volume2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Hardware, Audio & Hilos de CPU</h3>
                    <span className="text-xs text-slate-400">Rastreo por capacidades de procesamiento</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-rose-400">4.5 bits</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Hilos Lógicos (CPU):</span>
                  <span className="text-cyan-300 font-mono font-semibold block mt-0.5">
                    {report.hardware.hardwareConcurrency} núcleos lógicos
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Memoria Aproximada:</span>
                  <span className="text-white font-mono font-semibold block mt-0.5">
                    {report.hardware.deviceMemory ? `${report.hardware.deviceMemory} GB` : 'No reportada'}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Puntos Táctiles (Touch):</span>
                  <span className="text-white font-mono font-semibold block mt-0.5">
                    {report.hardware.maxTouchPoints > 0
                      ? `${report.hardware.maxTouchPoints} (Pantalla táctil)`
                      : '0 (Solo ratón/teclado)'}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Hash AudioContext:</span>
                  <code className="text-rose-300 font-mono font-semibold block mt-0.5 truncate">
                    {report.audio.hash}
                  </code>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              El filtro DynamicsCompressor de Web Audio genera sumas distintas según la arquitectura matemática de la CPU.
            </div>
          </div>

          {/* Card 6: Software, Platform & Locale */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                    <Compass className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Identificadores de Entorno y Zona Horaria</h3>
                    <span className="text-xs text-slate-400">User Agent, huso horario y preferencias</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-teal-400">5.3 bits</span>
              </div>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px] mb-1">User-Agent:</span>
                  <code className="text-slate-200 font-mono text-[11px] block break-all">
                    {report.environment.userAgent}
                  </code>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
                    <span className="text-slate-400 block text-[11px]">Zona Horaria:</span>
                    <span className="text-white font-mono block mt-0.5">{report.environment.timezone}</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
                    <span className="text-slate-400 block text-[11px]">Desfase UTC:</span>
                    <span className="text-white font-mono block mt-0.5">
                      {report.environment.timezoneOffset} minutos
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
                    <span className="text-slate-400 block text-[11px]">Idioma Principal:</span>
                    <span className="text-white font-mono block mt-0.5">{report.environment.language}</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
                    <span className="text-slate-400 block text-[11px]">Do Not Track (DNT):</span>
                    <span className="text-white font-mono block mt-0.5">
                      {report.environment.doNotTrack || 'No especificado (Ignorado)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              La cabecera Do Not Track es voluntaria y carece de fuerza técnica vinculante para los rastreadores.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
