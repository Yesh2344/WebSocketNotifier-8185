import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { initLogger } from './logger.js';
import { loadConfig } from './config.js';
import { WsManager } from './wsManager.js';
import NotificationService from './notificationService.js';

// Resolve __dirname in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load configuration
const config = loadConfig();

// Initialise logger
const logger = initLogger(config.log);

// Initialise WebSocket manager
const wsManager = new WsManager({
  port: config.websocket.port,
  heartbeatIntervalMs: config.websocket.heartbeatIntervalMs,
  logger
});

// Initialise notification service (singleton)
const notificationService = new NotificationService(wsManager, logger);

// Create Express app
const app = express();

// Simple health‑check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Serve a static demo page (optional)
app.use('/static', express.static(path.join(__dirname, '..', 'public')));

// Graceful shutdown handling
function shutdown() {
  logger.info('Received termination signal – shutting down...');
  notificationService.shutdown()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error('Error during shutdown: %s', err);
      process.exit(1);
    });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start HTTP server
const httpServer = http.createServer(app);
httpServer.listen(config.http.port, () => {
  logger.info('HTTP server listening on port %d', config.http.port);
});

// Example usage: broadcast a start‑up message
notificationService.broadcast({
  type: 'INFO',
  title: 'Server started',
  body: `WebSocket listening on port ${config.websocket.port}`
}).catch((err) => logger.error('Initial broadcast failed: %s', err));

export { app, wsManager, notificationService };