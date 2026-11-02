'use strict';

const vscode = require('vscode');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { isDeepStrictEqual } = require('node:util');
const { mapPalette, readPalette } = require('./palette');
const { prepareSync, restoreColors } = require('./sync');

const STATE_KEY = 'kdeColorSync.savedColors';
const STOPPED_KEY = 'kdeColorSync.stopped';

function activate(context) {
  if (process.platform !== 'linux') return;

  const output = vscode.window.createOutputChannel('KDE Color Sync');
  context.subscriptions.push(output);
  let queue = Promise.resolve();
  let timer;
  let warned = false;

  function report(error) {
    output.appendLine(String(error.stack || error));
    if (!warned) {
      warned = true;
      vscode.window.showWarningMessage('KDE Color Sync: Could not synchronize KDE colors. See the KDE Color Sync output.');
    }
  }

  function enqueue(action) {
    queue = queue.then(action).catch(report);
    return queue;
  }

  async function synchronize() {
    if (context.globalState.get(STOPPED_KEY, false)) return;
    const palette = mapPalette(await readPalette());
    const config = vscode.workspace.getConfiguration('workbench');
    const currentValue = config.inspect('colorCustomizations').globalValue;
    const current = currentValue || {};
    const previous = context.globalState.get(STATE_KEY);
    const next = prepareSync(current, palette, previous);
    next.state.settingWasPresent = previous ? previous.settingWasPresent : currentValue !== undefined;

    await context.globalState.update(STATE_KEY, next.state);
    try {
      if (!isDeepStrictEqual(current, next.colors)) {
        await config.update('colorCustomizations', next.colors, vscode.ConfigurationTarget.Global);
      }
    } catch (error) {
      await context.globalState.update(STATE_KEY, previous);
      throw error;
    }
    warned = false;
  }

  async function restore() {
    const state = context.globalState.get(STATE_KEY);
    if (state) {
      const config = vscode.workspace.getConfiguration('workbench');
      const current = config.inspect('colorCustomizations').globalValue || {};
      const colors = restoreColors(current, state);
      const value = !state.settingWasPresent && Object.keys(colors).length === 0 ? undefined : colors;
      if (!isDeepStrictEqual(current, colors) || value === undefined) {
        await config.update('colorCustomizations', value, vscode.ConfigurationTarget.Global);
      }
    }
    await context.globalState.update(STOPPED_KEY, true);
    await context.globalState.update(STATE_KEY, undefined);
    vscode.window.showInformationMessage('KDE Color Sync stopped and managed colors restored.');
  }

  context.subscriptions.push(vscode.commands.registerCommand('kdeColorSync.start', () => enqueue(async () => {
    await context.globalState.update(STOPPED_KEY, false);
    await synchronize();
  })));
  context.subscriptions.push(vscode.commands.registerCommand('kdeColorSync.restore', () => enqueue(restore)));

  const configHome = process.env.XDG_CONFIG_HOME && path.isAbsolute(process.env.XDG_CONFIG_HOME)
    ? process.env.XDG_CONFIG_HOME : path.join(os.homedir(), '.config');
  try {
    const watcher = fs.watch(configHome, (event, filename) => {
      if (filename && filename.toString() !== 'kdeglobals') return;
      clearTimeout(timer);
      timer = setTimeout(() => enqueue(synchronize), 300);
    });
    watcher.on('error', report);
    context.subscriptions.push({ dispose: () => { clearTimeout(timer); watcher.close(); } });
  } catch (error) {
    report(error);
  }
  enqueue(synchronize);
}

module.exports = { activate };