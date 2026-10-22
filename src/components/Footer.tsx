import React from 'react';
import { BookOpen, ExternalLink, Github, GraduationCap, Lock } from 'lucide-react';
import { BRAND, asset, useUi } from '../i18n';

export const Footer: React.FC = () => {
  const { t } = useUi();
  const link = 'inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300';

  return (
    <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/80 pt-10 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <a href={BRAND.web} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
            <img src={asset('icono.png')} alt="" className="h-12 w-12 object-contain" />
            <span>
              <span className="text-base font-bold text-slate-100 block">Un fantasma en el sistema</span>
              <span className="text-xs text-slate-400">{t('Ciberseguridad y privacidad, explicadas', 'Cybersecurity and privacy, explained')}</span>
            </span>
          </a>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <a href={BRAND.web} target="_blank" rel="noopener noreferrer" className={link}>
              unfantasmaenelsistema.com <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a href={BRAND.academy} target="_blank" rel="noopener noreferrer" className={link}>
              <GraduationCap className="h-3.5 w-3.5" /> Ghost Academy
            </a>
            <a href={BRAND.repo} target="_blank" rel="noopener noreferrer" className={link}>
              <Github className="h-3.5 w-3.5" /> {t('Código fuente', 'Source code')}
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-400 leading-relaxed">
          <div>
            <h3 className="text-slate-100 font-semibold mb-2 flex items-center gap-1.5 text-sm">
              <Lock className="h-4 w-4 text-emerald-400" />
              {t('Privacidad de esta página', 'Privacy of this page')}
            </h3>
            <p>
              {t(
                'Todo se calcula en tu navegador y no se envía a ningún servidor. Solo hay dos conexiones externas, y únicamente si pulsas sus botones: el servidor STUN de Google en la prueba de WebRTC y api.ipify.org si comparas tu IP. No hay analítica, cookies ni fuentes de terceros.',
                'Everything is computed in your browser and sent to no server. There are only two external connections, and only if you press their buttons: Google\'s STUN server in the WebRTC test and api.ipify.org if you compare your IP. There are no analytics, cookies or third-party fonts.'
              )}
            </p>
          </div>
          <div>
            <h3 className="text-slate-100 font-semibold mb-2 flex items-center gap-1.5 text-sm">
              <BookOpen className="h-4 w-4 text-cyan-400" />
              {t('De dónde salen los bits', 'Where the bits come from')}
            </h3>
            <p>
              {t('Tabla 3 de ', 'Table 3 of ')}
              <a href="https://arxiv.org/abs/1905.01051" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                Laperdrix, Bielova, Baudry y Avoine, «Browser Fingerprinting: A survey»
              </a>{' '}
              {t(
                '(datos de Panopticlick 2010, AmIUnique 2016 e Hiding in the Crowd 2018). Sobre la correlación entre atributos: ',
                '(data from Panopticlick 2010, AmIUnique 2016 and Hiding in the Crowd 2018). On correlation between attributes: '
              )}
              <a href="https://arxiv.org/abs/2403.15607" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                Bacis et al., Google, 2024
              </a>
              .
            </p>
          </div>
          <div>
            <h3 className="text-slate-100 font-semibold mb-2 text-sm">{t('Para clase', 'For the classroom')}</h3>
            <p>
              {t(
                'Material libre para alumnos, docentes y curiosos de la privacidad. Úsalo, modifícalo y compártelo: es software libre con licencia MIT.',
                'Free material for students, teachers and privacy enthusiasts. Use it, modify it and share it: it is free software under the MIT licence.'
              )}
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Un fantasma en el sistema · {t('Licencia MIT', 'MIT licence')}</p>
          <p className="font-mono">PrivacyProbe v2.0</p>
        </div>
      </div>
    </footer>
  );
};
