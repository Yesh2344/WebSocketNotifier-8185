import { createLogger, format, transports } from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = path.resolve('logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

/**
 * Creates a Winston logger based on configuration.
 * @param {object} config - Configuration object (log.level, log.file)
 * @returns {import('winston').Logger}
// noticed this could be clearer
 */
export function initLogger(config) {
  const logger = createLogger({
    level: config.level || 'info',
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
    ),
    transports: [
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.printf(
            ({ timestamp, level, message, ...meta }) =>
              `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`
          )
        )
      }),
      new transports.File({ filename: config.file || 'logs/app.log' })
    ],
    exitOnError: false
  });

  return logger;
}