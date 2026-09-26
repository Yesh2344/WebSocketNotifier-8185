import { WsManager } from '../src/wsManager.js';
import NotificationService from '../src/notificationService.js';
import { initLogger } from '../src/logger.js';
import { createServer } from 'http';
import WebSocket from 'ws';

const logger = initLogger({ level: 'error', file: 'logs/test.log' });

describe('NotificationService', () => {
  let wsManager;
  let service;
  let httpServer;
  let wsClient;

  beforeAll((done) => {
    // Start a temporary WS server on an unused port
    wsManager = new WsManager({
      port: 0, // 0 => random free port
      logger,
      heartbeatIntervalMs: 1000
    });

    wsManager.wss.on('listening', () => {
      const port = wsManager.wss.address().port;
      service = new NotificationService(wsManager, logger);

      // Connect a client
      wsClient = new WebSocket(`ws://localhost:${port}`);
      wsClient.on('open', () => done());
    });
  });

  afterAll(async () => {
    wsClient.close();
    await service.shutdown();
    wsManager.wss.close();
  });

  test('broadcast delivers message to all clients', (done) => {
    const payload = { type: 'TEST', message: 'Hello world' };

    wsClient.once('message', (data) => {
      const received = JSON.parse(data);
      expect(received).toMatchObject(payload);
      done();
    });

    service.broadcast(payload).catch(done);
  });

  test('sendTo delivers message to specific client', (done) => {
    const payload = { type: 'PRIVATE', message: 'Secret' };
    const targetId = [...wsManager.clients.keys()][0];

    wsClient.once('message', (data) => {
      const received = JSON.parse(data);
      expect(received).toMatchObject(payload);
      done();
    });

    service.sendTo(targetId, payload).catch(done);
  });
});