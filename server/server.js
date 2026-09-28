import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { getConfig, validateConfig } from './config/env.js';
import { connectRedis } from './config/redis.js';
import { initSignalingServer } from './sockets/signaling.js';
import meetingRoutes from './routes/meetingRoutes.js';
import authRoutes from './routes/authRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import iceRoutes from './routes/iceRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();
const server = http.createServer(app);
const { port: PORT, corsOrigin, nodeEnv } = getConfig();
const allowedOrigins = corsOrigin.split(',').map((origin) => origin.trim()).filter(Boolean);

// CORS setup matching VITE frontend client server ports
app.use(cors({
  origin: (origin, callback) => {
    const localDevelopmentOrigin = nodeEnv !== 'production'
      && /^https?:\/\/(localhost|127\.0\.0\.1):3000$/.test(origin || '');
    callback(null, !origin || allowedOrigins.includes(origin) || localDevelopmentOrigin);
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());
app.use(requestLogger);

// Serve uploaded documents as static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Mount Meeting Routes
app.use('/api/meetings', meetingRoutes);

// Mount Team / Workspace Routes
app.use('/api/teams', teamRoutes);
app.use('/api/workspaces', teamRoutes);

// Mount Auth Routes
app.use('/api/auth', authRoutes);

// Mount Document Routes
app.use('/api/documents', documentRoutes);

// Mount WebRTC Dynamic ICE Server Routes (v1 API & base API)
app.use('/api/v1', iceRoutes);
app.use('/api', iceRoutes);

// Mount LiveKit Webhook Routes
app.use('/api/webhooks', webhookRoutes);

// Main Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      server: 'UP',
      database: mongooseConnectionState(),
      cache: 'ioredis'
    }
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

// Helper for Mongo connection status mapping
function mongooseConnectionState() {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const states = ['DISCONNECTED', 'CONNECTED', 'CONNECTING', 'DISCONNECTING'];
  try {
    return states[mongoose.connection.readyState] || 'UNKNOWN';
  } catch {
    return 'NOT_INITIALIZED';
  }
}

// Websocket upgrade logic for signaling
const signalingServer = initSignalingServer(server);

server.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url, `http://${request.headers.host}`);
  
  if (pathname === '/signaling') {
    signalingServer.handleUpgrade(request, socket, head);
  } else {
    socket.destroy();
  }
});

// Startup Server initialization
async function startServer() {
  console.log('[System] Initializing backend services...');
  validateConfig();
  
  // Database connection
  await connectDB();
  
  await connectRedis();

  server.listen(PORT, () => {
    console.log(`=== Nexus Enterprise Workspace Service Active on Port ${PORT} ===`);
    console.log(`- API endpoints available at: http://localhost:${PORT}`);
    console.log(`- WS signaling server available at: ws://localhost:${PORT}/signaling`);
  });
}

startServer();
export default app;
