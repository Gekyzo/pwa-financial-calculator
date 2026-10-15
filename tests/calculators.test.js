import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IDS, CALCULATORS, shownFields } from '#calculators';

test('the calculators, in the order of the navigation', () => {
  assert.deepEqual(IDS, ['loan', 'deposit', 'savings', 'interest']);
  assert.deepEqual(Object.keys(CALCULATORS), IDS);
});

test('each initial value is inside its range, and a choice is one of its options', () => {
  for (const id of IDS) {
    for (const field of CALCULATORS[id].fields) {
      if (field.kind === 'choice') assert.ok(field.options.includes(field.initial), `${id}.${field.name}`);
      else assert.ok(field.initial >= field.min && field.initial <= field.max, `${id}.${field.name}`);
    }
  }
});

test('each calculator computes its initial values', () => {
  for (const id of IDS) {
    const values = Object.fromEntries(CALCULATORS[id].fields.map((field) => [field.name, field.initial]));
    const out = CALCULATORS[id].compute(values);
    assert.equal(out.error, undefined, id);
    assert.ok(out.results.length > 0, id);
    for (const { value } of out.results) assert.ok(Number.isFinite(value), id);
  }
});

test('the loan gives its payment first, and a table by year', () => {
  const out = CALCULATORS.loan.compute({ amount: 200000, rate: 3.2, years: 25 });
  assert.deepEqual(out.results[0], { key: 'payment', kind: 'money', value: 969.36 });
  assert.equal(out.table.rows.length, 25);
  assert.deepEqual(out.table.columns.map((column) => column.key), ['year', 'principal', 'interest', 'balance']);
});

test('simple interest does not ask the field that it solves', () => {
  const names = (solve) => shownFields('interest', { solve }).map((field) => field.name);
  assert.deepEqual(names('interest'), ['solve', 'principal', 'rate', 'years']);
  assert.deepEqual(names('rate'), ['solve', 'principal', 'years', 'interest']);
});

test('simple interest gives the solved value in its kind', () => {
  const base = { principal: 5000, rate: 4, years: 3, interest: 600 };
  assert.equal(CALCULATORS.interest.compute({ ...base, solve: 'rate' }).results[0].kind, 'percent');
  assert.equal(CALCULATORS.interest.compute({ ...base, solve: 'years' }).results[0].kind, 'years');
  assert.deepEqual(CALCULATORS.interest.compute({ ...base, rate: 0, solve: 'principal' }), {
    error: { key: 'error.zeroDivisor' },
  });
});

test('a calculator with no choice field asks all its fields', () => {
  assert.equal(shownFields('loan', {}).length, CALCULATORS.loan.fields.length);
});
