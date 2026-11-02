'use strict';

const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const run = promisify(execFile);

const roles = {
  window: ['Colors:Window', 'BackgroundNormal'],
  windowText: ['Colors:Window', 'ForegroundNormal'],
  view: ['Colors:View', 'BackgroundNormal'],
  viewText: ['Colors:View', 'ForegroundNormal'],
  button: ['Colors:Button', 'BackgroundNormal'],
  buttonText: ['Colors:Button', 'ForegroundNormal'],
  selection: ['Colors:Selection', 'BackgroundNormal'],
  selectionText: ['Colors:Selection', 'ForegroundNormal'],
  focus: ['Colors:View', 'DecorationFocus'],
  link: ['Colors:View', 'ForegroundLink'],
  inactiveText: ['Colors:Window', 'ForegroundInactive'],
  inactiveTitle: ['WM', 'inactiveBackground'],
  inactiveTitleText: ['WM', 'inactiveForeground'],
  tooltip: ['Colors:Tooltip', 'BackgroundNormal'],
  tooltipText: ['Colors:Tooltip', 'ForegroundNormal'],
  viewHover: ['Colors:View', 'DecorationHover'],
  buttonHover: ['Colors:Button', 'DecorationHover'],
};

const optionalRoles = new Set(['inactiveTitle', 'inactiveTitleText', 'tooltip', 'tooltipText', 'viewHover', 'buttonHover']);

function parseColor(value) {
  const parts = value.trim().split(',').map(part => part.trim());
  if (parts.length !== 3 || parts.some(part => !/^\d+$/.test(part) || Number(part) > 255)) {
    throw new Error(`Invalid KDE color: ${value}`);
  }
  return `#${parts.map(part => Number(part).toString(16).padStart(2, '0')).join('')}`;
}

async function readPalette() {
  const entries = await Promise.all(Object.entries(roles).map(async ([name, [group, key]]) => {
    const { stdout } = await run('kreadconfig6', ['--file', 'kdeglobals', '--group', group, '--key', key], {
      timeout: 5000,
      maxBuffer: 4096,
    });
    if (optionalRoles.has(name) && !stdout.trim()) {
      return [name, undefined];
    }
    return [name, parseColor(stdout)];
  }));
  return Object.fromEntries(entries);
}

function mixColors(background, overlay, amount) {
  const channels = [1, 3, 5].map(offset => {
    const base = Number.parseInt(background.slice(offset, offset + 2), 16);
    const tint = Number.parseInt(overlay.slice(offset, offset + 2), 16);
    return Math.round(base * (1 - amount) + tint * amount).toString(16).padStart(2, '0');
  });
  return `#${channels.join('')}`;
}

function mapPalette(palette) {
  const hover = palette.viewHover || palette.focus;
  const tooltipAvailable = palette.tooltip && palette.tooltipText;
  return {
    'focusBorder': palette.focus,
    'foreground': palette.windowText,
    'disabledForeground': palette.inactiveText,
    'editor.background': palette.view,
    'editor.foreground': palette.viewText,
    'editor.selectionBackground': palette.selection,
    'editor.selectionForeground': palette.selectionText,
    'selection.background': palette.selection,
    'sideBar.background': palette.window,
    'sideBar.foreground': palette.windowText,
    'activityBar.background': palette.window,
    'activityBar.foreground': palette.windowText,
    'activityBarBadge.background': palette.selection,
    'activityBarBadge.foreground': palette.selectionText,
    'modernActivityBarItem.activeBackground': mixColors(palette.window, palette.selection, 0.3),
    'modernActivityBarItem.activeForeground': palette.windowText,
    'panel.background': palette.window,
    'statusBar.background': palette.window,
    'statusBar.foreground': palette.windowText,
    'titleBar.activeBackground': palette.window,
    'titleBar.activeForeground': palette.windowText,
    'titleBar.inactiveBackground': palette.inactiveTitle || palette.window,
    'titleBar.inactiveForeground': palette.inactiveTitleText || palette.inactiveText,
    'commandCenter.inactiveForeground': palette.inactiveTitleText || palette.inactiveText,
    'menubar.selectionBackground': mixColors(palette.window, palette.selection, 0.3),
    'menubar.selectionForeground': palette.windowText,
    'menu.background': palette.window,
    'menu.foreground': palette.windowText,
    'menu.selectionBackground': mixColors(palette.window, palette.selection, 0.3),
    'menu.selectionForeground': palette.windowText,
    'menu.separatorBackground': mixColors(palette.window, palette.inactiveText, 0.3),
    'menu.border': mixColors(palette.window, palette.inactiveText, 0.3),
    'input.background': palette.view,
    'input.foreground': palette.viewText,
    'dropdown.background': palette.button,
    'dropdown.foreground': palette.buttonText,
    'button.background': palette.button,
    'button.foreground': palette.buttonText,
    'button.hoverBackground': mixColors(palette.button, palette.buttonHover || hover, 0.15),
    'list.activeSelectionBackground': mixColors(palette.window, palette.selection, 0.3),
    'list.activeSelectionForeground': palette.windowText,
    'list.inactiveSelectionBackground': mixColors(palette.window, palette.selection, 0.3),
    'list.inactiveSelectionForeground': palette.windowText,
    'list.hoverBackground': mixColors(palette.window, hover, 0.15),
    'list.hoverForeground': palette.windowText,
    'toolbar.hoverBackground': `${hover}26`,
    'editor.hoverHighlightBackground': `${hover}26`,
    'editorHoverWidget.background': tooltipAvailable ? palette.tooltip : palette.view,
    'editorHoverWidget.foreground': tooltipAvailable ? palette.tooltipText : palette.viewText,
    'settings.rowHoverBackground': `${hover}26`,
    'settings.textInputBackground': palette.view,
    'settings.textInputForeground': palette.viewText,
    'settings.numberInputBackground': palette.view,
    'settings.numberInputForeground': palette.viewText,
    'settings.dropdownBackground': palette.button,
    'settings.dropdownForeground': palette.buttonText,
    'textLink.foreground': palette.link,
    'progressBar.background': palette.focus,
    'welcomePage.background': palette.view,
    'welcomePage.tileBackground': palette.window,
    'welcomePage.tileHoverBackground': mixColors(palette.window, hover, 0.15),
    'welcomePage.progress.background': palette.window,
    'welcomePage.progress.foreground': palette.selection,
  };
}

module.exports = { mapPalette, parseColor, readPalette };