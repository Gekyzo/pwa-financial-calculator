import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deposit, COMPOUNDING } from '#deposit';
import { round2 } from '#number';

const near = (actual, expected, digits = 2) => assert.equal(Number(actual.toFixed(digits)), expected);

test('the compoundings', () => {
  assert.deepEqual(COMPOUNDING, ['maturity', 'monthly', 'annual']);
});

test('interest at maturity is simple', () => {
  const result = deposit({ amount: 10000, rate: 3, months: 12, compounding: 'maturity', tax: 0 });
  near(result.gross, 300);
  near(result.net, 300);
  near(result.final, 10300);
  near(result.apy, 3);
});

test('the withholding comes off the gross interest', () => {
  const result = deposit({ amount: 10000, rate: 3, months: 12, compounding: 'maturity', tax: 19 });
  near(result.tax, 57);
  near(result.net, 243);
  near(result.final, 10243);
});

test('monthly compounding pays interest on interest', () => {
  const result = deposit({ amount: 10000, rate: 3, months: 12, compounding: 'monthly', tax: 0 });
  near(result.gross, 304.16);
  near(result.apy, 3.0416, 4);
});

test('annual compounding over two years', () => {
  const result = deposit({ amount: 10000, rate: 3, months: 24, compounding: 'annual', tax: 0 });
  near(result.gross, 609);
  near(result.apy, 3);
});

test('a short deposit at maturity has a higher APY than its rate', () => {
  const result = deposit({ amount: 5000, rate: 3, months: 6, compounding: 'maturity', tax: 0 });
  near(result.gross, 75);
  near(result.apy, 3.0225, 4);
});

test('a rate of 0 earns nothing', () => {
  for (const compounding of COMPOUNDING) {
    const result = deposit({ amount: 1000, rate: 0, months: 12, compounding, tax: 19 });
    assert.equal(round2(result.final), 1000);
    assert.equal(result.apy, 0);
  }
});

test('an unknown compounding is at maturity', () => {
  const input = { amount: 10000, rate: 3, months: 12, tax: 0 };
  assert.deepEqual(deposit({ ...input, compounding: 'weekly' }), deposit({ ...input, compounding: 'maturity' }));
});
