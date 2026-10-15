// The unknowns that the simple interest calculator can solve, in the order of its choice.
export const SOLVE = ['interest', 'principal', 'rate', 'years'];

const ratio = (top, bottom) => (bottom === 0 ? { error: { key: 'error.zeroDivisor' } } : { value: top / bottom });

// Simple interest, `I = P·r·t`, with `rate` in percent a year and `years` the time. Gives the
// unknown named by `solve` from the other three, or an error when it has no single value.
export const simpleInterest = ({ solve, principal, rate, years, interest }) => {
  const r = rate / 100;
  switch (solve) {
    case 'principal':
      return ratio(interest, r * years);
    case 'rate': {
      const result = ratio(interest, principal * years);
      return result.error ? result : { value: result.value * 100 };
    }
    case 'years':
      return ratio(interest, principal * r);
    default:
      return { value: principal * r * years };
  }
};
