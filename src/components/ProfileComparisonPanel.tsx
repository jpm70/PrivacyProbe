import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, Check, CheckCircle2, Copy, Info, XCircle } from 'lucide-react';
import type { FullFingerprintReport, ProfileId, StudyId } from '../types/fingerprint';
import { ALL_DEFENSES, NO_DEFENSES, generateFingerprintReport } from '../services/fingerprintCollector';
import { estimateEntropy } from '../services/entropyModel';
import { useUi } from '../i18n';
import { attributeName, profileName, statusClass, statusLabel } from '../labels';

interface Props {
  liveReport: FullFingerprintReport | null;
  study: StudyId;
}

type Filter = 'all' | 'diffs' | 'equals';
const OPTIONS: ProfileId[] = ['real', 'incognito', 'brave', 'tor', 'custom'];

async function reportFor(p: ProfileId, live: FullFingerprintReport | null): Promise<FullFingerprintReport> {
  if (p === 'real' && live) return live;
  // cada llamada usa una semilla nueva: es como abrir otra sesión
  return generateFingerprintReport(p, p === 'custom' ? ALL_DEFENSES : NO_DEFENSES);
}

export const ProfileComparisonPanel: React.FC<Props> = ({ liveReport, study }) => {
  const { t, num } = useUi();
  const [a, setA] = useState<ProfileId>('real');
  const [b, setB] = useState<ProfileId>('incognito');
  const [ra, setRa] = useState<FullFingerprintReport | null>(null);
  const [rb, setRb] = useState<FullFingerprintReport | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([reportFor(a, liveReport), reportFor(b, liveReport)]).then(([x, y]) => {
      if (!cancelled) {
        setRa(x);
        setRb(y);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [a, b, liveReport]);

  const ea = useMemo(() => (ra ? estimateEntropy(ra, study) : null), [ra, study]);
  const eb = useMemo(() => (rb ? estimateEntropy(rb, study) : null), [rb, study]);

  const rows = useMemo(() => {
    if (!ra || !rb || !ea || !eb) return [];
    return ea.attributes.map((attrA, i) => {
      const attrB = eb.attributes[i];
      return { id: attrA.id, a: attrA, b: attrB, same: attrA.value === attrB.value };
    });
  }, [ra, rb, ea, eb]);

  const sameHash = !!ra && !!rb && ra.compositeHash === rb.compositeHash;
  const shown = rows.filter((r) => (filter === 'diffs' ? !r.same : filter === 'equals' ? r.same : true));
  const diffCount = rows.filter((r) => !r.same).length;

  const presets: Array<[ProfileId, ProfileId, string]> = [
    ['real', 'incognito', t('Real vs incógnito', 'Real vs incognito')],
    ['real', 'tor', t('Real vs Tor', 'Real vs Tor')],
    ['real', 'brave', t('Real vs Brave', 'Real vs Brave')],
    ['brave', 'tor', t('Brave vs Tor', 'Brave vs Tor')],
  ];

  const narrative = (() => {
    const pair = [a, b].sort().join('+');
    if (pair === 'incognito+real')
      return t(
        'Todos los atributos coinciden y la huella combinada es la misma: para un rastreador eres la misma persona, con o sin incógnito (en Chrome y Edge).',
        'Every attribute matches and the combined fingerprint is the same: to a tracker you are the same person, incognito or not (in Chrome and Edge).'
      );
    if (pair === 'brave+real' || pair === 'brave+incognito')
      return t(
        'El ruido cambia el hash del canvas, del audio y los núcleos en cada sesión, así que dos visitas ya no se enlazan por ahí. El resto (GPU, fuentes, pantalla, User-Agent) sigue siendo el tuyo.',
        'Noise changes the canvas, audio and core values every session, so two visits no longer link through them. The rest (GPU, fonts, screen, User-Agent) is still yours.'
      );
    if (pair === 'real+tor' || pair === 'incognito+tor')
      return t(
        'Tor no te hace «menos único» por arte de magia: te hace igual que los demás usuarios de Tor. Funciona porque son muchos (unos 2 millones al día) y todos presentan la misma huella; si cambias el tamaño de ventana o instalas extensiones, vuelves a destacar.',
        'Tor does not magically make you "less unique": it makes you identical to other Tor users. It works because there are many (about 2 million a day) presenting the same fingerprint; resize the window or add extensions and you stand out again.'
      );
    if (pair === 'brave+tor')
      return t(
        'Dos estrategias opuestas: Brave cambia de máscara en cada sesión para que no se puedan enlazar; Tor da a todos la misma máscara para que nadie destaque.',
        'Two opposite strategies: Brave changes the mask every session so visits cannot be linked; Tor gives everyone the same mask so nobody stands out.'
      );
    return t(
      'Compara qué atributos cambian. Solo los que coinciden sirven para reconocer a alguien entre las dos sesiones.',
      'Compare which attributes change. Only matching ones help recognise someone across the two sessions.'
    );
  })();

  const copySummary = async () => {
    if (!ra || !rb || !ea || !eb) return;
    const lines = [
      'PrivacyProbe — ' + t('comparativa de perfiles', 'profile comparison'),
      `A: ${profileName(a, t)} · ${num(ea.sumBits, 1)} bits · ${ra.compositeHash}`,
      `B: ${profileName(b, t)} · ${num(eb.sumBits, 1)} bits · ${rb.compositeHash}`,
      t('Huella combinada: ', 'Combined fingerprint: ') + (sameHash ? t('IGUAL', 'SAME') : t('DISTINTA', 'DIFFERENT')),
      '',
      ...rows.map((r) => `- ${attributeName(r.id, t)}: ${r.same ? '=' : '≠'}  A: ${r.a.value}  |  B: ${r.b.value}`),
      '',
      'https://unfantasmaenelsistema.github.io/PrivacyProbe/',
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* sin portapapeles */
    }
  };

  const Select = ({ value, onChange, label }: { value: ProfileId; onChange: (p: ProfileId) => void; label: string }) => (
    <label className="flex-1 min-w-0">
      <span className="block text-[11px] font-semibold text-slate-400 mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ProfileId)}
        className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
      >
        {OPTIONS.map((o) => (
          <option key={o} value={o}>
            {o === 'custom' ? t('Todas las defensas', 'All defences') : profileName(o, t)}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <section id="comparativa" className="scroll-mt-24 space-y-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
            <ArrowLeftRight className="h-4 w-4" />
            <span>{t('Comparativa lado a lado', 'Side-by-side comparison')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            {t('¿Te reconocería un rastreador en la otra sesión?', 'Would a tracker recognise you in the other session?')}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map(([x, y, label]) => (
            <button
              key={label}
              onClick={() => {
                setA(x);
                setB(y);
              }}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium border cursor-pointer ${
                a === x && b === y ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
        <Select value={a} onChange={setA} label={t('Perfil A', 'Profile A')} />
        <button
          onClick={() => {
            setA(b);
            setB(a);
          }}
          className="self-center sm:self-end rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:text-slate-100 cursor-pointer"
          aria-label={t('Intercambiar perfiles', 'Swap profiles')}
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>
        <Select value={b} onChange={setB} label={t('Perfil B', 'Profile B')} />
      </div>

      {ra && rb && ea && eb ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { r: ra, e: ea, p: a, tag: 'A' },
              { r: rb, e: eb, p: b, tag: 'B' },
            ].map(({ r, e, p, tag }) => (
              <div key={tag} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-100">{tag} · {p === 'custom' ? t('Todas las defensas', 'All defences') : profileName(p, t)}</span>
                  <span className="font-mono text-cyan-300">{num(e.sumBits, 1)} bits</span>
                </div>
                {r.canvas.dataUrl && (
                  <img src={r.canvas.dataUrl} alt={t(`Lienzo del perfil ${tag}`, `Profile ${tag} canvas`)} className="w-full rounded border border-slate-800" />
                )}
                <code className="block text-[11px] font-mono text-slate-300 break-all">{r.compositeHash}</code>
              </div>
            ))}
            <div className={`rounded-xl border p-4 flex flex-col justify-center gap-2 ${sameHash ? 'border-rose-500/50 bg-rose-950/20' : 'border-emerald-500/50 bg-emerald-950/20'}`}>
              <div className="flex items-center gap-2 text-sm font-bold">
                {sameHash ? <XCircle className="h-5 w-5 text-rose-400" /> : <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                <span className={sameHash ? 'text-rose-300' : 'text-emerald-300'}>
                  {sameHash ? t('Misma huella: enlazable', 'Same fingerprint: linkable') : t('Huella distinta', 'Different fingerprint')}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {t(`${diffCount} de ${rows.length} atributos cambian.`, `${diffCount} of ${rows.length} attributes change.`)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 text-xs text-slate-300 leading-relaxed">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-cyan-400" />
            <span>{narrative}</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1 text-[11px]">
              {(
                [
                  ['all', t(`Todos (${rows.length})`, `All (${rows.length})`)],
                  ['diffs', t(`Cambian (${diffCount})`, `Differ (${diffCount})`)],
                  ['equals', t(`Iguales (${rows.length - diffCount})`, `Same (${rows.length - diffCount})`)],
                ] as Array<[Filter, string]>
              ).map(([f, label]) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 rounded cursor-pointer ${filter === f ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-100'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={copySummary}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:text-slate-100 cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? t('Copiado', 'Copied') : t('Copiar resumen', 'Copy summary')}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full min-w-[640px] text-xs">
              <thead className="bg-slate-900/80 text-slate-400">
                <tr>
                  <th scope="col" className="text-left px-4 py-2.5 font-semibold">{t('Atributo', 'Attribute')}</th>
                  <th scope="col" className="text-left px-3 py-2.5 font-semibold">A</th>
                  <th scope="col" className="text-left px-3 py-2.5 font-semibold">B</th>
                  <th scope="col" className="text-left px-3 py-2.5 font-semibold">{t('¿Coincide?', 'Match?')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {shown.map((r) => (
                  <tr key={r.id} className="align-top">
                    <th scope="row" className="text-left px-4 py-2.5 font-medium text-slate-100">{attributeName(r.id, t)}</th>
                    {[r.a, r.b].map((x, i) => (
                      <td key={i} className="px-3 py-2.5">
                        <span className={`inline-block mb-1 px-1.5 py-0.5 rounded border text-[10px] ${statusClass(x.status)}`}>{statusLabel(x.status, t)}</span>
                        <code className="block font-mono text-[11px] text-slate-300 break-all max-w-[22rem]">{x.value}</code>
                      </td>
                    ))}
                    <td className="px-3 py-2.5">
                      {r.same ? (
                        <span className="text-rose-300 font-semibold">{t('Igual', 'Same')}</span>
                      ) : (
                        <span className="text-emerald-300 font-semibold">{t('Cambia', 'Differs')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-400" role="status">{t('Calculando…', 'Computing…')}</p>
      )}
    </section>
  );
};
