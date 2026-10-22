import React, { useState } from 'react';
import { EyeOff, CheckCircle2, XCircle, Copy, Check, Lightbulb } from 'lucide-react';
import { FullFingerprintReport } from '../types/fingerprint';

interface IncognitoDebunkerProps {
  report: FullFingerprintReport;
}

export const IncognitoDebunker: React.FC<IncognitoDebunkerProps> = ({ report }) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const comparisonRows = [
    {
      factor: 'Historial de navegación en tu PC',
      incognito: true,
      description: 'No se guarda en el historial local una vez cerrada la ventana.',
    },
    {
      factor: 'Cookies y sesiones guardadas',
      incognito: true,
      description: 'Se eliminan al cerrar las pestañas privadas.',
    },
    {
      factor: 'Archivos temporales y caché',
      incognito: true,
      description: 'El disco no retiene imágenes ni scripts descargados.',
    },
    {
      factor: 'Canvas 2D Hash (Renderizado gráfico)',
      incognito: false,
      description: 'El motor gráfico y los controladores ejecutan la misma matemática sub-píxel.',
    },
    {
      factor: 'WebGL & Tarjeta Gráfica (GPU)',
      incognito: false,
      description: 'El navegador sigue exponiendo tu modelo exacto de GPU y vendor.',
    },
    {
      factor: 'Lista de Fuentes Instaladas en el SO',
      incognito: false,
      description: 'Cualquier script puede medir qué tipografías tienes en tu sistema.',
    },
    {
      factor: 'Resolución de Pantalla y DPI',
      incognito: false,
      description: 'Las dimensiones del monitor y ratio de píxeles siguen expuestas.',
    },
    {
      factor: 'Procesador (Hilos de CPU y RAM)',
      incognito: false,
      description: 'Las APIs de hardwareConcurrency y memoria siguen reportando tus especificaciones.',
    },
    {
      factor: 'Dirección IP pública y Proveedor (ISP)',
      incognito: false,
      description: 'Tu proveedor de Internet y los servidores web siguen viendo tu IP real.',
    },
  ];

  return (
    <section id="incognito" className="border-b border-slate-800/80 bg-slate-900/40 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
              <EyeOff className="h-4 w-4" />
              <span>Desmitificación Formativa</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white text-balance">
              El mito del anonimato en el Modo Incógnito
            </h2>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              El modo incógnito (o navegación privada) fue diseñado exclusivamente para proteger tu privacidad frente a
              <strong> otras personas que usen tu misma computadora física</strong>, nunca frente a las empresas en
              Internet.
            </p>
          </div>

          <div className="w-full lg:w-96 rounded-xl border border-amber-500/30 bg-amber-950/20 p-5 shadow-lg">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm mb-2">
              <Lightbulb className="h-4 w-4 shrink-0" />
              <span>Haz la prueba tú mismo</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Copia el enlace de esta aplicación, abre una <strong>Ventana de Incógnito</strong> (Ctrl+Shift+N /
              Cmd+Shift+N) y pégalo. Notarás que tu <strong>Firma Criptográfica ({report.canvas.hash.slice(0, 8)})</strong>{' '}
              sigue siendo exactamente la misma.
            </p>
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar enlace para probar en Incógnito'}</span>
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-12 border-b border-slate-800 bg-slate-900/80 px-5 py-3 text-xs font-semibold text-slate-400">
            <span className="md:col-span-4">Factor Técnico / Vector</span>
            <span className="md:col-span-2 text-center md:text-left">¿Protege Incógnito?</span>
            <span className="md:col-span-6">Realidad Técnica y Mecanismo</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {comparisonRows.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-12 items-center px-5 py-3.5 text-xs gap-2 md:gap-0 hover:bg-slate-900/30 transition-colors"
              >
                <span className="md:col-span-4 font-medium text-white flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                  {row.factor}
                </span>

                <div className="md:col-span-2 flex items-center gap-2">
                  {row.incognito ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Sí Protege</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-rose-400 font-semibold">
                      <XCircle className="h-4 w-4" />
                      <span>NO Protege</span>
                    </span>
                  )}
                </div>

                <span className="md:col-span-6 text-slate-400 leading-normal">{row.description}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="text-sm font-semibold text-white mb-4">
            Cómo un rastreador vincula tu identidad real con tu sesión de incógnito:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs font-bold text-cyan-400 block mb-1">Paso 1: Sesión Normal</span>
              <p className="text-xs text-slate-300">
                Inicias sesión en tu cuenta (ej. tienda o red social). El script de rastreo lee tu Canvas y WebGL,
                generando el hash <code className="text-cyan-300 font-mono">0x4a8f9b</code> y lo asocia con tu nombre.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs font-bold text-amber-400 block mb-1">Paso 2: Abres Incógnito</span>
              <p className="text-xs text-slate-300">
                Crees que estás anónimo y visitas un sitio sensible. Como no hay cookies, el servidor vuelve a calcular tu
                huella digital: exactamente el mismo <code className="text-amber-300 font-mono">0x4a8f9b</code>.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs font-bold text-rose-400 block mb-1">Paso 3: Fusión de Datos</span>
              <p className="text-xs text-slate-300">
                La base de datos del rastreador une de inmediato ambas sesiones. La navegación que creías privada queda
                vinculada a tu identidad real en milisegundos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
