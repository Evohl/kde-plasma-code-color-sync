'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { parseColor, mapPalette } = require('../palette');
const { prepareSync, restoreColors } = require('../sync');

test('parses valid KDE RGB colors and rejects invalid values', () => {
  assert.equal(parseColor(' 61, 212, 37\n'), '#3dd425');
  for (const color of ['256,0,0', '-1,2,3', '1,2', '1.5,2,3', '']) {
    assert.throws(() => parseColor(color));
  }
});

test('maps controls to KDE roles and preserves selection contrast', () => {
  const palette = { window: '#202020', windowText: '#dddddd', inactiveText: '#999999', inactiveTitle: '#303030', inactiveTitleText: '#777777', tooltip: '#404040', tooltipText: '#dddddd', view: '#111111', viewText: '#ffffff', viewHover: '#ff0000', button: '#222222', buttonText: '#eeeeee', buttonHover: '#00ff00', selection: '#00ff00', selectionText: '#000000', focus: '#aabbcc', link: '#ddeeff' };
  const colors = mapPalette(palette);
  assert.equal(colors['settings.textInputBackground'], '#111111');
  assert.equal(colors['settings.numberInputBackground'], '#111111');
  assert.equal(colors['settings.dropdownBackground'], '#222222');
  assert.equal(colors['terminal.background'], '#111111');
  assert.equal(colors['terminal.foreground'], '#ffffff');
  for (const key of ['sideBar.border', 'activityBar.border', 'modernActivityBar.border', 'surface.border', 'editor.border', 'editorGroup.border', 'panel.border', 'modernPanel.border', 'terminal.border', 'statusBar.border', 'titleBar.border']) {
    assert.equal(colors[key], '#444444', key);
  }
  assert.equal(colors['editor.selectionBackground'], '#00ff00');
  assert.equal(colors['editor.selectionForeground'], '#000000');
  assert.equal(colors['activityBarBadge.background'], '#00ff00');
  assert.equal(colors['activityBarBadge.foreground'], '#000000');
  assert.equal(colors['modernActivityBarItem.activeBackground'], '#166316');
  assert.equal(colors['modernActivityBarItem.activeForeground'], '#dddddd');
  assert.equal(colors['focusBorder'], '#aabbcc');
  assert.equal(colors['textLink.foreground'], '#ddeeff');
  assert.equal(colors['textPreformat.foreground'], '#dddddd');
  assert.equal(colors['textPreformat.background'], '#323232');
  assert.equal(colors['textPreformat.border'], '#444444');
  assert.equal(colors['titleBar.inactiveBackground'], '#303030');
  assert.equal(colors['titleBar.inactiveForeground'], '#777777');
  assert.equal(colors['commandCenter.inactiveForeground'], '#777777');
  assert.equal(colors['menubar.selectionBackground'], '#166316');
  assert.equal(colors['menubar.selectionForeground'], '#dddddd');
  assert.equal(colors['menu.background'], '#202020');
  assert.equal(colors['menu.foreground'], '#dddddd');
  assert.equal(colors['menu.selectionBackground'], '#166316');
  assert.equal(colors['menu.selectionForeground'], '#dddddd');
  assert.equal(colors['menu.separatorBackground'], '#444444');
  assert.equal(colors['menu.border'], '#444444');
  assert.equal(colors['editorHoverWidget.background'], '#404040');
  assert.equal(colors['editorHoverWidget.foreground'], '#dddddd');
  assert.equal(colors['button.hoverBackground'], '#1d431d');
  assert.equal(colors['list.activeSelectionBackground'], '#166316');
  assert.equal(colors['list.activeSelectionForeground'], '#dddddd');
  assert.equal(colors['list.inactiveSelectionBackground'], '#166316');
  assert.equal(colors['list.inactiveSelectionForeground'], '#dddddd');
  assert.equal(colors['list.hoverBackground'], '#411b1b');
  assert.equal(colors['list.hoverForeground'], '#dddddd');
  assert.equal(colors['quickInput.background'], '#202020');
  assert.equal(colors['quickInput.foreground'], '#dddddd');
  assert.equal(colors['quickInputTitle.background'], '#202020');
  assert.equal(colors['quickInputList.focusBackground'], '#166316');
  assert.equal(colors['quickInputList.focusForeground'], '#dddddd');
  assert.equal(colors['quickInputList.focusIconForeground'], '#dddddd');
  assert.equal(colors['pickerGroup.foreground'], '#999999');
  assert.equal(colors['pickerGroup.border'], '#444444');
  assert.equal(colors['toolbar.hoverBackground'], '#ff000026');
  assert.equal(colors['editor.hoverHighlightBackground'], '#ff000026');
  assert.equal(colors['settings.rowHoverBackground'], '#ff000026');
  assert.equal(colors['welcomePage.background'], '#111111');
  assert.equal(colors['welcomePage.tileBackground'], '#202020');
  assert.equal(colors['welcomePage.tileHoverBackground'], '#411b1b');
  assert.equal(colors['welcomePage.progress.background'], '#202020');
  assert.equal(colors['welcomePage.progress.foreground'], '#00ff00');
  const fallback = mapPalette({ ...palette, inactiveTitle: undefined, inactiveTitleText: undefined, tooltip: undefined, viewHover: undefined, buttonHover: undefined });
  assert.equal(fallback['titleBar.inactiveBackground'], '#202020');
  assert.equal(fallback['titleBar.inactiveForeground'], '#999999');
  assert.equal(fallback['editorHoverWidget.background'], '#111111');
  assert.equal(fallback['editorHoverWidget.foreground'], '#ffffff');
  assert.equal(fallback['list.hoverBackground'], '#35373a');
  assert.equal(fallback['welcomePage.tileHoverBackground'], '#35373a');
  const light = mapPalette({ ...palette, window: '#eeeeee', windowText: '#222222', selection: '#0000ff', selectionText: '#ffffff' });
  assert.equal(light['textPreformat.foreground'], '#222222');
  assert.equal(light['textPreformat.background'], '#e1e1e1');
  assert.equal(light['textPreformat.border'], '#d5d5d5');
  assert.equal(light['modernActivityBarItem.activeBackground'], '#a7a7f3');
  assert.equal(light['modernActivityBarItem.activeForeground'], '#222222');
  for (const key of ['sideBar.border', 'activityBar.border', 'modernActivityBar.border', 'surface.border', 'editor.border', 'editorGroup.border', 'panel.border', 'modernPanel.border', 'terminal.border', 'statusBar.border', 'titleBar.border']) {
    assert.equal(light[key], '#d5d5d5', key);
  }
  assert.equal(light['menu.background'], '#eeeeee');
  assert.equal(light['menu.foreground'], '#222222');
  assert.equal(light['menu.selectionBackground'], '#a7a7f3');
  assert.equal(light['menu.selectionForeground'], '#222222');
  assert.equal(light['menubar.selectionBackground'], '#a7a7f3');
  assert.equal(light['menubar.selectionForeground'], '#222222');
  assert.equal(light['quickInput.background'], '#eeeeee');
  assert.equal(light['quickInput.foreground'], '#222222');
  assert.equal(light['quickInputTitle.background'], '#eeeeee');
  assert.equal(light['quickInputList.focusBackground'], '#a7a7f3');
  assert.equal(light['quickInputList.focusForeground'], '#222222');
  assert.equal(light['quickInputList.focusIconForeground'], '#222222');
  assert.equal(light['pickerGroup.foreground'], '#999999');
  assert.equal(light['pickerGroup.border'], '#d5d5d5');
  assert.equal(light['welcomePage.tileBackground'], '#eeeeee');
  assert.equal(light['welcomePage.progress.foreground'], '#0000ff');
  assert.equal(light['activityBarBadge.background'], '#0000ff');
  assert.equal(light['activityBarBadge.foreground'], '#ffffff');
});

