import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseNumber, round2, formatMoney, formatPercent, formatInput } from '#number';

test('a single mark is the decimal mark', () => {
  assert.deepEqual(parseNumber('3,2'), { value: 3.2 });
  assert.deepEqual(parseNumber('3.2'), { value: 3.2 });
  assert.deepEqual(parseNumber('42'), { value: 42 });
});

test('spaces of every kind group the digits', () => {
  assert.deepEqual(parseNumber('200 000'), { value: 200000 });
  assert.deepEqual(parseNumber('200 000'), { value: 200000 });
  assert.deepEqual(parseNumber(' 1 000 '), { value: 1000 });
});

test('with both marks, the last one is the decimal mark', () => {
  assert.deepEqual(parseNumber('200.000,50'), { value: 200000.5 });
  assert.deepEqual(parseNumber('200,000.50'), { value: 200000.5 });
});

test('a mark that comes two or more times groups the digits', () => {
  assert.deepEqual(parseNumber('1.000.000'), { value: 1000000 });
  assert.deepEqual(parseNumber('1,000,000'), { value: 1000000 });
});

test('a negative number is parsed', () => {
  assert.deepEqual(parseNumber('-5,5'), { value: -5.5 });
});

test('a blank text is required', () => {
  for (const text of ['', '   ', null, undefined]) {
    assert.deepEqual(parseNumber(text), { error: { key: 'error.required' } });
  }
});

test('a text that is not a number is an error', () => {
  for (const text of ['abc', '3,2,1.0.0', '1e5', '--1', '3,', ',5', '5 %']) {
    assert.deepEqual(parseNumber(text), { error: { key: 'error.notNumber' } }, text);
  }
});

test('round2 rounds to cents, the half away from zero', () => {
  assert.equal(round2(1.005), 1.01);
  assert.equal(round2(2.344), 2.34);
  assert.equal(round2(-1.005), -1.01);
  assert.equal(round2(0), 0);
});

test('money is in euros in the format of the language', () => {
  assert.equal(formatMoney(969.24, 'es'), '969,24 €');
  assert.equal(formatMoney(12345.6, 'es'), '12.345,60 €');
  assert.equal(formatMoney(12345.6, 'en'), '€12,345.60');
});

test('an unknown language formats as English', () => {
  assert.equal(formatMoney(1, 'xx'), formatMoney(1, 'en'));
});

test('a percentage is in the format of the language', () => {
  assert.equal(formatPercent(3.2, 'es'), '3,2 %');
  assert.equal(formatPercent(3.2, 'en'), '3.2%');
  assert.equal(formatPercent(3.0417, 'en'), '3.042%');
});

test('an input value has no grouping and the decimal mark of the language', () => {
  assert.equal(formatInput(200000.5, 'es'), '200000,5');
  assert.equal(formatInput(200000.5, 'en'), '200000.5');
  assert.deepEqual(parseNumber(formatInput(3.25, 'es')), { value: 3.25 });
});
