import { test } from 'node:test';
import assert from 'node:assert/strict';
import { simpleInterest, SOLVE } from '#interest';

const known = { principal: 5000, rate: 4, years: 3, interest: 600 };

test('the unknowns', () => {
  assert.deepEqual(SOLVE, ['interest', 'principal', 'rate', 'years']);
});

test('each unknown comes from the other three', () => {
  for (const solve of SOLVE) {
    const { value } = simpleInterest({ ...known, [solve]: 0, solve });
    assert.ok(Math.abs(value - known[solve]) < 1e-9, solve);
  }
});

test('an unknown solve is the interest', () => {
  assert.deepEqual(simpleInterest({ ...known, solve: 'other' }), { value: 600 });
});

test('a zero divisor is an error', () => {
  const zero = { error: { key: 'error.zeroDivisor' } };
  assert.deepEqual(simpleInterest({ ...known, rate: 0, solve: 'principal' }), zero);
  assert.deepEqual(simpleInterest({ ...known, years: 0, solve: 'rate' }), zero);
  assert.deepEqual(simpleInterest({ ...known, principal: 0, solve: 'years' }), zero);
});

test('a rate of 0 earns no interest', () => {
  assert.deepEqual(simpleInterest({ ...known, rate: 0, solve: 'interest' }), { value: 0 });
});
