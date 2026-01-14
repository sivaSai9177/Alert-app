#!/usr/bin/env node

/**
 * Node.js wrapper to run the TypeScript API server
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

// Register TypeScript support
require('esbuild-register/dist/node').register({
  target: 'node18',
  format: 'cjs'
});

// Load and run the API server
require('./start-complete-api-server.ts');