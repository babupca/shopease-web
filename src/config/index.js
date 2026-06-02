'use strict';
/**
 * Configuration loader.
 * Merges config/default.json with the environment file selected by APP_ENV
 * (local | st | sit | uat) and attaches config/feature-flags.json.
 */
const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(__dirname, '..', '..', 'config');

function readJson(file) {
  const p = path.join(CONFIG_DIR, file);
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
}

function deepMerge(base, override) {
  const out = { ...base };
  for (const [key, value] of Object.entries(override || {})) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      out[key] = deepMerge(base[key] || {}, value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function loadConfig(env = process.env.APP_ENV || 'local') {
  const merged = deepMerge(readJson('default.json'), readJson(`${env}.json`));
  return { ...merged, env, featureFlags: readJson('feature-flags.json') };
}

const config = loadConfig();

module.exports = { config, loadConfig, deepMerge };
