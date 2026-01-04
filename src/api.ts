/**
 * PollosHermanos API Server - Phase 1
 * Entry point for REST API server
 */

import { WebUIServer } from './infrastructure/api/server';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

console.log('🐔 PollosHermanos - Iniciando Fase 1: API y Persistencia');
console.log('═'.repeat(60));

const server = new WebUIServer(PORT);
server.iniciar();
