import yaml from 'js-yaml';
import type { ProblemConfigFile } from 'vj/../hydrooj/src/interface';

export default function reducer(state = { type: 'default' } as ProblemConfigFile, action): ProblemConfigFile {
  switch (action.type) {
  case 'CONFIG_LOAD_FULFILLED': {
    // TODO set yaml schema
    return { ...state, ...yaml.load(action.payload.config) as object };
  }
  case 'CONFIG_FORM_UPDATE': {
    const next = { ...state, [action.key]: action.value };
    if (!action.value || (typeof action.value === 'object' && !action.value.join(''))) delete next[action.key];
    if (action.key === 'type' && action.value !== 'default') {
      delete next.checker_type;
      delete next.checker;
    }
    if (action.key === 'type' && action.value !== 'interactive') delete next.interactor;
    if (action.key === 'checker_type' && ['default', 'strict'].includes(action.value)) delete next.checker;
    return next;
  }
  case 'CONFIG_CODE_UPDATE': {
    try {
      return yaml.load(action.payload);
    } catch {
      return state;
    }
  }
  case 'CONFIG_AUTOCASES_UPDATE': {
    if (!action.value) return { ...state, cases: [] };
    const next = state;
    delete next.cases;
    delete next.subtasks;
    return next;
  }
  case 'CONFIG_SUBTASKS_SWITCH': {
    const next = state;
    next.subtasks = next.cases;
    if (!next.subtasks.length) next.subtasks.push({ id: 0 });
    delete next.cases;
    return next;
  }
  case 'CONFIG_CASES_UPDATE': {
    const next = state;
    if (action.key === 'cases-add') next.cases.push(action.value);
    else if (action.key === 'cases-delete') {
      next.cases = next.cases.filter((k, v) => v !== action.value);
    }
    return next;
  }
  case 'CONFIG_SUBTASK_UPDATE': {
    const next = state;
    if (action.key === 'add') next.subtasks.splice(action.id, 0, { id: 0 });
    else if (action.key === 'delete') delete next.subtasks[action.key];
    else if (action.key === 'cases-add') next.subtasks[action.id].cases.push(action.value);
    else if (action.key === 'cases-delete') {
      next.subtasks[action.id].cases = next.subtasks[action.id].cases.filter((k, v) => v !== action.value);
    } else next.subtasks[action.id][action.key] = action.value;
    return next;
  }
  default:
    return state;
  }
}