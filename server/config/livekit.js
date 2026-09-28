import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { getConfig } from './env.js';

let roomServiceClient = null;

export function getRoomServiceClient() {
  if (roomServiceClient) return roomServiceClient;
  const { liveKitApiKey: apiKey, liveKitApiSecret: apiSecret, liveKitApiUrl } = getConfig();
  const host = liveKitApiUrl || process.env.LIVEKIT_API_URL || 'http://localhost:7880';
  roomServiceClient = new RoomServiceClient(host, apiKey, apiSecret);
  return roomServiceClient;
}

export async function removeLiveKitParticipant(roomName, participantIdentity) {
  try {
    const svc = getRoomServiceClient();
    await svc.removeParticipant(roomName, participantIdentity);
    console.log(`[LiveKit] Participant ${participantIdentity} removed from room ${roomName}`);
    return true;
  } catch (err) {
    console.warn(`[LiveKit] removeParticipant warning for ${participantIdentity}:`, err.message);
    return false;
  }
}

/**
 * Generates a join token for a LiveKit room.
 * @param {string} roomName Name of the room/meeting
 * @param {string} participantIdentity Unique identity for the user
 * @param {object} options Optional flags (e.g. metadata)
 */
export async function generateLiveKitToken(roomName, participantIdentity, options = {}) {
  console.log(`[LiveKit] Creating connection token for Room: ${roomName}, User: ${participantIdentity}`);

  try {
    const { liveKitApiKey: apiKey, liveKitApiSecret: apiSecret, liveKitTokenTtl: tokenTtl } = getConfig();
    if (!apiKey || !apiSecret) {
      throw new Error('LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be configured');
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity,
      name: options.name || options.displayName,
      ttl: tokenTtl,
      metadata: JSON.stringify(options.metadata || {})
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: options.role === 'host',
      canSubscribe: options.role === 'host' || options.role === 'attendee',
      canPublishData: options.role === 'host'
    });

    const token = await at.toJwt();
    return token;
  } catch (err) {
    console.error('[LiveKit] Token generation failed:', err);
    throw err;
  }
}

