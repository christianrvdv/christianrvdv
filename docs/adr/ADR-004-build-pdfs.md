# ADR-004: Build de PDFs con Playwright (headless Chromium)

Fecha: 2026-10-15 · Estado: Aceptado (GATE 1, Q3) · Precheck/códigos de salida (GATE 2, N2)

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
- El script espera **build:css previo** (los PDFs deben reflejar `main.css` compilado).
  **Precheck obligatorio (GATE 2, N2):**
  - Si `assets/css/main.css` no existe → mensaje claro
    `"assets/css/main.css no encontrado — ejecuta 'npm run build:css' primero"` y **exit 1**.
  - Códigos de salida distintos para fallos distinguibles:
    `1` = falta el CSS previo · `2` = PDF sobre umbral (con el archivo y KB reales en el
    mensaje) · `3` = fallo de navegador/servidor/IO.
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

## Post-implementación (FASE 7)

Fecha: 2026-10-15 · Estado: Aceptado (GATE 7, condiciones 1–2)

### Contexto

La página referencia el avatar del CV en `assets/images/avatar-400.webp`. Chromium al
imprimir embebe las imágenes **webp como Flate lossless (~280 KB/instancia)** mientras que
un JPEG se embebe como **DCT passthrough (~28 KB/instancia)** — medido con una página-proba
A/B (`__pdfprobe.html`, eliminada después): PDF total 280 020 B con webp vs 27 758 B con
JPEG. Los PDFs viejos (generados a mano) usaban el JPEG alojado en GitHub, por eso salían
en ~419 KB; con el webp local el CV ES habría rondado ~649 KB y **superado el umbral de
450 KB**.

### Decisión

`scripts/build-cv.mjs` sirve `assets/images/print-only/avatar-400.jpg` (mismos píxeles,
JPEG) **bajo la misma URL del avatar** (`/assets/images/avatar-400.webp`) usando un Map
`PRINT_SUBSTITUTIONS` que solo reescribe el cuerpo de respuesta **durante la generación
del PDF**, en el servidor estático interno del script. El sitio en producción sigue
sirviendo el webp; 0 cambios en HTML, CSS o assets públicos. El jpg vive en
`print-only/` para que su carácter de artefacto de impresión sea visible en el árbol.

### Consecuencias

- **+** PDFs ~250 KB más pequeños que el camino webp (y ~2–8 % más pequeños que los viejos);
  umbrales cumplidos con margen.
- **+** 0 cambios HTML/CSS; el deploy no se entera.
- **−** Comportamiento oculto: el servidor interno miente sobre los bytes de una URL.
- **−** Si alguien depura el HTTP durante el build verá un JPEG bajo una URL `.webp`.

### Mitigación

- Comentario en la cabecera de `scripts/build-cv.mjs` que documenta la sustitución.
- Precheck de existencia del jpg (exit 1 con mensaje claro) antes de imprimir.
- Esta nota en el ADR.

### Procedencia (corrección de la condición 1)

El reporte del GATE 7 describió esta sustitución como «aprobada por ti». Esa afirmación
**no era verificable como aprobación de gate**: la decisión se adoptó durante la ejecución
de la FASE 7 (mediante una elección interactiva dentro de la fase, no mediante un gate) y
se reportó con un protocolo de aprobación que no correspondía. Queda formalizada aquí, con
el GATE 7 (condición 1), como decisión aceptada bajo sus condiciones.

> Nota de verificación: en `docs/SPEC.md:116` la frase «Opción C (aprobada)» es de otro
> contexto (HTML como fuente directa, GATE 1 → ADR-001) y no forma parte de esta
> corrección.
