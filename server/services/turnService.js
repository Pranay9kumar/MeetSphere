import crypto from 'crypto';
import { getConfig } from '../config/env.js';

/**
 * Generate time-limited STUN/TURN ICE server configuration credentials for WebRTC clients.
 * Implements standard coturn REST API HMAC-SHA1 dynamic authorization specification.
 *
 * @param {Object} options
 * @param {string} [options.userId] - Optional user identifier for token tracing
 * @param {number} [options.ttlSeconds] - Custom time-to-live duration in seconds
 * @returns {Object} ICE servers payload containing STUN/TURN URIs and ephemeral credentials
 */
export function getIceServers({ userId = 'meetsphere_user', ttlSeconds } = {}) {
  const config = getConfig();
  const secret = config.turnStaticAuthSecret || process.env.TURN_STATIC_AUTH_SECRET || 'meetsphere-turn-static-auth-secret-2026-key';
  const domain = config.turnDomain || process.env.TURN_DOMAIN || 'localhost';
  const port = Number(config.turnPort || process.env.TURN_PORT || 3478);
  const tlsPort = Number(config.turnTlsPort || process.env.TURN_TLS_PORT || 5349);
  const ttl = ttlSeconds || Number(config.turnTtl || process.env.TURN_TTL || 86400);

  // Default public Google STUN server as base candidate source
  const defaultStun = {
    urls: [
      'stun:stun.l.google.com:19302',
      `stun:${domain}:${port}`
    ]
  };

  if (!secret) {
    console.warn('[turnService] TURN_STATIC_AUTH_SECRET not configured. Returning STUN fallback server only.');
    return {
      iceServers: [defaultStun],
      ttl: 0,
      timestamp: new Date().toISOString()
    };
  }

  // Coturn REST API Time-bound HMAC signature calculation
  // Unix timestamp calculation for credential expiration
  const unixTimestamp = Math.floor(Date.now() / 1000) + ttl;
  
  // Clean username string format: unix_timestamp:user_identifier
  const username = `${unixTimestamp}:${userId}`;

  // HMAC-SHA1 signature using static auth secret
  const hmac = crypto.createHmac('sha1', secret);
  hmac.update(username);
  const credential = hmac.digest('base64');

  const turnIceServer = {
    urls: [
      `turn:${domain}:${port}?transport=udp`,
      `turn:${domain}:${port}?transport=tcp`,
      `turns:${domain}:${tlsPort}?transport=tcp`
    ],
    username,
    credential,
    ttl
  };

  return {
    iceServers: [
      defaultStun,
      turnIceServer
    ],
    username,
    credential,
    ttl,
    expiresAt: new Date(unixTimestamp * 1000).toISOString()
  };
}

export default {
  getIceServers
};
