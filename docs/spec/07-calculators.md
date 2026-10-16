# Calculators

The domain of the app: four calculators of money. Each one is a section and a module (MOD-1).
The name of the app is Compound in `es` and in `en`.

## Numbers

- **CALC-1** `parseNumber` reads a typed number by the marks of the format (I18N-8): in `es-ES`,
  `.` for thousands and `,` for decimals; in `en-GB` and `en-US`, the other way round. It drops
  spaces of every kind. The thousands mark must split the digits in groups of three, and the
  decimal mark comes at most one time: in `es-ES`, `200.000`, `200000` and `3,2` are valid, and
  `3.2` is `error.badGrouping` with the two marks, never 32. A blank text is `error.required`; a
  text with any other character is `error.notNumber`.
- **CALC-2** Money is in euros. `formatMoney`, `formatPercent` and `formatNumber` use the format
  of I18N-8, not the language of the texts: English texts can show `1.234,50 €`. The groups of
  thousands always show, for four digits too (`1.000,50 €`). A percentage shows at most three
  decimals.
- **CALC-3** A result keeps its full precision. It is rounded to cents only for the screen, and in
  the schedule of a loan (CALC-4).

## Loan

- **CALC-4** `loan` gives the fixed monthly payment of a loan or a mortgage (French amortisation):
  with `i` the annual rate / 12 and `n` the months, the payment is `P·i / (1 − (1+i)^−n)` rounded
  to cents, and `P / n` for a rate of 0. Each month pays the interest of the balance, in cents, and
  the rest of the payment goes to the principal. The last month pays what is left, so the balance
  closes at 0. The schedule groups the months by year: principal, interest and the balance at its
  end. 200 000 € at 3.2 % over 25 years is 969.36 € a month.

## Deposit

- **CALC-5** `deposit` gives the interest of a term deposit of `m` months at the annual rate `r`
  (TIN). The interest is paid at maturity (`P·r·m/12`), monthly (`P·((1+r/12)^m − 1)`) or
  annually (`P·((1+r)^(m/12) − 1)`). The withholding, a percent of the gross interest, comes off
  it; Spain withholds 19 %. The final amount is the deposit plus the net interest.
- **CALC-6** The APY (TAE) is the growth of 1 € over the term, taken to one year:
  `growth^(12/m) − 1`. Monthly compounding at 3 % is 3.042 %.

## Savings

- **CALC-7** `savings` grows an initial amount and a contribution at the end of each month,
  compounded monthly at the annual rate `r`: `P(1+i)^n + C·((1+i)^n − 1)/i` with `i = r/12`, and
  `P + C·n` for a rate of 0. The table has a row for each year: what was put in up to its end, the
  interest of that year and the balance at its end.

## Simple interest

- **CALC-8** `simpleInterest` solves `I = P·r·t` for the unknown that the user picks: the
  interest, the principal, the rate or the years. An unknown with a divisor of 0 (a principal at
  a rate of 0, for one) is `error.zeroDivisor`.

## Fields

- **CALC-9** `CALCULATORS` describes each calculator: its fields, and the results and the table of
  its values. A field is a number of a kind (money, percent, years, months) inside a range, whole
  for the years of a loan and of savings and for the months of a deposit, or a choice. A choice of
  simple interest picks the unknown, and the screen does not ask that field.

  | Calculator | Fields | Results |
  |---|---|---|
  | loan | amount, rate, years | payment, total interest, total paid; a table by year |
  | deposit | amount, rate, months, compounding, withholding | final amount, net interest, gross interest, withheld, APY |
  | savings | initial amount, monthly contribution, rate, years | final balance, contributed, interest; a table by year |
  | interest | solve, principal, rate, years, interest | the unknown that it solves |

- **CALC-10** `validate` checks the fields that the screen asks. A field that is blank is
  `error.required`, one that is not a number is `error.notNumber`, one out of its range is
  `error.outOfRange` with its `min` and `max`, and a whole field with decimals is
  `error.notWhole`. An unknown choice is the first option. Only valid fields give results.

## Doc

- **CALC-11** The doc is `{ version: 1, format, inputs: { <calculator>: { <field>: text } } }`,
  stored as JSON under `pwa-financial-calculator.inputs`. `format` is the format that the texts are in. It keeps the text of a field as the user typed it,
  valid or not, cut at 40 characters, so a reload shows the same screen. A field with no text
  shows its initial value in the format of I18N-8.
- **CALC-12** `normalizeInputs` accepts a doc of version 1. It keeps the texts of known fields of
  known calculators and an offered format, and drops the rest. `alignInputs` puts the texts in the
  format in use, at the start and after each change of the format: a valid number is written
  again with the new marks (`200.000` becomes `200,000`), and any other text stays as typed. A doc
  with no format is taken to be in the format in use. A stored doc that is not valid is kept under
  `pwa-financial-calculator.inputs.corrupt`, and the app starts with the initial values.
- **CALC-13** `resetInputs` puts one calculator back to its initial values. An unknown calculator
  or field is `error.fieldMissing`, and nothing changes.

## Screen

- **CALC-14** Each calculator is a section of one centred column: its fields, its results, a table
  by year for the loan and savings, and **Initial values** (CALC-13). A number field takes a decimal
  keyboard. The results change on each keystroke, with no button. On leaving a field, a valid
  number is written again with the marks of the format: `200000` becomes `200.000` in `es-ES`. The first result is the main
  one, larger and across the grid.
- **CALC-15** A field that is not valid shows its message under it, and the results and the
  table stay in sight, dimmed, until the fields are valid again. Values with no result
  (CALC-8) show the message in place of the results.
- **CALC-16** A keystroke keeps the form, so the field keeps its focus. The form is built again
  only when the language, the unknown of simple interest or a reset changes its fields.
