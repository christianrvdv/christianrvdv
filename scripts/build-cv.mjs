/**
 * scripts/build-cv.mjs — PDFs reproducibles con Playwright (FASE 7, ADR-004).
 *
 * Levanta un servidor estático interno (node:http, 0 dependencias, puerto dinámico)
 * porque los HTML usan rutas absolutas /assets/... que no resuelven en file://,
 * navega a los 3 CVs con Chromium headless y exporta A4 con printBackground.
 *
 * Salidas (umbral en KB = 1024 B):
 *   assets/docs/cv-christian-vazquez.pdf       CV ES   ≤ 450 KB
 *   assets/docs/cv-christian-vazquez-en.pdf    CV EN   ≤ 450 KB
 *   assets/docs/cv-christian-vazquez-ats.pdf   CV ATS  ≤ 200 KB (canary de subsetting)
 *
 * Sustitución de impresión (presupuesto ADR-004): Chromium re-codifica
 * imágenes no-JPEG a Flate lossless (avatar webp 400×400 ≈ 280 KB en el PDF)
 * y solo los JPEG pasan comprimidos (DCT ≈ 27 KB, como los PDFs manuales
 * previos). El sitio sigue sirviendo .webp; este servidor responde el JPEG
 * equivalente (mismos píxeles, assets/images/avatar-400.jpg) bajo la misma
 * URL durante la impresión. Solo afecta al PDF, nunca al deploy.
 * Ruta exacta: assets/images/print-only/avatar-400.jpg (ver ADR-004
 * «Post-implementación (FASE 7)» para el contexto completo).
 *
 * Códigos de salida:
 *   0  éxito
 *   1  precondición no cumplida (CSS previo ausente / HTML no encontrado)
 *   2  PDF generado pero sobre umbral
 *   3  error de Playwright / navegador / servidor / IO
 *
 * NO corre en Netlify (ADR-004): el deploy ejecuta solo `npm run build` (CSS).
 */
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { existsSync, statSync, mkdirSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'assets', 'docs');
const KB = 1024;

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
};

const JOBS = [
  { url: '/cv/',         out: 'cv-christian-vazquez.pdf',        label: 'CV ES',      maxKB: 450 },
  { url: '/cv/en/',      out: 'cv-christian-vazquez-en.pdf',     label: 'CV EN',      maxKB: 450 },
  { url: '/cv/ats/',     out: 'cv-christian-vazquez-ats.pdf',    label: 'CV ATS',     maxKB: 200 },
  { url: '/cv/en/ats/',  out: 'cv-christian-vazquez-ats-en.pdf', label: 'CV ATS EN',  maxKB: 200 },
];

/* ---------- 1) Precheck (exit 1) ---------- */
function precheck() {
  if (!existsSync(path.join(ROOT, 'assets', 'css', 'main.css'))) {
    console.error('assets/css/main.css no encontrado — Run npm run build:css first');
    process.exit(1);
  }
  if (!existsSync(path.join(ROOT, 'assets', 'css', 'cv.css'))) {
    console.error('assets/css/cv.css no encontrado — Run npm run build:css first (cv.css es parte del build)');
    process.exit(1);
  }
  for (const rel of ['cv/index.html', 'cv/en/index.html', 'cv/ats/index.html', 'cv/en/ats/index.html']) {
    if (!existsSync(path.join(ROOT, rel))) {
      console.error(`[precheck] falta ${rel} — no se puede generar el PDF`);
      process.exit(1);
    }
  }
  if (!existsSync(path.join(ROOT, 'assets', 'images', 'print-only', 'avatar-400.jpg'))) {
    console.error('[precheck] falta assets/images/print-only/avatar-400.jpg — sustitución de impresión requerida por ADR-004 (generar desde assets/images/avatar-400.webp)');
    process.exit(1);
  }
}

/* Sustitución de impresión: misma URL, bytes JPEG (ver cabecera). */
const PRINT_SUBSTITUTIONS = new Map([
  ['/assets/images/avatar-400.webp', path.join(ROOT, 'assets', 'images', 'print-only', 'avatar-400.jpg')],
]);

/* ---------- 2) Servidor estático interno (puerto dinámico) ---------- */
async function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const substituted = PRINT_SUBSTITUTIONS.get(decoded);
  if (substituted) {
    try {
      const info = await stat(substituted);
      if (info.isFile()) return { file: substituted, size: info.size };
    } catch {
      /* cae al archivo original */
    }
  }
  const candidates = decoded.endsWith('/')
    ? [path.join(ROOT, decoded, 'index.html')]
    : [path.join(ROOT, decoded), path.join(ROOT, decoded, 'index.html')];
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

function startServer() {
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
  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

/* ---------- 3) Export con Playwright ---------- */
async function exportPdfs() {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch (err) {
    console.error('[build:cv] no se pudo cargar playwright — npm install / npx playwright install chromium');
    console.error(err.message);
    process.exit(3);
  }

  const server = await startServer();
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  console.log(`[build:cv] servidor interno en ${base} (raíz: ${ROOT})`);

  let browser;
  let worst = 0;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    for (const job of JOBS) {
      await page.goto(`${base}${job.url}`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.evaluate(() => document.fonts.ready);
      const outPath = path.join(OUT_DIR, job.out);
      await page.pdf({
        path: outPath,
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        displayHeaderFooter: false,
      });

      const bytes = statSync(outPath).size;
      const kib = bytes / KB;
      const limit = job.maxKB * KB;
      const ok = bytes <= limit;
      if (!ok) worst = 2;
      console.log(
        `[build:cv] ${job.label.padEnd(7)} → assets/docs/${job.out}  ` +
        `${bytes} B (${kib.toFixed(1)} KiB)  umbral ${job.maxKB} KiB  ${ok ? 'OK' : 'SOBREPASADO'}`
      );
    }
    return worst;
  } catch (err) {
    console.error('[build:cv] fallo de Playwright/navegador:');
    console.error(err.message);
    console.error('Si es "browserType.launch: Executable doesn\'t exist", ejecuta: npx playwright install chromium');
    process.exit(3);
  } finally {
    if (browser) await browser.close().catch(() => {});
    await new Promise((resolve) => server.close(resolve));
    console.log('[build:cv] navegador y servidor cerrados');
  }
}

/* ---------- main ---------- */
precheck();
mkdirSync(OUT_DIR, { recursive: true });
const code = await exportPdfs();
if (code === 2) {
  console.error('[build:cv] ERROR: algún PDF supera el umbral (exit 2). Revisa subsetting/imagenes.');
}
process.exit(code);
