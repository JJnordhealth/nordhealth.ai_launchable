import en from './en.json';
import fi from './fi.json';

const translations: Record<string, typeof en> = { en, fi };

export const languages = ['en', 'fi'] as const;
export type Lang = (typeof languages)[number];

export function getTranslations(lang: Lang) {
  return translations[lang] || translations.en;
}

export function getLangFromUrl(url: URL): Lang {
  const [, , lang] = url.pathname.split('/');
  if (languages.includes(lang as Lang)) return lang as Lang;
  return 'en';
}
