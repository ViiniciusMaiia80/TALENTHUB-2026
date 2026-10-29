import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';

const children = [];
const logs = [];
const pythonBinary = process.env.PYTHON || (existsSync('.venv/bin/python') ? '.venv/bin/python' : 'python3');

function start(command, args) {
  const child = spawn(command, args, {
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  children.push(child);
  child.stdout.on('data', (data) => logs.push(data.toString()));
  child.stderr.on('data', (data) => logs.push(data.toString()));
  return child;
}

async function waitForServer(url, child, label) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`${label} encerrou antes de iniciar.\n${logs.join('')}`);
    }
    try {
      return await fetch(url);
    } catch {
      await delay(500);
    }
  }
  throw new Error(`Tempo esgotado aguardando ${label}.\n${logs.join('')}`);
}

try {
  const backend = start(pythonBinary, [
    'manage.py',
    'runserver',
    '127.0.0.1:8000',
    '--noreload',
  ]);
  const backendResponse = await waitForServer('http://127.0.0.1:8000/api/challenges/', backend, 'Django');
  if (!backendResponse.ok) {
    throw new Error(`API Django respondeu com HTTP ${backendResponse.status}.`);
  }

  const frontend = start(process.execPath, [
    'node_modules/vite/bin/vite.js',
    '--host',
    '127.0.0.1',
    '--port',
    '5173',
    '--strictPort',
  ]);
  const pageResponse = await waitForServer('http://127.0.0.1:5173/', frontend, 'Vite');
  if (!pageResponse.ok || !(await pageResponse.text()).includes('/src/main.jsx')) {
    throw new Error('O servidor Vite não entregou a página da aplicação.');
  }

  const apiResponse = await fetch('http://127.0.0.1:5173/api/challenges/');
  const contentType = apiResponse.headers.get('content-type') || '';
  if (!apiResponse.ok || !contentType.includes('application/json')) {
    throw new Error(`Proxy frontend/API respondeu com HTTP ${apiResponse.status} (${contentType}).`);
  }
  const challenges = await apiResponse.json();
  if (!Array.isArray(challenges)) {
    throw new Error('A API proxied pelo frontend não retornou a lista de desafios esperada.');
  }
  console.log('Smoke test aprovado: Vite entregou a aplicação e encaminhou /api/challenges/ ao Django.');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  for (const child of children) {
    if (child.exitCode === null) child.kill('SIGTERM');
  }
}
