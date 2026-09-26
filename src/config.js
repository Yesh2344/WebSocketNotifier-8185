import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

/**
 * Loads configuration from JSON file and environment variables.
 * @returns {object} Merged configuration object.
 */
export function loadConfig() {
  // Load .env (if present)
  dotenv.config();

  const defaultConfigPath = path.resolve('config', 'default.json');
  let fileConfig = {};

  try {
    const raw = fs.readFileSync(defaultConfigPath, 'utf-8');
    fileConfig = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read default configuration:', err);
    process.exit(1);
  }

  // Merge env overrides (only shallow merge for simplicity)
  const envConfig = {
    http: {
      port: process.env.PORT ? Number(process.env.PORT) : undefined
    },
    websocket: {
      port: process.env.WS_PORT ? Number(process.env.WS_PORT) : undefined
    },
    log: {
      level: process.env.LOG_LEVEL
    }
  };

  // Helper to deep merge two objects
  const merge = (target, source) => {
    for (const key of Object.keys(source)) {
      if (source[key] !== undefined) {
        if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
          target[key] = merge(target[key] || {}, source[key]);
        } else {
          target[key] = source[key];
        }
      }
    }
    return target;
  };

  return merge(fileConfig, envConfig);
}