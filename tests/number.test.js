import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseNumber, separatorsOf, round2, formatMoney, formatPercent, formatNumber, formatInput } from '#number';

test('the separators of each format', () => {
  assert.deepEqual(separatorsOf('es-ES'), { group: '.', decimal: ',' });
  assert.deepEqual(separatorsOf('en-US'), { group: ',', decimal: '.' });
  assert.deepEqual(separatorsOf('en-GB'), { group: ',', decimal: '.' });
});

test('a number with no mark is read in every format', () => {
  for (const locale of ['es-ES', 'en-US']) assert.deepEqual(parseNumber('42', locale), { value: 42 }, locale);
});

test('the decimal mark of the format', () => {
  assert.deepEqual(parseNumber('3,2', 'es-ES'), { value: 3.2 });
  assert.deepEqual(parseNumber('3.2', 'en-US'), { value: 3.2 });
});

test('the thousands mark of the format, in groups of three', () => {
  assert.deepEqual(parseNumber('200.000', 'es-ES'), { value: 200000 });
  assert.deepEqual(parseNumber('1.000.000,5', 'es-ES'), { value: 1000000.5 });
  assert.deepEqual(parseNumber('200,000', 'en-US'), { value: 200000 });
  assert.deepEqual(parseNumber('1,000,000.5', 'en-GB'), { value: 1000000.5 });
});

test('spaces of every kind are dropped', () => {
  assert.deepEqual(parseNumber('200 000', 'es-ES'), { value: 200000 });
  assert.deepEqual(parseNumber('200 000', 'en-US'), { value: 200000 });
  assert.deepEqual(parseNumber(' 1 000,5 ', 'es-ES'), { value: 1000.5 });
});

test('a negative number is read', () => {
  assert.deepEqual(parseNumber('-5,5', 'es-ES'), { value: -5.5 });
});

test('a mark in the wrong place is a grouping error with the marks of the format', () => {
  const es = { error: { key: 'error.badGrouping', params: { group: '.', decimal: ',' } } };
  const us = { error: { key: 'error.badGrouping', params: { group: ',', decimal: '.' } } };
  for (const text of ['3.2', '1.00', '1.0000', '1,000.5', '3,2,1', '3,', ',5']) assert.deepEqual(parseNumber(text, 'es-ES'), es, text);
  for (const text of ['3,2', '1,00', '1.000,5']) assert.deepEqual(parseNumber(text, 'en-US'), us, text);
});

test('a blank text is required', () => {
  for (const text of ['', '   ', null, undefined]) {
    assert.deepEqual(parseNumber(text, 'es-ES'), { error: { key: 'error.required' } });
  }
});

test('a text that is not a number is an error', () => {
  for (const text of ['abc', '1e5', '--1', '5 %', '12a']) {
    assert.deepEqual(parseNumber(text, 'es-ES'), { error: { key: 'error.notNumber' } }, text);
  }
});

test('round2 rounds to cents, the half away from zero', () => {
  assert.equal(round2(1.005), 1.01);
  assert.equal(round2(2.344), 2.34);
  assert.equal(round2(-1.005), -1.01);
  assert.equal(round2(0), 0);
});

test('money is in euros in the chosen format', () => {
  assert.equal(formatMoney(969.24, 'es-ES'), '969,24 €');
  assert.equal(formatMoney(12345.6, 'es-ES'), '12.345,60 €');
  assert.equal(formatMoney(12345.6, 'en-GB'), '€12,345.60');
});

test('four digits are grouped too', () => {
  assert.equal(formatMoney(1000.5, 'es-ES'), '1.000,50\u00a0€');
  assert.equal(formatNumber(1000, 'es-ES'), '1.000');
});

test('money in the United States format', () => {
  assert.equal(formatMoney(1000.5, 'en-US'), '€1,000.50');
});

test('a percentage is in the chosen format', () => {
  assert.equal(formatPercent(3.2, 'es-ES'), '3,2 %');
  assert.equal(formatPercent(3.2, 'en-GB'), '3.2%');
  assert.equal(formatPercent(3.0417, 'en-GB'), '3.042%');
});

test('a number with no unit has at most two decimals', () => {
  assert.equal(formatNumber(2.5, 'es-ES'), '2,5');
  assert.equal(formatNumber(12345.678, 'en-GB'), '12,345.68');
});

test('an input value has the marks of the format and reads back', () => {
  assert.equal(formatInput(200000.5, 'es-ES'), '200.000,5');
  assert.equal(formatInput(200000.5, 'en-US'), '200,000.5');
  assert.equal(formatInput(1000, 'es-ES'), '1.000');
  for (const locale of ['es-ES', 'en-GB', 'en-US']) {
    assert.deepEqual(parseNumber(formatInput(1234567.25, locale), locale), { value: 1234567.25 }, locale);
  }
});
