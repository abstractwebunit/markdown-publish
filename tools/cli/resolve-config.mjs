import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

export const DEFAULTS = {
  vaultDir: '.',
  out: 'dist',
  buildMode: 'full',
  baseHref: '/',
  siteName: '',
  siteUrl: '',
  siteLang: 'en',
  siteDescription: '',
  siteFooter: '',
};

const FLAG_TO_KEY = {
  '--vault-dir': 'vaultDir',
  '--out': 'out',
  '--build-mode': 'buildMode',
  '--base-href': 'baseHref',
  '--site-name': 'siteName',
  '--site-url': 'siteUrl',
  '--site-lang': 'siteLang',
  '--site-description': 'siteDescription',
  '--site-footer': 'siteFooter',
};
// MP_-prefixed on purpose: hosting providers export their own generic vars
// (Netlify sets SITE_NAME to the site's random name, which silently stomped
// the user's config), so bare names are not safe to read from the environment.
const ENV_TO_KEY = {
  MP_SITE_NAME: 'siteName',
  MP_SITE_URL: 'siteUrl',
  MP_SITE_LANG: 'siteLang',
  MP_SITE_DESCRIPTION: 'siteDescription',
  MP_SITE_FOOTER: 'siteFooter',
  MP_BUILD_MODE: 'buildMode',
  MP_BASE_HREF: 'baseHref',
};

/** Parse CLI args (after the `build` subcommand) into a partial config. */
export function parseFlags(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--vault') out.vault = argv[++i];
    else if (a === '--config') out.configPath = argv[++i];
    else if (FLAG_TO_KEY[a]) out[FLAG_TO_KEY[a]] = argv[++i];
  }
  return out;
}

export function readConfigFile(path) {
  if (!path || !existsSync(path)) return {};
  return JSON.parse(readFileSync(path, 'utf8'));
}

/** Precedence: defaults < config file < env < flags. */
export function resolveConfig({ flags = {}, env = {}, cwd = '.' } = {}) {
  const configPath = resolve(cwd, flags.configPath ?? 'markdown-publish.config.json');
  const file = readConfigFile(configPath);
  const fromEnv = {};
  for (const [e, k] of Object.entries(ENV_TO_KEY)) {
    if (env[e] != null && env[e] !== '') fromEnv[k] = env[e];
  }
  const fromFlags = {};
  for (const k of Object.keys(DEFAULTS)) {
    if (flags[k] != null) fromFlags[k] = flags[k];
  }
  return {
    ...DEFAULTS,
    ...file,
    ...fromEnv,
    ...fromFlags,
    vault: flags.vault ?? file.vault ?? null,
  };
}
