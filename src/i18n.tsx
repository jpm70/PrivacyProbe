import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Lang = 'es' | 'en';
export type Theme = 'dark' | 'light';

export const STORAGE = {
  lang: 'pp_lang',
  theme: 'pp_theme',
  contrast: 'pp_contrast',
  tour: 'pp_tour_done',
  study: 'pp_study',
} as const;

export function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* modo privado o almacenamiento bloqueado: no pasa nada */
  }
}

interface UiContext {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
  /** Elige el texto según el idioma: t('Hola', 'Hello'). */
  t: (es: string, en: string) => string;
  /** Formatea números con el separador del idioma. */
  num: (n: number, digits?: number) => string;
}

const Ctx = createContext<UiContext | null>(null);

function initialLang(): Lang {
  const saved = readStorage(STORAGE.lang);
  if (saved === 'es' || saved === 'en') return saved;
  // inglés solo si el navegador está en inglés; el resto, español (la casa es hispanohablante)
  return typeof navigator !== 'undefined' && /^en\b/i.test(navigator.language) ? 'en' : 'es';
}

function initialTheme(): Theme {
  const saved = readStorage(STORAGE.theme);
  if (saved === 'dark' || saved === 'light') return saved;
  return 'dark';
}

export const UiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [highContrast, setHighContrastState] = useState<boolean>(() => readStorage(STORAGE.contrast) === '1');

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title =
      lang === 'es'
        ? 'PrivacyProbe · Huella digital del navegador | Un fantasma en el sistema'
        : 'PrivacyProbe · Browser fingerprint | Un fantasma en el sistema';
  }, [lang]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  const value = useMemo<UiContext>(
    () => ({
      lang,
      setLang: (l) => {
        setLangState(l);
        writeStorage(STORAGE.lang, l);
      },
      theme,
      setTheme: (th) => {
        setThemeState(th);
        writeStorage(STORAGE.theme, th);
      },
      highContrast,
      setHighContrast: (v) => {
        setHighContrastState(v);
        writeStorage(STORAGE.contrast, v ? '1' : '0');
      },
      t: (es, en) => (lang === 'es' ? es : en),
      num: (n, digits = 0) =>
        n.toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB', {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        }),
    }),
    [lang, theme, highContrast]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useUi(): UiContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useUi fuera de UiProvider');
  return ctx;
}

/** Ruta a un archivo de public/ que funciona también en GitHub Pages (subcarpeta). */
export const asset = (file: string) => `${import.meta.env.BASE_URL}${file}`;

export const BRAND = {
  web: 'https://www.unfantasmaenelsistema.com',
  academy: 'https://ghostacademy.unfantasmaenelsistema.com',
  repo: 'https://github.com/unfantasmaenelsistema/PrivacyProbe',
  org: 'https://github.com/unfantasmaenelsistema',
};
