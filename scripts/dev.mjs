/**
 * scripts/dev.mjs — desarrollo local sin dependencias (decisión GATE 1/Q5).
 * Lanza: (1) npm run watch:css  → recompila assets/css/main.css en caliente
 *        (2) node scripts/serve.mjs → servidor estático en :8080
 * Ctrl+C (SIGINT) detiene los dos (en Windows, taskkill /T para matar el árbol npm).
 */
import { spawn, execSync } from 'node:child_process';

const children = [];
let shuttingDown = false;

function launch(label, cmd, args) {
  const child = spawn(cmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    console.error(`[dev] "${label}" terminó inesperadamente (${signal || `code ${code}`}).`);
    shutdown(typeof code === 'number' && code !== 0 ? code : 1);
  });
  children.push({ label, child });
  return child;
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const { label, child } of children) {
    if (child.exitCode !== null || child.signalCode !== null) continue;
    try {
      if (process.platform === 'win32') {
        execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' });
      } else {
        child.kill('SIGINT');
      }
    } catch {
      /* ya terminado */
    }
    console.log(`[dev] ${label} detenido`);
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

console.log('[dev] watch:css + serve — Ctrl+C para detener todo');
launch('css', 'npm', ['run', 'watch:css']);
launch('serve', process.execPath, ['scripts/serve.mjs']);
