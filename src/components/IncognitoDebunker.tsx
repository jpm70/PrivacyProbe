import React, { useState } from 'react';
import { Check, CheckCircle2, Copy, EyeOff, Lightbulb, MinusCircle, XCircle } from 'lucide-react';
import type { FullFingerprintReport } from '../types/fingerprint';
import { useUi } from '../i18n';

type Cell = 'yes' | 'no' | 'partial';

export const IncognitoDebunker: React.FC<{ report: FullFingerprintReport }> = ({ report }) => {
  const { t } = useUi();
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* sin portapapeles */
    }
  };

  // Columnas: Chrome/Edge incógnito · Firefox ventana privada · Safari navegación privada
  const rows: Array<{ factor: string; cells: [Cell, Cell, Cell]; note: string }> = [
    {
      factor: t('Historial, cookies y caché al cerrar', 'History, cookies and cache on close'),
      cells: ['yes', 'yes', 'yes'],
      note: t('Para eso está: se borran al cerrar la ventana privada.', 'That is what it is for: they are wiped when the private window closes.'),
    },
    {
      factor: t('Lectura del canvas', 'Canvas readback'),
      cells: ['no', 'partial', 'partial'],
      note: t(
        'Firefox (ventana privada) y Safari 17+ (navegación privada) añaden ruido al leer el lienzo; Chrome y Edge no.',
        'Firefox (private window) and Safari 17+ (private browsing) add noise when reading the canvas; Chrome and Edge do not.'
      ),
    },
    {
      factor: t('Modelo de GPU (WebGL)', 'GPU model (WebGL)'),
      cells: ['no', 'no', 'partial'],
      note: t('Safari mete ruido en la lectura de WebGL; el nombre de la GPU sigue visible en casi todos.', 'Safari adds noise to WebGL readback; the GPU name stays visible in nearly all of them.'),
    },
    {
      factor: t('Lectura de audio (Web Audio)', 'Audio readback (Web Audio)'),
      cells: ['no', 'no', 'partial'],
      note: t('Safari añade ruido a las muestras de audio en navegación privada.', 'Safari adds noise to audio samples in private browsing.'),
    },
    {
      factor: t('Fuentes instaladas', 'Installed fonts'),
      cells: ['no', 'partial', 'no'],
      note: t('Firefox limita en ventana privada las fuentes visibles a las del sistema.', 'In private windows Firefox limits visible fonts to system fonts.'),
    },
    {
      factor: t('Pantalla, núcleos, zona horaria', 'Screen, cores, time zone'),
      cells: ['no', 'no', 'partial'],
      note: t('Safari fija algunos tamaños de pantalla y ventana; el resto se ve igual.', 'Safari fixes some screen and window sizes; the rest look the same.'),
    },
    {
      factor: t('Tu IP pública', 'Your public IP'),
      cells: ['no', 'no', 'no'],
      note: t('Ningún modo privado la oculta: la ven la web, tu proveedor y quien gestione la red.', 'No private mode hides it: the site, your ISP and the network operator all see it.'),
    },
  ];

  const icon = (c: Cell) =>
    c === 'yes' ? (
      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
        <CheckCircle2 className="h-4 w-4" />
        {t('Sí', 'Yes')}
      </span>
    ) : c === 'partial' ? (
      <span className="inline-flex items-center gap-1 text-amber-300 font-medium">
        <MinusCircle className="h-4 w-4" />
        {t('En parte', 'Partly')}
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
        <XCircle className="h-4 w-4" />
        No
      </span>
    );

  return (
    <section id="incognito" data-tour="incognito" className="scroll-mt-24">
      <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
            <EyeOff className="h-4 w-4" />
            <span>{t('El mito del incógnito', 'The incognito myth')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 text-balance">
            {t('El modo incógnito te esconde de tu familia, no de las webs', 'Incognito hides you from your family, not from websites')}
          </h2>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            {t(
              'La navegación privada se pensó para que otra persona que use tu ordenador no vea lo que has hecho. Frente a la huella digital depende del navegador: Chrome y Edge no cambian nada; Firefox y Safari añaden ruido a algunas lecturas, pero dejan muchas otras a la vista.',
              'Private browsing was designed so that someone else using your computer cannot see what you did. Against fingerprinting it depends on the browser: Chrome and Edge change nothing; Firefox and Safari add noise to some readings but leave many others visible.'
            )}
          </p>
        </div>

        <div className="w-full lg:w-96 rounded-xl border border-amber-500/30 bg-amber-950/20 p-5">
          <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm mb-2">
            <Lightbulb className="h-4 w-4 shrink-0" />
            <span>{t('Haz la prueba', 'Try it yourself')}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            {t('Copia el enlace, ábrelo en una ventana de incógnito (Ctrl+Mayús+N) y compara el hash del canvas: ', 'Copy the link, open it in an incognito window (Ctrl+Shift+N) and compare the canvas hash: ')}
            <code className="font-mono text-amber-200">{report.canvas.hash.slice(0, 12)}</code>.{' '}
            {t(
              'En Chrome o Edge saldrá igual. En Firefox o Safari privados cambiará… pero el resto de la huella, no.',
              'In Chrome or Edge it will match. In private Firefox or Safari it will change… but the rest of the fingerprint will not.'
            )}
          </p>
          <button
            onClick={copyLink}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 px-3.5 py-2 text-xs font-medium cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? t('Enlace copiado', 'Link copied') : t('Copiar el enlace', 'Copy the link')}</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
        <table className="w-full min-w-[640px] text-xs">
          <caption className="sr-only">{t('Qué protege cada modo privado', 'What each private mode protects')}</caption>
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th scope="col" className="text-left font-semibold px-4 py-3">{t('¿Lo protege?', 'Protected?')}</th>
              <th scope="col" className="text-left font-semibold px-3 py-3">Chrome / Edge</th>
              <th scope="col" className="text-left font-semibold px-3 py-3">Firefox</th>
              <th scope="col" className="text-left font-semibold px-3 py-3">Safari 17+</th>
              <th scope="col" className="text-left font-semibold px-4 py-3">{t('Detalle', 'Detail')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {rows.map((r) => (
              <tr key={r.factor}>
                <th scope="row" className="text-left font-medium text-slate-100 px-4 py-3">{r.factor}</th>
                {r.cells.map((c, i) => (
                  <td key={i} className="px-3 py-3">{icon(c)}</td>
                ))}
                <td className="px-4 py-3 text-slate-400">{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">
        {t(
          'Fuentes: matriz de privacidad de Firefox (Mozilla) y «Private Browsing 2.0» de WebKit. Desde Safari 26 la protección avanzada también está activa fuera de la navegación privada.',
          'Sources: Firefox privacy matrix (Mozilla) and WebKit\'s "Private Browsing 2.0". Since Safari 26 advanced protection is also on outside private browsing.'
        )}
      </p>

      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h3 className="text-sm font-semibold text-slate-100 mb-4">
          {t('Cómo se une una sesión de incógnito con tu identidad', 'How an incognito session gets linked to your identity')}
        </h3>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: t('1 · Sesión normal', '1 · Normal session'),
              color: 'text-cyan-400',
              body: t(
                'Entras en tu cuenta de una tienda. Un script de terceros calcula tu huella y la guarda junto a tu correo.',
                'You log in to a shop. A third-party script computes your fingerprint and stores it next to your email.'
              ),
            },
            {
              title: t('2 · Ventana de incógnito', '2 · Incognito window'),
              color: 'text-amber-400',
              body: t(
                'Visitas otra web con el mismo script. No hay cookies, pero la huella se calcula otra vez y coincide.',
                'You visit another site with the same script. There are no cookies, but the fingerprint is recomputed and matches.'
              ),
            },
            {
              title: t('3 · Cruce', '3 · Match'),
              color: 'text-rose-400',
              body: t(
                'El proveedor del script ve dos visitas con la misma huella y las atribuye a la misma persona.',
                'The script provider sees two visits with the same fingerprint and attributes them to the same person.'
              ),
            },
          ].map((s) => (
            <li key={s.title} className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className={`text-xs font-bold block mb-1 ${s.color}`}>{s.title}</span>
              <p className="text-xs text-slate-300 leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
