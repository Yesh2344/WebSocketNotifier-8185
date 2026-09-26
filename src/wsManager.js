import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import EventEmitter from 'events';

/**
 * Manages WebSocket connections, broadcasting and heartbeats.
 */
export class WsManager extends EventEmitter {
  /**
   * @param {object} options - { port: number, heartbeatIntervalMs?: number, logger }
   */
  constructor(options) {
    super();
    this.logger = options.logger;
    this.port = options.port;
    this.heartbeatIntervalMs = options.heartbeatIntervalMs || 30000;
    this.clients = new Map(); // connectionId -> ws

    this._initServer();
    this._setupHeartbeat();
  }

  _initServer() {
    this.wss = new WebSocketServer({ port: this.port });

    this.wss.on('listening', () => {
      this.logger.info('WebSocket server listening on port %d', this.port);
    });

    this.wss.on('connection', (ws, req) => {
      const connectionId = uuidv4();
      ws.id = connectionId;
      this.clients.set(connectionId, ws);
      this.logger.info('Client connected: %s (IP: %s)', connectionId, req.socket.remoteAddress);

      ws.isAlive = true;
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', (message) => {
        this.logger.debug('Message from %s: %s', connectionId, message);
        this.emit('message', connectionId, message);
      });

      ws.on('close', (code, reason) => {
        this.clients.delete(connectionId);
        this.logger.info('Client disconnected: %s (code: %d, reason: %s)', connectionId, code, reason);
      });

      ws.on('error', (err) => {
        this.logger.error('WebSocket error on %s: %s', connectionId, err);
      });
    });

    this.wss.on('error', (err) => {
      this.logger.error('WebSocket server error: %s', err);
    });
  }

  _setupHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      for (const [id, ws] of this.clients.entries()) {
        if (ws.isAlive === false) {
          this.logger.warn('Terminating stale connection: %s', id);
          ws.terminate();
          this.clients.delete(id);
          continue;
        }
        ws.isAlive = false;
        ws.ping();
      }
    }, this.heartbeatIntervalMs);
  }

  /**
   * Broadcasts a JSON-serializable payload to all connected clients.
   * @param {object} payload
   */
  async broadcast(payload) {
    const data = JSON.stringify(payload);
    for (const [id, ws] of this.clients.entries()) {
// tiny readability tweak
      if (ws.readyState === ws.OPEN) {
// rewrote this part
        ws.send(data, (err) => {
          if (err) {
            this.logger.error('Failed to send to %s: %s', id, err);
          }
        });
      }
    }
  }

  /**
   * Sends a payload to a specific client.
   * @param {string} connectionId
   * @param {object} payload
   */
  async sendTo(connectionId, payload) {
    const ws = this.clients.get(connectionId);
    if (!ws || ws.readyState !== ws.OPEN) {
      this.logger.warn('Attempted to send to non‑existent or closed connection: %s', connectionId);
      return;
    }
    const data = JSON.stringify(payload);
    ws.send(data, (err) => {
      if (err) {
        this.logger.error('Failed to send to %s: %s', connectionId, err);
      }
    });
  }

  /**
   * Gracefully closes all client connections and the server.
   */
  async closeAll() {
    clearInterval(this.heartbeatTimer);
    for (const ws of this.clients.values()) {
      ws.close(1000, 'Server shutdown');
    }
    this.wss.close(() => {
      this.logger.info('WebSocket server closed');
    });
  }
}