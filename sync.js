'use strict';

const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

function prepareSync(current, palette, previous) {
  const colors = { ...current };
  const state = previous ? {
    originals: { ...previous.originals },
    applied: { ...previous.applied },
    skipped: { ...previous.skipped },
  } : { originals: {}, applied: {}, skipped: {} };

  for (const [key, value] of Object.entries(palette)) {
    if (state.skipped[key]) continue;
    if (has(state.applied, key) && current[key] !== state.applied[key]) {
      state.skipped[key] = true;
      continue;
    }
    if (!has(state.originals, key)) {
      state.originals[key] = has(current, key) ? { present: true, value: current[key] } : { present: false };
    }
    colors[key] = value;
    state.applied[key] = value;
  }
  return { colors, state };
}

function restoreColors(current, state) {
  const colors = { ...current };
  for (const [key, original] of Object.entries(state.originals)) {
    if (state.skipped[key] || !has(state.applied, key) || current[key] !== state.applied[key]) continue;
    if (original.present) colors[key] = original.value;
    else delete colors[key];
  }
  return colors;
}

module.exports = { prepareSync, restoreColors };