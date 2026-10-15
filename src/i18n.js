import en from '#locales/en';
import es from '#locales/es';

export const CATALOGS = { en, es };
export const LANGUAGES = Object.keys(CATALOGS);
export const FALLBACK = 'en';
// The name of each language, in that language.
export const LANGUAGE_NAMES = {
  en: 'English',
  es: 'Español',
};

// The tag that `Intl` gets for a language whose bare code means another region there, such as
// `pt`, which is Brazilian Portuguese: `{ pt: 'pt-PT' }` for a European catalog.
const INTL_TAGS = {};
export const intlTag = (lang) => INTL_TAGS[lang] ?? lang;

const base = (tag) => String(tag ?? '').toLowerCase().split('-')[0];

// The language to show: `stored` when it is supported, else the first supported base language of
// `preferred` (the value of `navigator.languages`), else the fallback.
export const resolveLanguage = (preferred, stored) => {
  if (LANGUAGES.includes(stored)) return stored;
  return [preferred ?? []].flat().map(base).find((lang) => LANGUAGES.includes(lang)) ?? FALLBACK;
};

// The formats of numbers, money and dates, apart from the language of the texts (I18N-7).
export const FORMATS = ['es-ES', 'en-GB', 'en-US'];
// The name of each format, in the language of its region.
export const FORMAT_NAMES = {
  'es-ES': 'España',
  'en-GB': 'United Kingdom',
  'en-US': 'United States',
};
// The format of a language when the phone gives no region that is offered.
const LANGUAGE_FORMATS = { es: 'es-ES', en: 'en-GB' };

const regionOf = (tag) => String(tag ?? '').toUpperCase().split('-')[1] ?? '';

// The format to use (I18N-8): `stored` when it is offered, else the first tag of `preferred`
// (`navigator.languages`) whose region is the region of a format, so that `en-ES` gives `es-ES`,
// else the format of `lang`.
export const resolveFormat = (preferred, stored, lang) => {
  if (FORMATS.includes(stored)) return stored;
  for (const tag of [preferred ?? []].flat()) {
    const region = regionOf(tag);
    const format = region && FORMATS.find((one) => regionOf(one) === region);
    if (format) return format;
  }
  return LANGUAGE_FORMATS[lang] ?? LANGUAGE_FORMATS[FALLBACK];
};

// One pass, with a function: a parameter that holds `{name}` or `$&` goes in as typed.
const fill = (text, params) =>
  text.replace(/\{(\w+)\}/g, (match, name) => (Object.hasOwn(params, name) ? String(params[name]) : match));

// `t(key, params)` for one language. An entry is a text, or `{ one, other }` selected by `params.count`.
export const translator = (lang, catalogs = CATALOGS) => {
  const rules = new Intl.PluralRules(intlTag(lang));
  return (key, params = {}) => {
    const entry = catalogs[lang]?.[key] ?? catalogs[FALLBACK]?.[key];
    if (entry === undefined) return key;
    const text = typeof entry === 'string' ? entry : entry[rules.select(Number(params.count))] ?? entry.other;
    return fill(text, params);
  };
};
