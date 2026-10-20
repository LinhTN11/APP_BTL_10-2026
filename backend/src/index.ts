import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { ENV } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { setupChatSockets } from './sockets/chat.socket.js';

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

// Start server
server.listen(ENV.PORT, () => {
  console.log(`
  ======================================================
  💘 CUPID AI DATING APP - BACKEND SERVER RUNNING
  ======================================================
  🚀 Port:         http://localhost:${ENV.PORT}
  📡 Health:       http://localhost:${ENV.PORT}/api/health
  ⚡ WebSocket:    Socket.io server active on port ${ENV.PORT}
  🔒 Dev OTP:      ${ENV.ENABLE_DEV_OTP_BYPASS ? `Active (Bypass Code: ${ENV.DEV_OTP_CODE})` : 'Disabled'}
  🤖 Gemini AI:    ${ENV.GEMINI_API_KEY ? 'Configured' : 'Using Rule-based Fallback'}
  ======================================================
  `);
});
