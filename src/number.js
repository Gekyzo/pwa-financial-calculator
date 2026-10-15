// The numbers that the user types, and the text of a result in a format (`locale`, such as
// `es-ES`), which is apart from the language of the texts (I18N-7).

// Spaces of every kind, which a phone or a copy puts between groups of digits.
const SPACES = /[\s  ]/g;
const PLAIN = /^-?\d+(\.\d+)?$/;

// The value of a typed number, or an error message. With both marks, the last one is the decimal
// mark and the other groups the digits; a mark that comes two or more times groups the digits; a
// single mark is the decimal mark. So `3,2`, `3.2`, `200 000` and `200.000,50` are all valid.
export const parseNumber = (text) => {
  const clean = String(text ?? '').replace(SPACES, '');
  if (!clean) return { error: { key: 'error.required' } };
  const last = Math.max(clean.lastIndexOf(','), clean.lastIndexOf('.'));
  const repeated = (mark) => clean.split(mark).length > 2;
  let plain;
  if (clean.includes(',') && clean.includes('.')) {
    const decimal = clean[last];
    const group = decimal === ',' ? '.' : ',';
    plain = clean.replaceAll(group, '').replace(decimal, '.');
  } else if (repeated(',') || repeated('.')) {
    plain = clean.replace(/[,.]/g, '');
  } else {
    plain = clean.replace(',', '.');
  }
  if (!PLAIN.test(plain)) return { error: { key: 'error.notNumber' } };
  return { value: Number(plain) };
};

// Rounded to cents, with the half going away from zero.
export const round2 = (n) => Math.sign(n) * Math.round((Math.abs(n) + Number.EPSILON) * 100) / 100;

export const formatMoney = (n, locale) =>
  new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(n);

// `n` is a percentage: 3.2 is 3.2 %.
export const formatPercent = (n, locale) =>
  new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 3 }).format(n / 100);

// A number with no unit, with at most two decimals.
export const formatNumber = (n, locale) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(n);

// A plain number for an input field: no grouping, the decimal mark of the format.
export const formatInput = (n, locale) =>
  new Intl.NumberFormat(locale, { useGrouping: false, maximumFractionDigits: 6 }).format(n);
