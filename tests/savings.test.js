import { test } from 'node:test';
import assert from 'node:assert/strict';
import { savings } from '#savings';

const near = (actual, expected, digits = 2) => assert.equal(Number(actual.toFixed(digits)), expected);

test('the final balance is the closed formula of an annuity', () => {
  const result = savings({ initial: 1000, monthly: 100, rate: 5, years: 10 });
  const i = 0.05 / 12;
  const growth = (1 + i) ** 120;
  near(result.final, Number((1000 * growth + (100 * (growth - 1)) / i).toFixed(2)));
});

test('the contributions and the interest add up to the final balance', () => {
  const result = savings({ initial: 1000, monthly: 100, rate: 5, years: 10 });
  assert.equal(result.contributed, 13000);
  near(result.contributed + result.interest, Number(result.final.toFixed(2)));
});

test('a rate of 0 keeps what was put in', () => {
  const result = savings({ initial: 0, monthly: 100, rate: 0, years: 10 });
  assert.equal(result.final, 12000);
  assert.equal(result.interest, 0);
});

test('with no contribution the initial amount grows by monthly compounding', () => {
  const result = savings({ initial: 10000, monthly: 0, rate: 3, years: 1 });
  near(result.final, 10304.16);
});

test('the year table has one row for each year', () => {
  const result = savings({ initial: 500, monthly: 50, rate: 4, years: 3 });
  assert.deepEqual(result.years.map((row) => row.year), [1, 2, 3]);
  assert.deepEqual(result.years.map((row) => row.contributed), [1100, 1700, 2300]);
  assert.equal(result.years.at(-1).balance, result.final);
  near(result.years.reduce((total, row) => total + row.interest, 0), Number(result.interest.toFixed(2)));
});

test('the interest of a year grows with the balance', () => {
  const { years } = savings({ initial: 1000, monthly: 100, rate: 5, years: 5 });
  years.slice(1).forEach((row, i) => assert.ok(row.interest > years[i].interest));
});
