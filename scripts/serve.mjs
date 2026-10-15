/**
 * scripts/dev.mjs — servidor estático de desarrollo (0 dependencias).
 * Sirve la raíz del repo en http://localhost:<PORT|8080>, con índice por directorio
 * (/cv/ → cv/index.html). Los redirects legacy (/cv, /imagen/*, ...) viven en netlify.toml
 * y se aplican con `netlify dev` (FASE 8); este script es para desarrollo rápido local.
 */
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

async function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const candidates = [];
  if (decoded.endsWith('/')) {
    candidates.push(path.join(ROOT, decoded, 'index.html'));
  } else {
    candidates.push(path.join(ROOT, decoded));
    candidates.push(path.join(ROOT, decoded, 'index.html'));
    candidates.push(path.join(ROOT, `${decoded}.html`));
  }
  for (const candidate of candidates) {
    if (!candidate.startsWith(ROOT)) continue;
    try {
      const info = await stat(candidate);
      if (info.isFile()) return { file: candidate, size: info.size };
    } catch {
      /* siguiente candidato */
    }
  }
  return null;
}

const server = createServer(async (req, res) => {
  const found = await resolveFile(req.url || '/');
  if (!found) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    return;
  }
  res.writeHead(200, {
    'Content-Type': MIME[path.extname(found.file).toLowerCase()] || 'application/octet-stream',
    'Content-Length': found.size,
    'Cache-Control': 'no-store',
  });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  createReadStream(found.file).pipe(res);
});

server.listen(PORT, () => {
  console.log(`[serve] http://localhost:${PORT}  (raíz: ${ROOT})`);
});

const close = () => server.close(() => process.exit(0));
process.on('SIGINT', close);
process.on('SIGTERM', close);
