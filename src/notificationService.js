import { WsManager } from './wsManager.js';

/**
 * High‑level service for sending notifications over WebSocket.
 */
class NotificationService {
  /**
   * @param {WsManager} wsManager
   * @param {import('winston').Logger} logger
   */
  constructor(wsManager, logger) {
    this.wsManager = wsManager;
    this.logger = logger;
  }

  /**
   * Broadcasts a notification payload to all clients.
   * @param {object} payload - Must be JSON‑serializable.
   */
  async broadcast(payload) {
    try {
      await this.wsManager.broadcast(payload);
      this.logger.info('Broadcasted notification: %o', payload);
    } catch (err) {
      this.logger.error('Broadcast failed: %s', err);
      throw err;
    }
  }

  /**
   * Sends a notification to a single client.
   * @param {string} connectionId
   * @param {object} payload
   */
  async sendTo(connectionId, payload) {
    try {
      await this.wsManager.sendTo(connectionId, payload);
      this.logger.info('Sent notification to %s: %o', connectionId, payload);
    } catch (err) {
      this.logger.error('Send to %s failed: %s', connectionId, err);
      throw err;
    }
  }

  /**
   * Gracefully shuts down the service.
   */
  async shutdown() {
    await this.wsManager.closeAll();
    this.logger.info('NotificationService shutdown complete');
  }
}

// Export a singleton that will be initialised in server.js
export default NotificationService;