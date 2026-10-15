import { test } from 'node:test';
import assert from 'node:assert/strict';
import { APP_SLUG } from '#config';
import { INPUTS_KEY, MAX_TEXT, emptyInputs, textsOf, setInput, resetInputs, choicesOf, validate, calculate, normalizeInputs } from '#inputs';

test('the key of the inputs has the slug', () => {
  assert.equal(INPUTS_KEY, `${APP_SLUG}.inputs`);
});

test('a field with no text shows its initial value in the format of the language', () => {
  assert.deepEqual(textsOf(emptyInputs(), 'loan', 'es'), { amount: '200000', rate: '3,2', years: '25' });
  assert.deepEqual(textsOf(emptyInputs(), 'loan', 'en'), { amount: '200000', rate: '3.2', years: '25' });
  assert.equal(textsOf(emptyInputs(), 'deposit', 'es').compounding, 'maturity');
});

test('a typed text is kept as typed, and the input state is unchanged', () => {
  const state = emptyInputs();
  const { state: next, error } = setInput(state, 'loan', 'rate', '4,1');
  assert.equal(error, undefined);
  assert.equal(textsOf(next, 'loan', 'en').rate, '4,1');
  assert.equal(textsOf(next, 'loan', 'en').amount, '200000');
  assert.deepEqual(state, emptyInputs());
});

test('a text that is not valid is kept too, so a reload shows it', () => {
  const { state } = setInput(emptyInputs(), 'loan', 'amount', '12a');
  assert.equal(state.inputs.loan.amount, '12a');
});

test('a text is cut at the maximum length', () => {
  const { state } = setInput(emptyInputs(), 'loan', 'amount', '1'.repeat(MAX_TEXT + 5));
  assert.equal(state.inputs.loan.amount.length, MAX_TEXT);
});

test('an unknown calculator or field is an error and nothing changes', () => {
  const state = emptyInputs();
  assert.deepEqual(setInput(state, 'loan', 'colour', '1'), { state, error: { key: 'error.fieldMissing' } });
  assert.deepEqual(setInput(state, 'lottery', 'amount', '1'), { state, error: { key: 'error.fieldMissing' } });
  assert.deepEqual(resetInputs(state, 'lottery'), { state, error: { key: 'error.fieldMissing' } });
});

test('a reset goes back to the initial values of one calculator only', () => {
  let { state } = setInput(emptyInputs(), 'loan', 'rate', '5');
  ({ state } = setInput(state, 'savings', 'rate', '6'));
  const { state: next } = resetInputs(state, 'loan');
  assert.deepEqual(next.inputs, { savings: { rate: '6' } });
});

test('validate gives the values of valid texts', () => {
  assert.deepEqual(validate('loan', { amount: '200 000', rate: '3,2', years: '25' }), {
    values: { amount: 200000, rate: 3.2, years: 25 },
  });
});

test('validate gives an error for each field that is not valid', () => {
  assert.deepEqual(validate('loan', { amount: '', rate: 'x', years: '25,5' }), {
    errors: {
      amount: { key: 'error.required' },
      rate: { key: 'error.notNumber' },
      years: { key: 'error.notWhole' },
    },
  });
});

test('a value out of its range is an error with the range', () => {
  assert.deepEqual(validate('loan', { amount: '0', rate: '3', years: '51' }).errors, {
    amount: { key: 'error.outOfRange', params: { min: 0.01, max: 1e9 } },
    years: { key: 'error.outOfRange', params: { min: 1, max: 50 } },
  });
  assert.deepEqual(validate('loan', { amount: '1000', rate: '-1', years: '5' }).errors, {
    rate: { key: 'error.outOfRange', params: { min: 0, max: 100 } },
  });
});

test('choicesOf gives only the choice fields, whatever the numbers are', () => {
  assert.deepEqual(choicesOf('loan', { amount: '1', rate: 'x', years: '' }), {});
  assert.deepEqual(choicesOf('interest', { solve: 'rate', principal: 'x' }), { solve: 'rate' });
  assert.deepEqual(choicesOf('deposit', { compounding: 'weekly' }), { compounding: 'maturity' });
});

test('an unknown choice is the first option', () => {
  const texts = { amount: '1000', rate: '3', months: '12', compounding: 'weekly', tax: '19' };
  assert.equal(validate('deposit', texts).values.compounding, 'maturity');
});

test('a field that simple interest solves is not checked', () => {
  const texts = { solve: 'interest', principal: '5000', rate: '4', years: '3', interest: 'x' };
  assert.deepEqual(validate('interest', texts), { values: { solve: 'interest', principal: 5000, rate: 4, years: 3 } });
});

test('calculate gives the results, the errors, or the error of the values', () => {
  assert.equal(calculate('loan', { amount: '200000', rate: '3,2', years: '25' }).results[0].value, 969.36);
  assert.deepEqual(Object.keys(calculate('loan', { amount: '', rate: '3', years: '5' }).errors), ['amount']);
  const zero = { solve: 'principal', principal: '', rate: '0', years: '3', interest: '600' };
  assert.deepEqual(calculate('interest', zero), { error: { key: 'error.zeroDivisor' } });
});

test('normalize keeps the texts of known fields and drops the rest', () => {
  const data = {
    version: 1,
    inputs: { loan: { rate: '4', colour: 'red', amount: 5 }, lottery: { amount: '1' }, deposit: null },
    extra: true,
  };
  assert.deepEqual(normalizeInputs(data), { version: 1, inputs: { loan: { rate: '4' } } });
});

test('normalize refuses a doc that is not version 1 of the inputs', () => {
  for (const data of [null, 'x', [], {}, { version: 2, inputs: {} }, { version: 1 }, { version: 1, inputs: [] }]) {
    assert.equal(normalizeInputs(data), null);
  }
});

test('normalize of an empty doc is an empty doc', () => {
  assert.deepEqual(normalizeInputs(emptyInputs()), emptyInputs());
});
