import { APP_SLUG } from '#config';
import { IDS, CALCULATORS, shownFields } from '#calculators';
import { parseNumber, formatInput } from '#number';

// The doc of the app: the text of each field as the user typed it, by calculator. A field with no
// text shows its initial value.
export const INPUTS_KEY = `${APP_SLUG}.inputs`;
export const MAX_TEXT = 40;

export const emptyInputs = () => ({ version: 1, inputs: {} });

const fieldOf = (id, name) => CALCULATORS[id]?.fields.find((field) => field.name === name) ?? null;

// The text of each field of a calculator: the stored one, else its initial value in the number
// format of `lang`.
export const textsOf = (state, id, lang) =>
  Object.fromEntries(
    CALCULATORS[id].fields.map((field) => {
      const stored = state.inputs[id]?.[field.name];
      if (stored !== undefined) return [field.name, stored];
      return [field.name, field.kind === 'choice' ? field.initial : formatInput(field.initial, lang)];
    }),
  );

export const setInput = (state, id, name, text) => {
  if (!fieldOf(id, name)) return { state, error: { key: 'error.fieldMissing' } };
  const clean = String(text ?? '').slice(0, MAX_TEXT);
  const own = { ...state.inputs[id], [name]: clean };
  return { state: { ...state, inputs: { ...state.inputs, [id]: own } } };
};

// Back to the initial values of one calculator.
export const resetInputs = (state, id) => {
  if (!CALCULATORS[id]) return { state, error: { key: 'error.fieldMissing' } };
  const { [id]: _, ...rest } = state.inputs;
  return { state: { ...state, inputs: rest } };
};

const checkField = (field, text) => {
  if (field.kind === 'choice') return { value: field.options.includes(text) ? text : field.initial };
  const { value, error } = parseNumber(text);
  if (error) return { error };
  if (value < field.min || value > field.max) {
    return { error: { key: 'error.outOfRange', params: { min: field.min, max: field.max } } };
  }
  if (field.whole && !Number.isInteger(value)) return { error: { key: 'error.notWhole' } };
  return { value };
};

// The value of each choice field: the typed option, or the first one. They decide which fields
// are asked.
export const choicesOf = (id, texts) =>
  Object.fromEntries(
    CALCULATORS[id].fields.filter((field) => field.kind === 'choice').map((field) => [field.name, checkField(field, texts[field.name]).value]),
  );

// The values of the fields that the screen asks, or an error message for each field that is not
// valid.
export const validate = (id, texts) => {
  const choices = choicesOf(id, texts);
  const values = { ...choices };
  const errors = {};
  for (const field of shownFields(id, choices)) {
    if (field.kind === 'choice') continue;
    const { value, error } = checkField(field, texts[field.name]);
    if (error) errors[field.name] = error;
    else values[field.name] = value;
  }
  return Object.keys(errors).length ? { errors } : { values };
};

// The results of a calculator for its texts: `{ results, table? }`, `{ errors }` for fields
// that are not valid, or `{ error }` when the values have no result.
export const calculate = (id, texts) => {
  const { values, errors } = validate(id, texts);
  return errors ? { errors } : CALCULATORS[id].compute(values);
};

// A clean version 1 doc, or null. It keeps the texts of known fields and drops the rest. Add a
// migration here when the version goes up.
export const normalizeInputs = (data) => {
  if (typeof data !== 'object' || data === null || data.version !== 1) return null;
  if (typeof data.inputs !== 'object' || data.inputs === null || Array.isArray(data.inputs)) return null;
  const inputs = {};
  for (const id of IDS) {
    const own = data.inputs[id];
    if (typeof own !== 'object' || own === null) continue;
    const kept = Object.entries(own).filter(([name, text]) => fieldOf(id, name) && typeof text === 'string');
    if (kept.length) inputs[id] = Object.fromEntries(kept.map(([name, text]) => [name, text.slice(0, MAX_TEXT)]));
  }
  return { version: 1, inputs };
};
