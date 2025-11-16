#!/usr/bin/env node

import minimist from 'minimist';
import { Server } from '../Server';

// Parse command line arguments (filter out '--' separator if present)
const args = process.argv.slice(2).filter((arg) => arg !== '--');
const argv = minimist(args, {
  string: ['host', 'h'],
  alias: {
    p: 'port',
    h: 'host',
  },
});

// Parse port as number (minimist returns strings by default)
const portArg = argv.port ?? argv.p;
const portNumber = portArg ? parseInt(String(portArg), 10) : undefined;

// Use environment variables as fallback, then defaults
const finalPort = portNumber && !isNaN(portNumber) ? portNumber : (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);
const finalHost = argv.host ?? argv.h ?? process.env.HOST ?? '0.0.0.0';

const server = new Server({ port: finalPort, host: finalHost });

server
  .start()
  .then(() => {
    console.log('[Server] Server started successfully');
  })
  .catch((error) => {
    console.error('[Server] Failed to start server:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n[Server] Shutting down...');
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n[Server] Shutting down...');
  await server.stop();
  process.exit(0);
});

