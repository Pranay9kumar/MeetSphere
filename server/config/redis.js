import Redis from 'ioredis';
import { getConfig } from './env.js';

let redisClient = null;
let redisPublisher = null;
let redisSubscriber = null;

const roomStateKey = (roomName) => `room:${roomName}:state`;

function isReady(client) {
  return client && client.status === 'ready';
}

export async function connectRedis() {
  const { redisUrl } = getConfig();
  if (!redisUrl) {
    console.warn('[Cache/Redis] REDIS_URL is not configured; continuing without Redis');
    return null;
  }
  console.log('[Cache/Redis] Initializing client connection...');

  try {
    redisClient = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      connectTimeout: 1000,
      retryStrategy: () => null
    });

    redisClient.on('error', (err) => {
      console.warn('[Cache/Redis] Client error (Server running without Redis cache):', err.message);
    });

    redisClient.on('connect', () => {
      console.log('[Cache/Redis] Client successfully connected to Redis');
    });

    await redisClient.connect();
    redisPublisher = redisClient.duplicate();
    redisSubscriber = redisClient.duplicate();
    await Promise.all([redisPublisher.connect(), redisSubscriber.connect()]);
    return redisClient;
  } catch (err) {
    console.warn('[Cache/Redis] Unavailable; continuing without Redis:', err.message);
    return null;
  }
}

export function getRedisClient() {
  return redisClient;
}

export async function setRoomState(roomName, state, ttlSeconds = 3600) {
  if (!isReady(redisClient)) return false;
  await redisClient.set(roomStateKey(roomName), JSON.stringify(state), 'EX', ttlSeconds);
  return true;
}

export async function getRoomState(roomName) {
  if (!isReady(redisClient)) return null;
  const state = await redisClient.get(roomStateKey(roomName));
  return state ? JSON.parse(state) : null;
}

export async function setActiveParticipantCount(roomName, count, ttlSeconds = 3600) {
  const state = (await getRoomState(roomName)) || {};
  return setRoomState(roomName, { ...state, participantCount: count }, ttlSeconds);
}

export async function getActiveParticipantCount(roomName) {
  const state = await getRoomState(roomName);
  return state?.participantCount || 0;
}

export async function setActiveHost(roomName, hostIdentity, ttlSeconds = 3600) {
  const state = (await getRoomState(roomName)) || {};
  return setRoomState(roomName, { ...state, hostIdentity }, ttlSeconds);
}

export async function getActiveHost(roomName) {
  const state = await getRoomState(roomName);
  return state?.hostIdentity || null;
}

export async function publishEvent(channel, event) {
  if (!isReady(redisPublisher)) return false;
  await redisPublisher.publish(channel, JSON.stringify(event));
  return true;
}

export async function subscribeToEvents(channel, handler) {
  if (!isReady(redisSubscriber)) return false;
  await redisSubscriber.subscribe(channel);
  redisSubscriber.on('message', (receivedChannel, message) => {
    if (receivedChannel === channel) handler(JSON.parse(message));
  });
  return true;
}
