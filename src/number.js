// Groups of thousands always show, four digits too: `1.000,50 €` in `es-ES` (CALC-2).
// The numbers that the user types, and the text of a result in a format (`locale`, such as
// `es-ES`), which is apart from the language of the texts (I18N-7).

// Spaces of every kind, which a phone or a copy puts between groups of digits.
const SPACES = /[\s  ]/g;
const escape = (mark) => mark.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// The marks of a format: `{ group, decimal }`, `{ group: '.', decimal: ',' }` for `es-ES`.
export const separatorsOf = (locale) => {
  const parts = new Intl.NumberFormat(locale, { useGrouping: 'always' }).formatToParts(12345.6);
  const mark = (type) => parts.find((part) => part.type === type).value;
  return { group: mark('group'), decimal: mark('decimal') };
};

// The value of a typed number in the format `locale`, or an error message (CALC-1). Spaces are
// dropped. The thousands mark of the format must split the digits in groups of three, and the
// decimal mark comes at most one time: in `es-ES`, `200.000,5` is valid and `3.2` is not.
export const parseNumber = (text, locale) => {
  const clean = String(text ?? '').replace(SPACES, '');
  if (!clean) return { error: { key: 'error.required' } };
  const { group, decimal } = separatorsOf(locale);
  const [g, d] = [escape(group), escape(decimal)];
  if (!new RegExp(`^-?[\\d${g}${d}]+$`).test(clean)) return { error: { key: 'error.notNumber' } };
  const valid = new RegExp(`^-?(\\d+|\\d{1,3}(${g}\\d{3})+)(${d}\\d+)?$`);
  if (!valid.test(clean)) return { error: { key: 'error.badGrouping', params: { group, decimal } } };
  return { value: Number(clean.replaceAll(group, '').replace(decimal, '.')) };
};

// Rounded to cents, with the half going away from zero.
export const round2 = (n) => Math.sign(n) * Math.round((Math.abs(n) + Number.EPSILON) * 100) / 100;

export const formatMoney = (n, locale) =>
  new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', useGrouping: 'always' }).format(n);

// `n` is a percentage: 3.2 is 3.2 %.
export const formatPercent = (n, locale) =>
  new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 3, useGrouping: 'always' }).format(n / 100);

// A number with no unit, with at most two decimals.
export const formatNumber = (n, locale) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2, useGrouping: 'always' }).format(n);

// A number for an input field, with the marks of the format, that parseNumber reads back.
export const formatInput = (n, locale) =>
  new Intl.NumberFormat(locale, { useGrouping: 'always', maximumFractionDigits: 6 }).format(n);