test('synchronization preserves unrelated settings and restores original values', () => {
  const current = { 'focusBorder': '#abcdef', 'custom.color': '#123456', '[My Theme]': { 'focusBorder': '#ffffff' } };
  const first = prepareSync(current, { 'focusBorder': '#00ff00', 'input.background': '#111111' });
  const second = prepareSync(first.colors, { 'focusBorder': '#ff0000', 'input.background': '#222222' }, first.state);
  assert.equal(second.colors['focusBorder'], '#ff0000');
  assert.deepEqual(restoreColors(second.colors, second.state), current);
});

test('manual changes are not overwritten or restored on subsequent syncs', () => {
  const first = prepareSync({}, { 'focusBorder': '#00ff00', 'input.background': '#111111' });
  const manual = { ...first.colors, 'focusBorder': '#abcdef' };
  const second = prepareSync(manual, { 'focusBorder': '#ff0000', 'input.background': '#222222' }, first.state);
  assert.equal(second.colors['focusBorder'], '#abcdef');
  assert.equal(second.colors['input.background'], '#222222');
  assert.deepEqual(restoreColors(second.colors, second.state), { 'focusBorder': '#abcdef' });
});

test('a manually deleted color stays deleted', () => {
  const first = prepareSync({ 'focusBorder': '#123456' }, { 'focusBorder': '#00ff00' });
  const second = prepareSync({}, { 'focusBorder': '#ff0000' }, first.state);
  assert.deepEqual(second.colors, {});
  assert.deepEqual(restoreColors(second.colors, second.state), {});
});