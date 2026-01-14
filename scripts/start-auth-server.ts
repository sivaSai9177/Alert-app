#!/usr/bin/env bun

import express from 'express';
import cors from 'cors';
import { auth } from '../lib/auth/auth';
import { toNodeHandler } from 'better-auth/node';

const app = express();
const PORT = process.env.AUTH_SERVER_PORT || 3333;

// Configure CORS for OAuth
app.use(cors({
  origin: [
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:3000',
    'https://auth.expo.io',
    /^https:\/\/.*\.ngrok-free\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// Parse JSON bodies
app.use(express.json());

// Better Auth handler
app.all('/api/auth/*', toNodeHandler(auth));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Auth server is running' });
});

// Start server
app.listen(PORT, () => {
// TODO: Replace with structured logging - console.log(`🔐 Auth server running on http://localhost:${PORT}`);
// TODO: Replace with structured logging - console.log(`📍 Auth endpoints available at http://localhost:${PORT}/api/auth/*`);
// TODO: Replace with structured logging - console.log(`🏥 Health check at http://localhost:${PORT}/health`);
// TODO: Replace with structured logging - console.log('\n🌐 OAuth redirect URI: http://localhost:8081/api/auth/callback/google');
// TODO: Replace with structured logging - console.log('   (This will proxy to the auth server)\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
// TODO: Replace with structured logging - console.log('\n🛑 Shutting down auth server...');
  process.exit(0);
});