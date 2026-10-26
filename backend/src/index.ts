import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { ENV } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { setupChatSockets } from './sockets/chat.socket.js';

// Load OpenAPI / Swagger Document safely across dev (tsx) and prod (dist)
const candidatePaths = [
  path.join(__dirname, 'docs/openapi.json'),
  path.resolve(process.cwd(), 'src/docs/openapi.json'),
  path.resolve(process.cwd(), '../docs/swagger/openapi.json'),
  path.resolve(process.cwd(), 'docs/swagger/openapi.json'),
];
const swaggerPath = candidatePaths.find((p) => fs.existsSync(p)) || candidatePaths[0];
let swaggerDocument: any = {};
try {
  swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
} catch (e) {
  console.warn('[Swagger] Warning: could not load openapi.json:', e);
}

// Route imports
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import discoveryRoutes from './routes/discovery.routes.js';
import swipeRoutes from './routes/swipe.routes.js';
import chatRoutes from './routes/chat.routes.js';
import aiRoutes from './routes/ai.routes.js';

const app = express();
const server = http.createServer(app);

import { setSocketIO } from './config/socket.js';

// Initialize Socket.io server
export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
setSocketIO(io);

// Middlewares
app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Cupid AI Backend',
    timestamp: new Date().toISOString(),
  });
});

// Swagger Interactive API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/api-docs.json', (_req, res) => {
  res.status(200).json(swaggerDocument);
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/discovery', discoveryRoutes);
app.use('/api/v1/swipes', swipeRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/ai', aiRoutes);

// Socket.io handlers
setupChatSockets(io);

// Global Error Handler
app.use(errorHandler);

// Start server on 0.0.0.0 to allow emulator & LAN device connections
server.listen(ENV.PORT, '0.0.0.0', () => {
  console.log(`
  ======================================================
  💘 CUPID AI DATING APP - BACKEND SERVER RUNNING
  ======================================================
  🚀 Port:         http://localhost:${ENV.PORT}
  📡 Health:       http://localhost:${ENV.PORT}/api/health
  📚 Swagger UI:   http://localhost:${ENV.PORT}/api-docs
  ⚡ WebSocket:    Socket.io server active on port ${ENV.PORT}
  🔒 Dev OTP:      ${ENV.ENABLE_DEV_OTP_BYPASS ? `Active (Bypass Code: ${ENV.DEV_OTP_CODE})` : 'Disabled'}
  🤖 Gemini AI:    ${ENV.GEMINI_API_KEY ? 'Configured' : 'Using Rule-based Fallback'}
  ======================================================
  `);
});
