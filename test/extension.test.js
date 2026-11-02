'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const fs = require('node:fs');
const Module = require('node:module');
const palette = require('../palette');

test('extension syncs, observes KDE changes, respects edits and restores safely', async () => {
  const originalLoad = Module._load;
  const originalWatch = fs.watch;
  const originalRead = palette.readPalette;
  const commands = new Map();
  const state = new Map();
  const messages = [];
  const watcher = new EventEmitter();
  let watchCallback;
  let onUpdate;
  let color = '#3dd425';
  let settings = { 'focusBorder': '#abcdef', 'terminal.background': '#010203', 'panel.border': '#101010', 'textPreformat.background': '#111111', 'custom.color': '#123456' };
  const initial = { ...settings };
  const vscode = {
    ConfigurationTarget: { Global: 1 },
    commands: { registerCommand(name, callback) { commands.set(name, callback); return { dispose() {} }; } },
    workspace: { getConfiguration() { return {
      inspect() { return { globalValue: settings }; },
      async update(key, value, target) {
        assert.equal(key, 'colorCustomizations');
        assert.equal(target, 1);
        settings = value;
        if (onUpdate) onUpdate();
      },
    }; } },
    window: {
      createOutputChannel() { return { appendLine(message) { messages.push(message); }, dispose() {} }; },
      showWarningMessage(message) { messages.push(message); },
      showInformationMessage(message) { messages.push(message); },
    },
  };
  watcher.close = () => {};
  fs.watch = (directory, callback) => { watchCallback = callback; return watcher; };
  palette.readPalette = async () => ({
    window: '#202020', windowText: '#ffffff', view: '#303030', viewText: '#eeeeee',
    button: '#404040', buttonText: '#eeeeee', selection: color, selectionText: '#000000',
    focus: color, link: '#00aaff', inactiveText: '#999999',
  });
  Module._load = function(request, ...args) {
    return request === 'vscode' ? vscode : originalLoad.call(this, request, ...args);
  };

  const context = {
    subscriptions: [],
    globalState: {
      get(key, fallback) { return state.has(key) ? state.get(key) : fallback; },
      async update(key, value) { if (value === undefined) state.delete(key); else state.set(key, value); },
    },
  };

  try {
    const { activate } = require('../extension');
    activate(context);
    await commands.get('kdeColorSync.start')();
    assert.equal(settings.focusBorder, '#3dd425');
    assert.equal(settings['input.background'], '#303030');
    assert.equal(settings['terminal.background'], '#303030');
    assert.equal(settings['terminal.foreground'], '#eeeeee');
    assert.equal(settings['panel.border'], '#444444');
    assert.equal(settings['textPreformat.foreground'], '#ffffff');
    assert.equal(settings['textPreformat.background'], '#323232');
    assert.equal(settings['textPreformat.border'], '#444444');

    settings.focusBorder = '#123abc';
    settings['terminal.background'] = '#445566';
    settings['textPreformat.foreground'] = '#aabbcc';
    color = '#ff0000';
    const updated = new Promise(resolve => { onUpdate = resolve; });
    watchCallback('rename', 'kdeglobals');
    await updated;
    onUpdate = undefined;
    assert.equal(settings.focusBorder, '#123abc');
    assert.equal(settings['terminal.background'], '#445566');
    assert.equal(settings['textPreformat.foreground'], '#aabbcc');
    assert.equal(settings['editor.selectionBackground'], '#ff0000');

    await commands.get('kdeColorSync.restore')();
    assert.deepEqual(settings, { ...initial, focusBorder: '#123abc', 'terminal.background': '#445566', 'textPreformat.foreground': '#aabbcc' });
    assert.equal(state.get('kdeColorSync.stopped'), true);
    assert.equal(state.has('kdeColorSync.savedColors'), false);
    assert.equal(messages.some(message => /Could not synchronize/.test(message)), false);
  } finally {
    for (const subscription of context.subscriptions) subscription.dispose();
    Module._load = originalLoad;
    fs.watch = originalWatch;
    palette.readPalette = originalRead;
  }
});