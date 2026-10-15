import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MODULES, switchModule, visibleSections } from '#modules';

test('MODULES are the calculators', () => {
  assert.deepEqual(MODULES, ['loan', 'deposit', 'savings', 'interest']);
});

test('visibleSections with no module off is the full navigation', () => {
  assert.deepEqual(visibleSections([]), ['loan', 'deposit', 'savings', 'interest', 'settings']);
});

test('visibleSections leaves out the section of each module that is off', () => {
  assert.deepEqual(visibleSections(['loan', 'savings']), ['deposit', 'interest', 'settings']);
  assert.deepEqual(visibleSections(MODULES), ['settings']);
});

test('visibleSections ignores an unknown id', () => {
  assert.deepEqual(visibleSections(['shops']), ['loan', 'deposit', 'savings', 'interest', 'settings']);
});

test('switchModule turns a module off and on, in the order of MODULES', () => {
  assert.deepEqual(switchModule([], 'loan', false), ['loan']);
  assert.deepEqual(switchModule(['interest'], 'loan', false), ['loan', 'interest']);
  assert.deepEqual(switchModule(['loan'], 'loan', true), []);
  assert.deepEqual(switchModule([], 'loan', true), []);
});

test('switchModule ignores an unknown id and does not change its input', () => {
  const off = ['loan'];
  assert.deepEqual(switchModule(off, 'shops', false), ['loan']);
  assert.deepEqual(off, ['loan']);
});
