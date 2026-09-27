import { WebSocketServer } from 'ws';
import { extractAccessToken, verifyAccessToken } from '../middleware/authMiddleware.js';
import { publishEvent, subscribeToEvents } from '../config/redis.js';
import { saveChatMessage, getRecentMessages } from '../services/chatService.js';
import { createCatchUpSummary } from '../services/catchUpSummaryService.js';
import { Meeting } from '../models/Meeting.js';

const OPEN = 1;
const processId = `${process.pid}-${Math.random().toString(36).slice(2)}`;

/**
 * Initializes the WebSocket signaling server for WebRTC.
 * @param {object} server HTTP server instance
 */
export function initSignalingServer(server) {
  console.log('[WebRTC Signaling] Initializing WebSocket signaling server...');

  const wss = new WebSocketServer({ noServer: true });

  const clients = new Set();
  const subscribedRooms = new Set();

  wss.on('connection', (ws, req) => {
    const clientIdentity = req.user.id;
    const client = { ws, identity: clientIdentity, room: null, handRaised: false, muted: false };
    clients.add(client);

    console.log(`[WebRTC Signaling] Authenticated connection established: ${clientIdentity}`);

    ws.on('message', async (message) => {
      try {
        const payload = JSON.parse(message);
        console.log(`[WebRTC Signaling] Received action: ${payload.type}`);

        switch (payload.type) {
          case 'join':
          case 'join-room':
            await joinRoom(client, payload.room, payload.requestId);
            break;

          case 'leave-room':
            await leaveRoom(client, payload.room, payload.requestId);
            break;

          case 'chat-message':
            await requireRoom(client, payload.room);
            {
              const messageData = await saveChatMessage({
                room: payload.room,
                senderId: clientIdentity,
                content: payload.content,
                messageType: payload.messageType
              });
              await emitRoomEvent(payload.room, clientIdentity, {
                type: 'chat-message',
                message: messageData,
                requestId: payload.requestId
              });
            }
            break;

          case 'hand-raise':
            await broadcastState(client, payload, 'raised', 'hand-raise');
            break;

          case 'mute-status-change':
            await broadcastState(client, payload, 'muted', 'mute-status-change');
            break;

          case 'request-catch-up-summary':
            await requireRoom(client, payload.room);
            {
              const messages = await getRecentMessages(payload.room, payload.limit);
              send(ws, {
                type: 'catch-up-summary',
                requestId: payload.requestId,
                summary: await createCatchUpSummary({
                  room: payload.room,
                  requestedBy: clientIdentity,
                  messages
                })
              });
            }
            break;

          case 'offer':
          case 'answer':
          case 'candidate':
            await requireRoom(client, client.room);
            const targetClient = [...clients].find((entry) => entry.identity === payload.target && entry.room === client.room);
            if (targetClient && targetClient.ws.readyState === OPEN) {
              send(targetClient.ws, {
                ...payload,
                sender: clientIdentity
              });
            }
            break;

          default:
            sendError(ws, 'Unsupported event type', payload.requestId);
        }
      } catch (err) {
        console.error('[WebRTC Signaling] Error processing message:', err.message);
        sendError(ws, err.message, payload?.requestId);
      }
    });

    ws.on('close', () => {
      leaveRoom(client, client.room).catch((err) => console.error('[WebRTC Signaling] Close cleanup failed:', err.message));
      clients.delete(client);
    });
  });

  async function joinRoom(client, roomName, requestId) {
    validateRoom(roomName);
    if (client.room === roomName) {
      send(client.ws, { type: 'room-joined', room: roomName, requestId });
      return;
    }
    if (client.room) await leaveRoom(client, client.room);
    client.room = roomName;
    await Meeting.updateOne(
      { roomName },
      { $push: { participants: { userId: clientIdentity, name: clientIdentity, joinedAt: new Date() } } }
    ).catch((err) => console.warn('[WebRTC Signaling] Participant roster update failed:', err.message));
    await ensureRoomSubscription(roomName);
    send(client.ws, {
      type: 'room-joined',
      room: roomName,
      participantIds: [...clients].filter((entry) => entry.room === roomName).map((entry) => entry.identity),
      requestId
    });
    await emitRoomEvent(roomName, client.identity, {
      type: 'user-joined',
      userId: client.identity,
      peerId: client.identity
    });
  }

  async function leaveRoom(client, roomName, requestId) {
    if (!roomName || client.room !== roomName) return;
    client.room = null;
    await Meeting.updateOne(
      { roomName },
      { $set: { 'participants.$[participant].leftAt': new Date() } },
      { arrayFilters: [{ 'participant.userId': client.identity, 'participant.leftAt': null }] }
    ).catch((err) => console.warn('[WebRTC Signaling] Participant roster cleanup failed:', err.message));
    await emitRoomEvent(roomName, client.identity, {
      type: 'user-left',
      peerId: client.identity,
      userId: client.identity
    });
    send(client.ws, { type: 'room-left', room: roomName, requestId });
  }

  async function requireRoom(client, roomName) {
    validateRoom(roomName);
    if (client.room !== roomName) throw new Error('Join the room before sending room events');
  }

  async function broadcastState(client, payload, field, type) {
    await requireRoom(client, payload.room);
    if (typeof payload[field] !== 'boolean') throw new Error(`${field} must be boolean`);
    client[field === 'raised' ? 'handRaised' : 'muted'] = payload[field];
    await emitRoomEvent(payload.room, client.identity, {
      type,
      userId: client.identity,
      [field]: payload[field],
      requestId: payload.requestId
    });
  }

  async function ensureRoomSubscription(roomName) {
    if (subscribedRooms.has(roomName)) return;
    subscribedRooms.add(roomName);
    await subscribeToEvents(`signaling:room:${roomName}`, (event) => {
      if (event.origin !== processId) broadcastToRoom(roomName, null, event.payload);
    });
  }

  async function emitRoomEvent(roomName, senderIdentity, payload) {
    broadcastToRoom(roomName, null, payload);
    await ensureRoomSubscription(roomName);
    await publishEvent(`signaling:room:${roomName}`, {
      origin: processId,
      senderIdentity,
      payload
    });
  }

  function broadcastToRoom(roomName, excludedIdentity, data) {
    clients.forEach((client) => {
      if (client.room === roomName && client.identity !== excludedIdentity && client.ws.readyState === OPEN) {
        send(client.ws, data);
      }
    });
  }

  function validateRoom(roomName) {
    if (typeof roomName !== 'string' || !roomName.trim() || roomName.length > 200) {
      throw new Error('A valid room is required');
    }
  }

  function send(ws, data) {
    if (ws.readyState === OPEN) ws.send(JSON.stringify(data));
  }

  function sendError(ws, error, requestId) {
    send(ws, { type: 'error', error, requestId });
  }

  // Handle upgrade event from main server.js
  return {
    handleUpgrade: (request, socket, head) => {
      try {
        const decoded = verifyAccessToken(extractAccessToken(request));
        request.user = { id: decoded.id };
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      } catch (err) {
        socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n');
        socket.destroy();
        console.warn(`[WebRTC Signaling] Rejected unauthenticated connection: ${err.message}`);
      }
    }
  };
}
