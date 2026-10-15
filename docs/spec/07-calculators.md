# Calculators

The domain of the app: four calculators of money. Each one is a section and a module (MOD-1).

## Numbers

- **CALC-1** `parseNumber` reads a typed number. It drops spaces of every kind. With both `,` and
  `.`, the last one is the decimal mark and the other groups the digits. A mark that comes two or
  more times groups the digits. A single mark is the decimal mark: `3,2` and `3.2` are 3.2. A blank
  text is `error.required`; any other text that is not a number is `error.notNumber`.
- **CALC-2** Money is in euros. `formatMoney` and `formatPercent` use the number format of the
  language of the screen: `es-ES` for `es`, `en-GB` for `en` and for any other language. A
  percentage shows at most three decimals.
- **CALC-3** A result keeps its full precision. It is rounded to cents only for the screen, and in
  the schedule of a loan.
