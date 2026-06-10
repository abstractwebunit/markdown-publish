import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveConfig, parseFlags } from './resolve-config.mjs';

test('defaults when nothing provided', () => {
  const c = resolveConfig({ flags: {}, env: {}, cwd: '/nope' });
  assert.equal(c.buildMode, 'full');
  assert.equal(c.siteLang, 'en');
  assert.equal(c.out, 'dist');
  assert.equal(c.vault, null);
});

test('env overrides defaults (MP_-prefixed only)', () => {
  const c = resolveConfig({ flags: {}, env: { MP_SITE_NAME: 'X', MP_BUILD_MODE: 'public' }, cwd: '/nope' });
  assert.equal(c.siteName, 'X');
  assert.equal(c.buildMode, 'public');
});

test('flags override env', () => {
  const c = resolveConfig({ flags: { siteName: 'Flag' }, env: { MP_SITE_NAME: 'Env' }, cwd: '/nope' });
  assert.equal(c.siteName, 'Flag');
});

test('bare provider env vars are ignored (Netlify sets SITE_NAME itself)', () => {
  const c = resolveConfig({ flags: {}, env: { SITE_NAME: 'magnificent-genie', SITE_URL: 'x' }, cwd: '/nope' });
  assert.equal(c.siteName, '');
  assert.equal(c.siteUrl, '');
});

test('parseFlags maps every flag', () => {
  const f = parseFlags([
    '--vault', 'v', '--out', 'o', '--site-name', 'N',
    '--site-url', 'U', '--site-lang', 'ru', '--build-mode', 'public',
  ]);
  assert.deepEqual(f, {
    vault: 'v', out: 'o', siteName: 'N', siteUrl: 'U', siteLang: 'ru', buildMode: 'public',
  });
});
