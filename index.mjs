#!/usr/bin/env node

import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, '.env') });

import cors from 'cors';
import express from 'express';
import expressProxy from 'express-http-proxy';
import httpProxy from 'http-proxy';
import morgan from 'morgan';
import http from 'node:http';

import ngrok from '@ngrok/ngrok';
import { createServer } from 'vite';

// =============================================================================
// Proxy server
// =============================================================================

const PROXY_PORT = Number(process.argv[2]) || 1337;
const VITE_PORT = 5173;
const BACKEND_API_PORT = 5001;

const app = express();
const server = http.createServer(app);

// Configuration de http-proxy pour les WebSockets
const wsProxy = httpProxy.createProxyServer({
  target: `http://localhost:${VITE_PORT}`, // Adresse de votre backend pour les WebSockets
  ws: true
});

const profixy = (targetUrl) => (req, res, next) => {
  expressProxy(targetUrl)(req, res, (err) => {
    if (err instanceof AggregateError) {
      res.status(404).send('Not Found');
    } else {
      next(err);
    }
  });
};

server.on('upgrade', (req, socket, head) => {
  wsProxy.ws(req, socket, head, (err) => {
    if (err) {
      console.error('WebSocket proxy error:', err);
      socket.destroy();
    }
  });
});

app.use(cors());
app.use(morgan('dev'));

app.use('/api', profixy(`http://localhost:${BACKEND_API_PORT}`));
app.use('/', profixy(`http://localhost:${VITE_PORT}`)); 

server.listen(PROXY_PORT, () => console.log(`🌐 Proxy server listening on http://localhost:${PROXY_PORT}\n`));

// =============================================================================
// Main script
// =============================================================================

(async function () {
  console.log('\n');
  const viteConfigFile = path.resolve('vite.config.ts');

  if (!fs.existsSync(viteConfigFile)) {
    console.error('❌ Vite config file not found: ', viteConfigFile);
    process.exit(1);
  }

  // 1. Start ngrok tunnel
  const listener = await startNgrokTunnel(PROXY_PORT);

  // 2. Start Vite server
  await startViteServer(viteConfigFile, { backendUrl: `${listener.url()}/api` });

  console.log(`✅ HTTPS tunnel opened on: ${listener.url()}\n`);
})();

// process.stdin.resume();

// =============================================================================
// Functions
// =============================================================================

async function startNgrokTunnel(port) {
  return ngrok.forward({
    addr: port,
    authtoken: process.env.NGROK_AUTH_TOKEN,
    ...(process.env.NGROK_CUSTOM_DOMAIN && { domain: process.env.NGROK_CUSTOM_DOMAIN }),
  });
}

async function startViteServer(viteConfigFile, { backendUrl }) {
  console.log('⚡️ Starting Vite server with config file:\n  ', viteConfigFile, '\n');
  process.env.VITE_API_URL_NEW = backendUrl;
  const server = await createServer({
    configFile: viteConfigFile,
    server: {
      port: VITE_PORT,
    },
  });
  await server.listen();
  console.log(`⚡️ Vite server is running on http://localhost:${VITE_PORT}\n`);
}
