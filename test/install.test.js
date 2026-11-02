'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const manifest = require('../package.json');

function prepareHome(context) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'kde-color-sync-'));
  context.after(() => fs.rmSync(home, { recursive: true, force: true }));
  return home;
}

function install(home) {
  return spawnSync('sh', [path.join(__dirname, '..', 'install.sh')], {
    encoding: 'utf8',
    env: { ...process.env, HOME: home },
  });
}

test('installer copies the extension to the versioned Code OSS directory', (context) => {
  const home = prepareHome(context);
  const result = install(home);
  const target = path.join(home, '.vscode', 'extensions', `${manifest.publisher.toLowerCase()}.${manifest.name}-${manifest.version}`);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(target, 'package.json'), 'utf8')), manifest);
  for (const filename of ['extension.js', 'palette.js', 'sync.js', 'README.md', 'LICENSE']) {
    assert.ok(fs.existsSync(path.join(target, filename)), filename);
  }
});

test('installer does not overwrite an existing installation', (context) => {
  const home = prepareHome(context);
  assert.equal(install(home).status, 0);
  const target = path.join(home, '.vscode', 'extensions', `${manifest.publisher.toLowerCase()}.${manifest.name}-${manifest.version}`);
  fs.writeFileSync(path.join(target, 'marker'), 'keep');
  const result = install(home);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Stop and Restore Colors/);
  assert.equal(fs.readFileSync(path.join(target, 'marker'), 'utf8'), 'keep');
});

test('installer refuses to install alongside earlier extension IDs', (context) => {
  for (const directory of ['local.kde-code-theme-0.1.0', 'evohl.kde-code-theme-0.1.0']) {
    const home = prepareHome(context);
    const old = path.join(home, '.vscode', 'extensions', directory);
    fs.mkdirSync(old, { recursive: true });
    const result = install(home);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Stop and Restore Colors/);
    assert.ok(fs.existsSync(old));
  }
});