import en from './en.json';
import fi from './fi.json';
import no from './no.json';
import dk from './dk.json';

const translations: Record<string, typeof en> = { en, fi, no, dk };

export const languages = ['en', 'fi', 'no', 'dk'] as const;
export type Lang = (typeof languages)[number];

export function getTranslations(lang: Lang) {
  return translations[lang] || translations.en;
}

export function getLangFromUrl(url: URL): Lang {
  const [, , lang] = url.pathname.split('/');
  if (languages.includes(lang as Lang)) return lang as Lang;
  return 'en';
}
