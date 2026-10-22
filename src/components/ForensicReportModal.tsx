import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Download, FileJson, FileText, X } from 'lucide-react';
import type { EntropyEstimate, FullFingerprintReport } from '../types/fingerprint';
import { STUDIES, WORLD_BITS, oneInN } from '../services/entropyModel';
import { useUi } from '../i18n';
import { attributeName, bigNumber, profileName, statusLabel } from '../labels';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  report: FullFingerprintReport;
  estimate: EntropyEstimate;
}

/** Las fuentes estándar de jsPDF solo cubren WinAnsi (Latin-1 ampliado): se sustituye lo demás. */
export function pdfSafe(s: string): string {
  return s
    .replace(/[→⇒]/g, '->')
    .replace(/[−–]/g, '-')
    .replace(/≈/g, '~')
    .replace(/≠/g, '!=')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[\uFE00-\uFE0F\u200D]/g, '') // selectores de variante y uniones de emoji
    .replace(/[^\x20-\x7E\u00A0-\u00FF\u2014\u2026\u2022\u2122\u20AC]/gu, '?'); // con /u un emoji cuenta como un solo carácter
}

export const ForensicReportModal: React.FC<Props> = ({ isOpen, onClose, report, estimate }) => {
  const { t, num, lang } = useUi();
  const [tab, setTab] = useState<'summary' | 'attributes' | 'json'>('summary');
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const study = STUDIES[estimate.study];
  const n = oneInN(estimate.sumBits);
  const date = new Date(report.timestamp).toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB');

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const verdict =
    n === null
      ? t(
          `La suma de referencia (${num(estimate.sumBits, 1)} bits) supera los ${num(WORLD_BITS, 1)} bits de la población mundial: con estos datos, el navegador es probablemente único.`,
          `The reference sum (${num(estimate.sumBits, 1)} bits) exceeds the ${num(WORLD_BITS, 1)} bits of the world population: with this data the browser is probably unique.`
        )
      : t(
          `Suma de referencia de ${num(estimate.sumBits, 1)} bits: equivale a 1 entre ${bigNumber(n, t, num)} si los atributos fueran independientes.`,
          `Reference sum of ${num(estimate.sumBits, 1)} bits: equivalent to 1 in ${bigNumber(n, t, num)} if attributes were independent.`
        );
  const caveat = t(
    'La suma es una cota superior: los atributos están correlacionados y la entropía conjunta real es menor (Bacis et al., Google, 2024).',
    'The sum is an upper bound: attributes are correlated and the real joint entropy is lower (Bacis et al., Google, 2024).'
  );

  const json = JSON.stringify(
    {
      tool: 'PrivacyProbe v2.0 · https://github.com/unfantasmaenelsistema/PrivacyProbe',
      date: new Date(report.timestamp).toISOString(),
      profile: report.profileId,
      compositeHash: report.compositeHash,
      referenceStudy: { name: study.name, year: study.year, fingerprints: study.fingerprints },
      sumBits: estimate.sumBits,
      attributes: estimate.attributes,
      raw: { ...report, canvas: { ...report.canvas, dataUrl: '(omitted)' } },
    },
    null,
    2
  );

  const markdown = [
    `# PrivacyProbe — ${t('informe de huella digital', 'fingerprint report')}`,
    '',
    `- **${t('Fecha', 'Date')}:** ${date}`,
    `- **${t('Perfil', 'Profile')}:** ${profileName(report.profileId, t)}`,
    `- **${t('Huella combinada', 'Combined fingerprint')}:** \`${report.compositeHash}\``,
    `- **${t('Estudio de referencia', 'Reference study')}:** ${study.name} ${study.year} (${num(study.fingerprints)} ${t('huellas', 'fingerprints')})`,
    `- **${t('Bits expuestos (suma)', 'Exposed bits (sum)')}:** ${num(estimate.sumBits, 1)}`,
    '',
    verdict,
    '',
    `> ${caveat}`,
    '',
    `| ${t('Atributo', 'Attribute')} | ${t('Estado', 'Status')} | ${t('Valor', 'Value')} | bits |`,
    '| --- | --- | --- | --- |',
    ...estimate.attributes.map(
      (a) =>
        `| ${attributeName(a.id, t)} | ${statusLabel(a.status, t)} | \`${a.value.replace(/\|/g, '\\|')}\` | ${a.referenceBits === null ? '—' : num(a.referenceBits, 2) + (a.status === 'exposed' ? '' : ' (' + t('no cuenta', 'not counted') + ')')} |`
    ),
    '',
    `${t('Generado con', 'Generated with')} [PrivacyProbe](https://unfantasmaenelsistema.github.io/PrivacyProbe/) · [Un fantasma en el sistema](https://www.unfantasmaenelsistema.com)`,
  ].join('\n');

  const download = (content: BlobPart, type: string, name: string) => {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const stamp = new Date(report.timestamp).toISOString().slice(0, 10);

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      download(markdown, 'text/markdown', `privacyprobe-${stamp}.md`);
    }
  };

  const exportPdf = async () => {
    setBusy(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();
      const M = 16;
      let y = M;
      const text = (s: string, size = 9, style: 'normal' | 'bold' = 'normal', color: [number, number, number] = [30, 41, 59]) => {
        doc.setFont('helvetica', style);
        doc.setFontSize(size);
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(pdfSafe(s), W - 2 * M);
        for (const line of lines) {
          if (y > H - M) {
            doc.addPage();
            y = M;
          }
          doc.text(line, M, y);
          y += size * 0.45;
        }
        y += 1.5;
      };

      doc.setFillColor(10, 10, 10);
      doc.rect(0, 0, W, 26, 'F');
      doc.setTextColor(57, 255, 20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text('PrivacyProbe', M, 12);
      doc.setFontSize(9);
      doc.setTextColor(203, 213, 225);
      doc.text(pdfSafe(t('Informe de huella digital del navegador', 'Browser fingerprint report')), M, 18);
      doc.text('Un fantasma en el sistema · unfantasmaenelsistema.com', W - M, 18, { align: 'right' });
      y = 36;

      text(`${t('Fecha', 'Date')}: ${date}`);
      text(`${t('Perfil', 'Profile')}: ${profileName(report.profileId, t)}`);
      text(`${t('Huella combinada', 'Combined fingerprint')}: ${report.compositeHash}`);
      text(`${t('Estudio de referencia', 'Reference study')}: ${study.name} ${study.year} (${num(study.fingerprints)} ${t('huellas', 'fingerprints')})`);
      y += 2;
      text(`${t('Bits expuestos (suma)', 'Exposed bits (sum)')}: ${num(estimate.sumBits, 1)}`, 12, 'bold', [8, 145, 178]);
      text(verdict, 9.5, 'normal');
      text(caveat, 8.5, 'normal', [100, 116, 139]);
      y += 3;
      text(t('Atributos', 'Attributes'), 11, 'bold');
      for (const a of estimate.attributes) {
        const bits = a.referenceBits === null ? t('no medido', 'not measured') : `${num(a.referenceBits, 2)} bits${a.status === 'exposed' ? '' : ' (' + t('no cuenta', 'not counted') + ')'}`;
        text(`${attributeName(a.id, t)} · ${statusLabel(a.status, t)} · ${bits}`, 9, 'bold');
        text(a.value, 8, 'normal', [71, 85, 105]);
      }
      y += 3;
      text(
        t(
          'Fuentes: Laperdrix et al., «Browser Fingerprinting: A survey» (arXiv:1905.01051), tabla 3; Bacis et al., «Assessing Web Fingerprinting Risk» (arXiv:2403.15607).',
          'Sources: Laperdrix et al., "Browser Fingerprinting: A survey" (arXiv:1905.01051), table 3; Bacis et al., "Assessing Web Fingerprinting Risk" (arXiv:2403.15607).'
        ),
        8,
        'normal',
        [100, 116, 139]
      );
      const pages = doc.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(`${i} / ${pages} · github.com/unfantasmaenelsistema/PrivacyProbe`, W / 2, H - 8, { align: 'center' });
      }
      doc.save(`privacyprobe-${stamp}.pdf`);
    } finally {
      setBusy(false);
    }
  };

  const btn = 'inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-700 cursor-pointer disabled:opacity-50';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
          <h2 id="report-title" className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileText className="h-4 w-4 text-cyan-400" />
            {t('Informe de tu huella', 'Your fingerprint report')}
          </h2>
          <button ref={closeRef} onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 cursor-pointer" aria-label={t('Cerrar', 'Close')}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-1 border-b border-slate-800 px-5 pt-3 text-xs" role="tablist">
          {(
            [
              ['summary', t('Resumen', 'Summary')],
              ['attributes', t('Atributos', 'Attributes')],
              ['json', 'JSON'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`px-3 py-2 rounded-t-lg font-semibold cursor-pointer ${tab === id ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-slate-100'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto px-5 py-4 text-sm text-slate-300 space-y-3 flex-1">
          {tab === 'summary' && (
            <>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div><dt className="text-slate-400">{t('Fecha', 'Date')}</dt><dd className="text-slate-100 font-mono">{date}</dd></div>
                <div><dt className="text-slate-400">{t('Perfil', 'Profile')}</dt><dd className="text-slate-100">{profileName(report.profileId, t)}</dd></div>
                <div className="sm:col-span-2"><dt className="text-slate-400">{t('Huella combinada', 'Combined fingerprint')}</dt><dd className="text-cyan-300 font-mono break-all">{report.compositeHash}</dd></div>
                <div><dt className="text-slate-400">{t('Estudio', 'Study')}</dt><dd className="text-slate-100">{study.name} {study.year}</dd></div>
                <div><dt className="text-slate-400">{t('Bits expuestos (suma)', 'Exposed bits (sum)')}</dt><dd className="text-cyan-300 font-mono font-bold">{num(estimate.sumBits, 1)}</dd></div>
              </dl>
              <p>{verdict}</p>
              <p className="text-xs text-slate-400">{caveat}</p>
            </>
          )}
          {tab === 'attributes' && (
            <ul className="divide-y divide-slate-800 text-xs">
              {estimate.attributes.map((a) => (
                <li key={a.id} className="py-2">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="font-semibold text-slate-100">{attributeName(a.id, t)} · {statusLabel(a.status, t)}</span>
                    <span className="font-mono text-slate-300">{a.referenceBits === null ? t('no medido', 'not measured') : `${num(a.referenceBits, 2)} bits`}</span>
                  </div>
                  <code className="block font-mono text-[11px] text-cyan-300 break-all">{a.value}</code>
                </li>
              ))}
            </ul>
          )}
          {tab === 'json' && <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 rounded-lg p-3 overflow-x-auto">{json}</pre>}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-800 px-5 py-3">
          <button onClick={copyMarkdown} className={btn}>
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? t('Copiado', 'Copied') : t('Copiar Markdown', 'Copy Markdown')}
          </button>
          <button onClick={() => download(json, 'application/json', `privacyprobe-${stamp}.json`)} className={btn}>
            <FileJson className="h-3.5 w-3.5" />
            JSON
          </button>
          <button onClick={exportPdf} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-500 cursor-pointer disabled:opacity-50">
            <Download className="h-3.5 w-3.5" />
            {busy ? t('Generando…', 'Generating…') : 'PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};
