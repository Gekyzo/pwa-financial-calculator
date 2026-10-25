import { loan } from '#loan';
import { deposit, COMPOUNDING } from '#deposit';
import { savings } from '#savings';
import { simpleInterest, SOLVE } from '#interest';

// The calculators, in the order of the navigation. A field is a number of a `kind` (money,
// percent, years, months) between `min` and `max`, whole when `whole`, or a `choice` of
// `options`, with a paragraph about the chosen option when `explained`. `initial` is its value before the user types one. `compute` takes the values of the
// fields and gives the results as `{ key, kind, value }` and, for some, a table by year.
export const IDS = ['loan', 'deposit', 'savings', 'interest'];

const MAX_MONEY = 1e9;
const money = (name, initial, min = 0.01) => ({ name, kind: 'money', min, max: MAX_MONEY, initial });
const percent = (name, initial) => ({ name, kind: 'percent', min: 0, max: 100, initial });
const choice = (name, options, explained = false) => ({ name, kind: 'choice', options, initial: options[0], explained });

const result = (key, kind, value) => ({ key, kind, value });

export const CALCULATORS = {
  loan: {
    fields: [money('amount', 200000), percent('rate', 3.2), { name: 'years', kind: 'years', min: 1, max: 50, whole: true, initial: 25 }],
    compute: (values) => {
      const out = loan(values);
      return {
        results: [
          result('payment', 'money', out.payment),
          result('totalInterest', 'money', out.totalInterest),
          result('totalPaid', 'money', out.totalPaid),
        ],
        table: {
          columns: [
            { key: 'year', kind: 'count' },
            { key: 'principal', kind: 'money' },
            { key: 'interest', kind: 'money' },
            { key: 'balance', kind: 'money' },
          ],
          rows: out.years,
        },
      };
    },
  },
  deposit: {
    fields: [
      money('amount', 10000),
      percent('rate', 3),
      { name: 'months', kind: 'months', min: 1, max: 120, whole: true, initial: 12 },
      choice('compounding', COMPOUNDING),
      percent('tax', 19),
    ],
    compute: (values) => {
      const out = deposit(values);
      return {
        results: [
          result('final', 'money', out.final),
          result('net', 'money', out.net),
          result('gross', 'money', out.gross),
          result('withheld', 'money', out.tax),
          result('apy', 'percent', out.apy),
        ],
      };
    },
  },
  savings: {
    fields: [
      money('initial', 1000, 0),
      money('monthly', 100, 0),
      percent('rate', 5),
      { name: 'years', kind: 'years', min: 1, max: 60, whole: true, initial: 10 },
    ],
    compute: (values) => {
      const out = savings(values);
      return {
        results: [
          result('final', 'money', out.final),
          result('contributed', 'money', out.contributed),
          result('interest', 'money', out.interest),
        ],
        table: {
          columns: [
            { key: 'year', kind: 'count' },
            { key: 'contributed', kind: 'money' },
            { key: 'interest', kind: 'money' },
            { key: 'balance', kind: 'money' },
          ],
          rows: out.years,
        },
      };
    },
  },
  interest: {
    fields: [
      choice('solve', SOLVE, true),
      money('principal', 5000),
      percent('rate', 4),
      { name: 'years', kind: 'years', min: 0.01, max: 100, initial: 3 },
      money('interest', 600, 0),
    ],
    // The field that the calculator solves is not asked.
    hidden: (values) => [values.solve],
    compute: (values) => {
      const out = simpleInterest(values);
      if (out.error) return out;
      const kind = { interest: 'money', principal: 'money', rate: 'percent', years: 'years' }[values.solve];
      return { results: [result(values.solve, kind, out.value)] };
    },
  },
};

// The fields of a calculator that the screen asks, for the values of its choice fields.
export const shownFields = (id, values) => {
  const { fields, hidden } = CALCULATORS[id];
  const skip = hidden ? hidden(values) : [];
  return fields.filter((field) => !skip.includes(field.name));
};
