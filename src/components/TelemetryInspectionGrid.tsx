import React, { useState } from 'react';
import { Check, Compass, Cpu, Layers, Monitor, Search, Type, Volume2, X, ZoomIn } from 'lucide-react';
import type { AttributeId, EntropyEstimate, FullFingerprintReport } from '../types/fingerprint';
import { STUDIES } from '../services/entropyModel';
import { useUi } from '../i18n';
import { fontCategory, statusClass, statusLabel } from '../labels';

interface Props {
  report: FullFingerprintReport;
  estimate: EntropyEstimate;
}

const Field: React.FC<{ label: string; children: React.ReactNode; mono?: boolean }> = ({ label, children, mono = true }) => (
  <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80 min-w-0">
    <span className="text-slate-400 block text-[11px]">{label}</span>
    <span className={`text-slate-100 ${mono ? 'font-mono' : ''} font-semibold block mt-0.5 break-words`}>{children}</span>
  </div>
);

export const TelemetryInspectionGrid: React.FC<Props> = ({ report, estimate }) => {
  const { t, num } = useUi();
  const [fontFilter, setFontFilter] = useState<'all' | 'installed' | 'missing'>('all');
  const [fontSearch, setFontSearch] = useState('');
  const [microscope, setMicroscope] = useState(false);

  const attr = (id: AttributeId) => estimate.attributes.find((a) => a.id === id)!;
  const Badge = ({ ids }: { ids: AttributeId[] }) => {
    const list = ids.map(attr);
    const known = list.filter((a) => a.referenceBits !== null);
    const status = list[0].status;
    return (
      <span className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-xs font-mono font-bold text-cyan-400">
          {known.length ? `${num(known.reduce((s, a) => s + (a.referenceBits ?? 0), 0), 1)} bits` : t('sin dato', 'no data')}
        </span>
        <span className={`px-1.5 py-0.5 rounded border text-[10px] ${statusClass(status)}`}>{statusLabel(status, t)}</span>
      </span>
    );
  };

  const fonts = report.fonts.details.filter((f) => {
    const match = f.name.toLowerCase().includes(fontSearch.toLowerCase());
    if (fontFilter === 'installed') return match && f.isInstalled;
    if (fontFilter === 'missing') return match && !f.isInstalled;
    return match;
  });

  const cardCls = 'rounded-xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 flex flex-col justify-between min-w-0';
  const head = (Icon: React.ElementType, color: string, title: string, sub: string, ids: AttributeId[]) => (
    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-100">{title}</h3>
          <span className="text-xs text-slate-400">{sub}</span>
        </div>
      </div>
      <Badge ids={ids} />
    </div>
  );
  const foot = (text: React.ReactNode) => <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">{text}</div>;

  return (
    <section id="inspeccion" data-tour="inspeccion" className="scroll-mt-24">
      <div className="mb-6 max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
          <Layers className="h-4 w-4" />
          <span>{t('Datos técnicos', 'Technical data')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
          {t('Lo que cualquier web puede leer de tu navegador', 'What any website can read from your browser')}
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          {t(
            `Cada tarjeta es una API pública de JavaScript que no pide permiso. Los bits son los que midió ${STUDIES[estimate.study].name} (${STUDIES[estimate.study].year}) para ese atributo en su población, no los de tu valor concreto.`,
            `Each card is a public JavaScript API that asks no permission. Bits are those ${STUDIES[estimate.study].name} (${STUDIES[estimate.study].year}) measured for that attribute in its population, not for your particular value.`
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className={cardCls}>
          <div>
            {head(Layers, 'bg-cyan-500/10 text-cyan-400', t('Lienzo (Canvas 2D)', 'Canvas 2D'), t('Subpíxeles, suavizado y emojis', 'Subpixels, antialiasing and emoji'), ['canvas'])}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>{t('Imagen que ha dibujado tu navegador:', 'Image your browser drew:')}</span>
                <button onClick={() => setMicroscope(!microscope)} className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 cursor-pointer">
                  <ZoomIn className="h-3.5 w-3.5" />
                  {microscope ? t('Ocultar explicación', 'Hide explanation') : t('¿Cómo funciona el ruido?', 'How does noise work?')}
                </button>
              </div>
              <div className="relative rounded-lg border border-slate-800 bg-slate-950 flex items-center justify-center p-2">
                {report.canvas.dataUrl ? (
                  <img src={report.canvas.dataUrl} alt={t('Lienzo de huella', 'Fingerprint canvas')} className="max-h-24 object-contain rounded" />
                ) : (
                  <div className="h-24 flex items-center text-xs text-slate-500">{t('Canvas no disponible', 'Canvas not available')}</div>
                )}
              </div>
              {microscope && (
                <p className="mt-3 p-3 rounded-lg bg-slate-950 border border-cyan-500/30 text-[11px] text-slate-300 leading-relaxed">
                  {t(
                    'Brave suma o resta 1 a algunos canales de color al leer el lienzo (getImageData/toDataURL), con una semilla distinta por web y por sesión. La imagen se ve igual, pero el hash cambia y deja de servir para enlazar visitas. Tor hace otra cosa: si no lo autorizas, el script recibe una imagen en blanco, igual para todos.',
                    'Brave adds or subtracts 1 from some colour channels when the canvas is read (getImageData/toDataURL), with a different seed per site and session. The image looks the same but the hash changes and no longer links visits. Tor does something else: unless you allow it, the script receives a blank image, the same for everyone.'
                  )}
                </p>
              )}
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <Field label="Hash">{report.canvas.hash}</Field>
                <Field label={t('Tiempo de dibujo', 'Draw time')}>{num(report.canvas.executionTimeMs, 2)} ms</Field>
              </div>
            </div>
          </div>
          {foot(t('El mismo navegador en una GPU Intel o NVIDIA, o con otro controlador, dibuja píxeles distintos.', 'The same browser on an Intel or NVIDIA GPU, or with another driver, draws different pixels.'))}
        </div>

        <div className={cardCls}>
          <div>
            {head(Cpu, 'bg-emerald-500/10 text-emerald-400', t('GPU (WebGL)', 'GPU (WebGL)'), t('Fabricante y modelo de la gráfica', 'Graphics vendor and model'), ['webgl'])}
            {report.webgl.supported ? (
              <div className="mt-4 space-y-2.5 text-xs">
                <Field label={t('Fabricante', 'Vendor')}>{report.webgl.unmaskedVendor || report.webgl.vendor || '—'}</Field>
                <Field label={t('Modelo (renderizador)', 'Model (renderer)')}>{report.webgl.unmaskedRenderer || report.webgl.renderer || '—'}</Field>
                <div className="grid grid-cols-2 gap-2.5">
                  <Field label={t('Versión', 'Version')}>{report.webgl.glVersion}</Field>
                  <Field label={t('Extensiones', 'Extensions')}>{report.webgl.extensionsCount}</Field>
                </div>
                <Field label="Hash">{report.webgl.hash}</Field>
              </div>
            ) : (
              <p className="mt-4 text-xs text-slate-400">{t('WebGL no está disponible o está bloqueado.', 'WebGL is unavailable or blocked.')}</p>
            )}
          </div>
          {foot(
            t(
              'La extensión WEBGL_debug_renderer_info da el modelo real de la gráfica. Firefox con resistFingerprinting y Tor responden simplemente «Mozilla».',
              'The WEBGL_debug_renderer_info extension gives the real graphics model. Firefox with resistFingerprinting and Tor simply answer "Mozilla".'
            )
          )}
        </div>

        <div className={cardCls}>
          <div>
            {head(
              Type,
              'bg-purple-500/10 text-purple-400',
              t('Fuentes instaladas', 'Installed fonts'),
              t(`${report.fonts.detectedCount} de ${report.fonts.testedCount} detectadas`, `${report.fonts.detectedCount} of ${report.fonts.testedCount} detected`),
              ['fonts']
            )}
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <label className="relative flex-1">
                <span className="sr-only">{t('Buscar fuente', 'Search font')}</span>
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  value={fontSearch}
                  onChange={(e) => setFontSearch(e.target.value)}
                  placeholder={t('Buscar fuente…', 'Search font…')}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </label>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                {(
                  [
                    ['all', t('Todas', 'All')],
                    ['installed', t('Detectadas', 'Detected')],
                    ['missing', t('Ausentes', 'Missing')],
                  ] as const
                ).map(([f, label]) => (
                  <button
                    key={f}
                    onClick={() => setFontFilter(f)}
                    className={`px-2.5 py-1 rounded cursor-pointer ${fontFilter === f ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-100'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <ul className="mt-3 max-h-52 overflow-y-auto pr-1 space-y-1.5">
              {fonts.map((f) => (
                <li key={f.name} className="flex items-center justify-between px-3 py-1.5 rounded bg-slate-950/70 border border-slate-800/80 text-xs">
                  <span className="flex items-center gap-2">
                    {f.isInstalled ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <X className="h-3.5 w-3.5 text-slate-600" />}
                    <span className={f.isInstalled ? 'text-slate-100 font-medium' : 'text-slate-500'} style={f.isInstalled ? { fontFamily: `"${f.name}", sans-serif` } : undefined}>
                      {f.name}
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-500">{fontCategory(f.category, t)}</span>
                </li>
              ))}
            </ul>
          </div>
          {foot(
            t(
              'Calibri o Aptos delatan Microsoft Office; Cascadia Code, Windows Terminal o Visual Studio. Los estudios enumeraban la lista completa de fuentes; aquí se prueban 39.',
              'Calibri or Aptos reveal Microsoft Office; Cascadia Code, Windows Terminal or Visual Studio. The studies enumerated the full font list; here 39 are tested.'
            )
          )}
        </div>

        <div className={cardCls}>
          <div>
            {head(Monitor, 'bg-blue-500/10 text-blue-400', t('Pantalla', 'Screen'), t('Resolución, color y escala', 'Resolution, colour and scale'), ['screen'])}
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <Field label={t('Resolución', 'Resolution')}>{report.display.screenWidth} × {report.display.screenHeight}</Field>
              <Field label={t('Área disponible', 'Available area')}>{report.display.availWidth} × {report.display.availHeight}</Field>
              <Field label={t('Escala (devicePixelRatio)', 'Scale (devicePixelRatio)')}>{report.display.devicePixelRatio}x</Field>
              <Field label={t('Profundidad de color', 'Colour depth')}>{report.display.colorDepth} bit</Field>
              <Field label={t('Ventana', 'Window')}>{report.display.windowInnerWidth} × {report.display.windowInnerHeight}</Field>
            </div>
          </div>
          {foot(
            t(
              'La diferencia entre la altura de la pantalla y la disponible delata el tamaño de tu barra de tareas. Tor redondea la ventana a múltiplos de 200 × 100 (letterboxing).',
              'The difference between screen height and available height reveals your taskbar size. Tor rounds the window to multiples of 200 × 100 (letterboxing).'
            )
          )}
        </div>

        <div className={cardCls}>
          <div>
            {head(Volume2, 'bg-rose-500/10 text-rose-400', t('Hardware y audio', 'Hardware and audio'), t('Núcleos, memoria, pantalla táctil y Web Audio', 'Cores, memory, touch screen and Web Audio'), ['hardware', 'audio'])}
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <Field label={t('Hilos de CPU', 'CPU threads')}>{report.hardware.hardwareConcurrency ?? t('no expuesto', 'not exposed')}</Field>
              <Field label={t('Memoria (deviceMemory)', 'Memory (deviceMemory)')}>
                {report.hardware.deviceMemory ? `${report.hardware.deviceMemory} GB` : t('no expuesta', 'not exposed')}
              </Field>
              <Field label={t('Puntos táctiles', 'Touch points')}>{report.hardware.maxTouchPoints}</Field>
              <Field label={t('Hash de audio', 'Audio hash')}>{report.audio.supported ? report.audio.hash : t('no disponible', 'not available')}</Field>
            </div>
          </div>
          {foot(
            t(
              'deviceMemory solo existe en navegadores Chromium y se redondea. Ninguno de los tres estudios midió estos atributos, así que no entran en la suma, aunque también distinguen.',
              'deviceMemory only exists in Chromium browsers and is rounded. None of the three studies measured these attributes, so they are not in the sum, although they also distinguish.'
            )
          )}
        </div>

        <div className={cardCls}>
          <div>
            {head(Compass, 'bg-teal-500/10 text-teal-400', t('Entorno', 'Environment'), t('User-Agent, idiomas, zona horaria', 'User-Agent, languages, time zone'), ['userAgent', 'language', 'timezone', 'platform', 'dnt'])}
            <div className="mt-4 space-y-2.5 text-xs">
              <Field label="User-Agent">
                <span className="font-normal text-[11px] break-all">{report.environment.userAgent}</span>
              </Field>
              <div className="grid grid-cols-2 gap-2.5">
                <Field label={t('Idiomas', 'Languages')}>{report.environment.languages.join(', ')}</Field>
                <Field label={t('Zona horaria', 'Time zone')}>{report.environment.timezone}</Field>
                <Field label={t('Plataforma', 'Platform')}>{report.hardware.platform || '—'}</Field>
                <Field label="Do Not Track">{report.environment.doNotTrack ?? t('sin valor', 'unset')}</Field>
                <Field label="Global Privacy Control">
                  {report.environment.globalPrivacyControl === null ? t('no soportado', 'not supported') : String(report.environment.globalPrivacyControl)}
                </Field>
              </div>
            </div>
          </div>
          {foot(
            t(
              'Do Not Track nunca obligó a nadie y ya está en desuso; Global Privacy Control sí tiene efecto legal en algunos estados de EE. UU. (como California).',
              'Do Not Track never bound anyone and is deprecated; Global Privacy Control does have legal effect in some US states (such as California).'
            )
          )}
        </div>
      </div>
    </section>
  );
};
