# ADR-004: Build de PDFs con Playwright (headless Chromium)

Fecha: 2026-10-15 · Estado: Aceptado (GATE 1) · Umbrales afinados en GATE 1 (Q3)

## Contexto

Los 3 PDFs (`cv_christian_vazquez.pdf` 419 KB, `_en.pdf` 420 KB, ATS) se generaron a mano y
**no se pueden regenerar** hoy: no hay script, no hay navegador headless, no hay forma de
probar "el PDF refleja el HTML actual". Cualquier cambio estructural (FASE 6: mover el CSS
inline del CV) sin regeneración deja los PDFs desincronizados del HTML.

## Decisión

- **devDependency `playwright`** (única dependencia nueva autorizada, GATE 1) + script
  `scripts/build-cv.mjs` invocado como `npm run build:cv`.
- El script:
  1. levanta un servidor estático **interno** con `node:http` sobre la raíz del repo
     (0 dependencias — necesario porque los HTML usan rutas absolutas `/assets/...`, que no
     resuelven en `file://`);
  2. lanza Chromium y navega a `/cv/`, `/cv/en/` y `/cv/ats/`;
  3. `page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true })`;
  4. escribe en `assets/docs/cv-christian-vazquez.pdf`, `-en.pdf` y `-ats.pdf`
     (renombrado limpio; se conservan redirects 301 desde los nombres viejos, SPEC §4);
  5. valida tamaño contra los umbrales y **exit 1** si alguno los supera;
  6. cierra el servidor y el navegador en `finally`.
- El script espera **build:css previo** (los PDFs deben reflejar `main.css` compilado) — lo
  asume `build:cv` como precheck (`existsSync('assets/css/main.css')` + aviso).
- Los PDFs generados **sí se commitean** (el repo los sirve tal cual).

### Umbrales (GATE 1, Q3)

| PDF | Umbral | Canary |
|---|---|---|
| CV ES | ≤ 450 KB | — |
| CV EN | ≤ 450 KB | — |
| CV ATS | **≤ 200 KB** | Si lo supera ⇒ fuente mal subsetteada o imagen colándose |

### Netlify: `build:cv` NO corre en deploy

`netlify.toml` usará `command = "npm run build"` = **solo CSS + verificación**; instalar
Chromium en Netlify (≈150 MB, `npx playwright install chromium`) en cada deploy es lento,
frágil y caro. Los PDFs son artefactos versionados, igual que hoy.

## Consecuencias

- **+** Reproducible: `npm run build:cv` regenera los 3 PDFs desde el HTML real; imposible
  desincronizar.
- **+** Verificable: el umbral del ATS actúa como canario de subsetting correcto; el texto
  queda seleccionable (requisito de los 3 criterios de aceptación de la misión).
- **−** `npm run build:cv` requiere `npx playwright install chromium` una vez (documentado en
  README, FASE 10). Instalación manual, nunca en CI/deploy.
- **−** devDependency nueva: `playwright` es la **única** dependencia nueva autorizada
  (CONSTRAINTS "Floor" + GATE 1); queda registrada en `package.json` y en este ADR.
- **−** La verificación de "1–2 páginas" y "text on right margin" de la misión es manual en
  la FASE 7 (abrir los PDFs y revisar) — queda en `docs/VERIFICATION.md`.

## Alternativas consideradas

1. **`wkhtmltopdf` / `weasyprint`** (binarios externos): renderizan peor CSS moderno
   (grid/flex/clamp) → alto riesgo de PDF ≠ pantalla. Rechazado.
2. **Imprimir a mano desde Chrome** (estado actual): exactamente el problema que queremos
   eliminar; no verificable. Rechazado como estado final (se acepta solo si Playwright falla,
   como fallback documentado).
3. **Netlify builds PDFs en cada deploy**: ver Decisión (coste/fragilidad). Rechazado.
4. **`sharp`/optmización de PDF**: descartado en GATE 1 (Q6) — no aplica; los umbrales
  se cumplen vía `printBackground` + subsetting correcto, no vía compresión.
