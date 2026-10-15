import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loan } from '#loan';
import { round2 } from '#number';

const sum = (rows, field) => round2(rows.reduce((total, row) => total + row[field], 0));

test('the payment of a known mortgage', () => {
  const result = loan({ amount: 200000, rate: 3.2, years: 25 });
  assert.equal(result.payment, 969.36);
  assert.equal(result.months, 300);
});

test('the schedule has one row for each year and closes at 0', () => {
  const { years } = loan({ amount: 200000, rate: 3.2, years: 25 });
  assert.equal(years.length, 25);
  assert.deepEqual(years.map((row) => row.year), Array.from({ length: 25 }, (_, i) => i + 1));
  assert.equal(years.at(-1).balance, 0);
});

test('the principal of the schedule is the amount, and its interest is the total interest', () => {
  const result = loan({ amount: 200000, rate: 3.2, years: 25 });
  assert.equal(sum(result.years, 'principal'), 200000);
  assert.equal(sum(result.years, 'interest'), result.totalInterest);
  assert.equal(result.totalPaid, round2(200000 + result.totalInterest));
});

test('the total paid is near the payment times the months', () => {
  const result = loan({ amount: 200000, rate: 3.2, years: 25 });
  assert.ok(Math.abs(result.totalPaid - result.payment * result.months) < 1);
});

test('the balance goes down each year', () => {
  const { years } = loan({ amount: 15000, rate: 7.5, years: 5 });
  years.slice(1).forEach((row, i) => assert.ok(row.balance < years[i].balance));
});

test('a rate of 0 splits the amount over the months', () => {
  const result = loan({ amount: 1000, rate: 0, years: 1 });
  assert.equal(result.payment, 83.33);
  assert.equal(result.totalInterest, 0);
  assert.equal(result.totalPaid, 1000);
  assert.equal(result.years[0].balance, 0);
});

test('a loan of one year has one row', () => {
  const { years } = loan({ amount: 12000, rate: 5, years: 1 });
  assert.equal(years.length, 1);
  assert.equal(years[0].principal, 12000);
});

test('the input is not changed', () => {
  const input = { amount: 1000, rate: 3, years: 2 };
  loan(input);
  assert.deepEqual(input, { amount: 1000, rate: 3, years: 2 });
});
