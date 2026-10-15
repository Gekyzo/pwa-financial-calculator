import { IDS, CALCULATORS, shownFields } from '#calculators';
import { textsOf, setInput, resetInputs, choicesOf, calculate } from '#inputs';
import { formatMoney, formatPercent, formatNumber } from '#number';
import { $, el, ui, state, lang, format, t, textOf, commit, apply } from '#ui/context';
import { icon } from '#ui/controls';

// The form of a calculator is built again only when its fields change: the language, the format, the choice
// that hides a field, or a reset. A keystroke keeps the form, so the field keeps its focus.
const built = {};
let resets = 0;

const show = (kind, value) => {
  if (kind === 'money') return formatMoney(value, format);
  if (kind === 'percent') return formatPercent(value, format);
  if (kind === 'count') return String(value);
  return formatNumber(value, format);
};

const numberField = (id, field, text) => {
  const label = t(`field.${field.name}`);
  const input = el('input', {
    className: 'input field-input',
    type: 'text',
    inputMode: 'decimal',
    id: `${id}-${field.name}`,
    name: field.name,
    value: text,
    placeholder: label,
    spellcheck: false,
    oninput: (event) => commit(setInput(state, id, field.name, event.target.value).state),
  });
  const error = el('span', { className: 'calc-error', id: `${id}-${field.name}-error` });
  input.setAttribute('aria-describedby', error.id);
  return el('div', {}, [el('label', { className: 'field' }, [input, el('span', { className: 'field-label', textContent: label })]), error]);
};

const choiceField = (id, field, text) => {
  const segment = (option) => {
    const button = el('button', {
      className: 'segment',
      type: 'button',
      textContent: t(`choice.${field.name}.${option}`),
      onclick: () => apply(setInput(state, id, field.name, option)),
    });
    button.setAttribute('aria-pressed', String(option === text));
    return button;
  };
  const group = el('div', { className: 'segmented' }, field.options.map(segment));
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', t(`field.${field.name}`));
  return el('div', { className: 'calc-choice' }, [el('span', { className: 'calc-choice-label', textContent: t(`field.${field.name}`) }), group]);
};

const buildForm = (id, section, texts, fields) => {
  const form = el(
    'form',
    { className: 'calc-form', noValidate: true, autocomplete: 'off', onsubmit: (event) => event.preventDefault() },
    fields.map((field) => (field.kind === 'choice' ? choiceField : numberField)(id, field, texts[field.name])),
  );
  const reset = el('button', { className: 'button quiet calc-reset', type: 'button', onclick: () => {
    resets += 1;
    apply(resetInputs(state, id));
  } }, [icon('refresh'), el('span', { textContent: t('calc.reset') })]);
  const results = el('div', { className: 'calc-results', id: `${id}-results` });
  results.setAttribute('aria-live', 'polite');
  section.replaceChildren(
    form,
    results,
    el('details', { className: 'calc-schedule', id: `${id}-schedule` }),
    reset,
  );
};

const resultCard = ({ key, kind, value }, index) =>
  el('div', { className: index === 0 ? 'calc-result main' : 'calc-result' }, [
    el('span', { className: 'calc-result-label', textContent: t(`result.${key}`) }),
    el('span', { className: 'calc-result-value', textContent: show(kind, value) }),
  ]);

const scheduleTable = (id, { columns, rows }) => {
  const head = el('tr', {}, columns.map(({ key }) => el('th', { scope: 'col', textContent: t(`column.${id}.${key}`) })));
  const body = rows.map((row) => el('tr', {}, columns.map(({ key, kind }) => el('td', { textContent: show(kind, row[key]) }))));
  return el('div', { className: 'calc-table-box' }, [el('table', { className: 'calc-table' }, [el('thead', {}, [head]), el('tbody', {}, body)])]);
};

const renderOne = (id) => {
  const section = $(id);
  const texts = textsOf(state, id, format);
  const choices = choicesOf(id, texts);
  const fields = shownFields(id, choices);
  const signature = [lang, format, resets, ...fields.map((field) => field.name), ...Object.values(choices)].join('|');
  if (built[id] !== signature) {
    buildForm(id, section, texts, fields);
    built[id] = signature;
  }
  const out = calculate(id, texts);
  for (const field of fields.filter((one) => one.kind !== 'choice')) {
    const error = out.errors?.[field.name];
    $(`${id}-${field.name}-error`).textContent = error ? textOf(error) : '';
    $(`${id}-${field.name}`).setAttribute('aria-invalid', String(Boolean(error)));
  }
  const results = $(`${id}-results`);
  const schedule = $(`${id}-schedule`);
  // A field that is not valid keeps the last results in sight, dimmed (CALC-15).
  results.toggleAttribute('data-stale', Boolean(out.errors));
  schedule.toggleAttribute('data-stale', Boolean(out.errors));
  if (out.errors) return;
  if (out.error) {
    results.replaceChildren(el('p', { className: 'calc-message', textContent: textOf(out.error) }));
    schedule.hidden = true;
    return;
  }
  results.replaceChildren(...out.results.map(resultCard));
  schedule.hidden = !out.table;
  if (out.table) {
    const open = schedule.open;
    schedule.replaceChildren(el('summary', { className: 'calc-schedule-title', textContent: t('calc.schedule') }), scheduleTable(id, out.table));
    schedule.open = open;
  }
};

export const renderCalculators = () => {
  for (const id of IDS) {
    $(id).hidden = id !== ui.view;
    renderOne(id);
  }
};
