// The ways a term deposit pays its interest.
export const COMPOUNDING = ['maturity', 'monthly', 'annual'];

// The growth factor of 1 € over `months` at the annual rate `r` (a fraction).
const GROWTH = {
  maturity: (r, months) => 1 + (r * months) / 12,
  monthly: (r, months) => (1 + r / 12) ** months,
  annual: (r, months) => (1 + r) ** (months / 12),
};

// A term deposit. `rate` is the annual nominal rate (TIN) and `tax` the withholding on the
// interest, both in percent. `apy` is the effective annual rate (TAE) in percent.
export const deposit = ({ amount, rate, months, compounding, tax }) => {
  const growth = GROWTH[compounding] ?? GROWTH.maturity;
  const r = rate / 100;
  const gross = amount * (growth(r, months) - 1);
  const withheld = (gross * tax) / 100;
  const net = gross - withheld;
  const apy = ((growth(r, months) ** (12 / months)) - 1) * 100;
  return { gross, tax: withheld, net, final: amount + net, apy };
};
