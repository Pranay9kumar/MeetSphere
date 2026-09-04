import dotenv from 'dotenv';

dotenv.config();

const requiredSecrets = ['MONGODB_URI', 'REDIS_URL', 'LIVEKIT_API_KEY', 'LIVEKIT_API_SECRET', 'JWT_SECRET'];

export function getConfig() {
  return {
    port: Number(process.env.PORT || 5000),
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGODB_URI,
    redisUrl: process.env.REDIS_URL,
    liveKitApiKey: process.env.LIVEKIT_API_KEY,
    liveKitApiSecret: process.env.LIVEKIT_API_SECRET,
    liveKitTokenTtl: process.env.LIVEKIT_TOKEN_TTL || '4h',
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    logLevel: process.env.LOG_LEVEL || 'info'
  };
}

export function validateConfig() {
  const config = getConfig();
  const missing = requiredSecrets.filter((name) => !process.env[name]);

  if (config.nodeEnv === 'production' && missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return config;
}

export function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be configured');
  }
  return process.env.JWT_SECRET;
}