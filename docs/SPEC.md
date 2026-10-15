# Spec: Refactor estructural del portafolio + CV

> Estado: **BORRADOR PARA GATE 1** — esperando OK explícito antes de tocar código.
> Última revisión: 2026-10-15 (FASE 0 + FASE 1, read-only).

## 1. Objetivo

Reorganizar estructuralmente el repositorio (archivos, constantes, módulos, buenas prácticas)
**sin cambiar ni una palabra del contenido visible**, manteniendo el look & feel actual
(verde `#1abc9c` + acento `#7c5cfc`, dark/light, Inter) y todas las funcionalidades
(tema, i18n ES/EN, menú móvil, sticky navbar, back-to-top, animaciones scroll, nav activa,
formulario Netlify). El resultado debe ser escalable, mantenible y desplegable en Netlify
con **cero regresiones** y **cero rotura de URLs**.

Usuario: Christian (propietario) + visitantes del sitio (portafolio `/`, CV `/cv`).
Éxito: los 10 criterios de aceptación §7 verificados con evidencia en `docs/VERIFICATION.md`.

## 2. Supuestos (corregir ahora si alguno falla)

1. **No hay bug de ruta `src/input.css`.** El archivo ya existe en `src/input.css` y
   `package.json` ya apunta ahí (`tailwindcss -i src/input.css -o estilo.css`).
   El inventario de la misión (y `AGENTS.md`) dice "está en raíz → BUG": es **incorrecto**.
   Solo hay que moverlo a `src/styles/input.css` (rename, no fix de bug).
2. **`.gitignore` ya existe** (commit `884b4a9 chore: add comprehensive .gitignore`).
   No se crea: se **extiende** (los HTML publicados por build, si aplica, y salida de Playwright).
3. **Hay trabajo sin commitear** que debe entrar en un commit baseline antes de FASE 3:
   - `M estilo.css` (rebuild minificado, 1 línea),
   - `?? AGENTS.md`,
   - `?? cv_christian_vazquez_ats.html` (¡el CV ATS **no está trackeado** en git!).
4. **`package-lock.json` está trackeado** pese a estar en `.gitignore` (se ignoró tarde).
   Se mantiene trackeado (regla: Netlify lo necesita para builds reproducibles) y se
   **quita de `.gitignore`** para que la ignore/dejadez no siga generando confusión.
5. **Un solo template de CV i18n + un ATS separado.** Hoy no existen dos HTML de CV:
   existe `cv_christian.html` (i18n ES/EN vía `cv-translations.js`) y el ATS (mono-columna,
   CSS inline, sin i18n). Se mantiene esa arquitectura: `/cv/` (i18n), `/cv/ats/` (ATS) y
   **`/cv/en/` como archivo físico** con el mismo template (GATE 1: sin rewrite, sin build —
   duplicación de marcado acotada porque el texto vive en JSON tras FASE 5, ADR-001/ADR-003).
6. **Idioma en CV — aprobado (GATE 1/Q2, afinado GATE 2/A4):** orden de resolución
   `?lang=xx`/ruta `/cv/en/` > `localStorage['language']` > fallback `es`
   (**sin** `navigator.language` — A4, para no desincronizar de `/`);
   al aplicar `?lang` se persiste en `localStorage` y se limpia con `history.replaceState`.
   Scope: páginas CV (`/cv`, `/cv/en`, `/cv-en`, `/cv?lang=en`). Ver ADR-003.
7. **Umbrales PDF aprobados (GATE 1, Q3):** CV ES ≤ 450 KB · CV EN ≤ 450 KB ·
   **CV ATS ≤ 200 KB (canario: si lo supera ⇒ fuente mal subsetteada o imagen colándose)**.
   Los actuales pesan 419/420 KB → verificación contra el umbral nuevo en FASE 7 (ADR-004).
8. **Herramientas de verificación** (`html-validate`, `lighthouse`, `serve`, `netlify`) se
   ejecutan bajo demanda con `npx` y **no** se añaden a `package.json` (regla 5: sin deps
   nuevas sin ADR). `playwright` **sí** se añade como devDependency (ADR-004).
9. **Rutas absolutas desde la raíz del sitio** (`/assets/...`) en los HTML servidos en `/cv/*`,
   porque los relativos romperían desde subdirectorio. Documentado en ADR-001.
10. **`cucoders_data/profile-data.json`** no lo referencia ninguna página: queda **fuera de
    alcance** (no se mueve ni se borra sin orden).

## 3. Inventario actual (FASE 0, verificado)

| Archivo | Líneas / tamaño | Rol | Observación |
|---|---|---|---|
| `index.html` | 1058 ln / 89 KB | Portafolio SPA | anti-FOUC inline, 3 CDNs, `script.js` defer |
| `cv_christian.html` | 1058 ln / 42 KB | CV ES/EN i18n | **~710 ln de `<style>` inline** + `estilo.css` + 2 CDNs |
| `cv_christian_vazquez_ats.html` | 271 ln / 10 KB | CV ATS | CSS inline (intencional, requisito ATS). **No trackeado en git** |
| `script.js` | 492 ln / 34 KB | JS portafolio | 7 responsabilidades en 1 archivo |
| `cv-translations.js` | 142 ln / 14 KB | i18n CV (ES/EN) | objeto global `cvTranslations`, UTF-8 |
| `src/input.css` | 265 ln / 7.5 KB | Fuente Tailwind | `:root` + `.dark` + componentes custom |
| `estilo.css` | 30 KB | CSS compilado | **modificado sin commitear** |
| `tailwind.config.js` | 91 ln | Config | `content: ["./*.{html,js}"]` → solo raíz |
| `package.json` | — | Scripts | `build`/`watch` apuntan a `src/input.css` ✓ |
| `netlify.toml` | 41 ln | Deploy | `publish = "."`, `/cv` y `/cv-en` rewrites, headers |
| `imagen/` | 14 × .webp | Imágenes | nombre en español; sin `og/` ni avatar local |
| `cv_christian_vazquez.pdf` / `_en.pdf` | 419/420 KB | PDFs | generados a mano; **no se tocan hasta FASE 7** |
| `.gitignore` | 51 ln | — | ya existe; ignora `package-lock.json` (pero está trackeado) |
| `cucoders_data/` | — | datos | no referenciado, fuera de alcance |
| `.idea/`, `.omo/`, `node_modules/` | — | — | ya ignorados |

**No existen:** `.editorconfig`, `.nvmrc`, `.prettierrc`, `postcss.config.js`, `scripts/`,
`docs/` (hoy), ADRs, tests, `.nvmrc`.

**Rutas/URLs/anchors detectados** (contratos en §4): anchors `#hero #about-detail #skills
#studies #experience #projects #main-content`; assets `estilo.css`, `script.js`,
`cv-translations.js`, `imagen/*.webp` (src + srcset, 6 proyectos), 2 PDFs, 12 referencias
al avatar de GitHub, 30 usos de Material Symbols, 35 usos de Font Awesome, 3 CDN (Google
Fonts ×2, cdnjs FA).

## 4. Contratos de URLs (no negociables)

| URL actual | Destino nuevo | Status | Nota |
|---|---|---|---|
| `/` | `index.html` | 200 | sin cambio |
| `/cv` | `cv/index.html` | 200 | rewrite (era `/cv_christian.html`) |
| `/cv?lang=en` | `cv/index.html` | 200 | query soportado (ADR-003), no redirige |
| `/cv/en` | `cv/en/index.html` | 200 | **archivo físico** (GATE 1: se elimina la V3/rewrite) |
| `/cv-en` | `/cv/en/` | **301** | GATE 1: ahora redirige a la página EN física (antes 200→`?lang=en`) |
| `/cv/ats` | `cv/ats/index.html` | 200 | nuevo |
| `/cv_christian.html` | `/cv/` | 301 | compatibilidad |
| `/cv_christian_vazquez_ats.html` | `/cv/ats/` | 301 | compatibilidad (GATE 1) |
| `/cv_christian_vazquez.pdf` | `/assets/docs/cv-christian-vazquez.pdf` | 301 | compatibilidad |
| `/cv_christian_vazquez_en.pdf` | `/assets/docs/cv-christian-vazquez-en.pdf` | 301 | compatibilidad |
| `/imagen/*` | `/assets/images/:splat` | 301 | **regla 4: `/*.webp` no puede romperse** (GATE 1: obligatorio) |
| `/estilo.css` | `/assets/css/main.css` | 301 | compat (además revuelve cache de 7 días) |
| `/script.js` | `/assets/js/main.js` | 301 | compat |
| `/*.css`, `/*.js` | headers cache 7 d | — | mantener |
| `/*` seguridad | X-Frame-Options etc. | — | mantener |

Headers existentes se conservan; `/imagen/*` → `/assets/images/*` con `max-age=31536000, immutable`.
Sin catch-all (prohibido por `netlify.toml` comment + AGENTS.md).

## 5. Estructura objetivo y desviaciones

Se sigue la estructura de la misión con **una única desviación** (Opción C, GATE 1 → ADR-001):

| # | Desviación | Rationale |
|---|---|---|
| V1 | **`src/js/` no existe.** El JS vive directo en `assets/js/` (fuente = publicado, ES modules nativos, sin bundler). | Dos copias (src + assets) = riesgo de drift; Netlify sirve ES modules sin build. La misión misma permite decidirlo en ADR-001. |
| ~~V2~~ | ~~`src/templates/` + `build:html`~~ | **Eliminada (GATE 1 → Opción C):** los HTML son fuente y artefacto en su ruta publicada; sin `src/templates/`, sin `build:html`, sin copias en `.gitignore`. |
| ~~V3~~ | ~~`/cv/en/` como rewrite~~ | **Eliminada (GATE 1):** `cv/en/index.html` es un archivo físico (el contrato §4 redirige `/cv-en` 301 → `/cv/en/`). |

**Opción C (aprobada):** HTML como fuente directa en sus rutas publicadas
(`index.html`, `cv/index.html`, `cv/en/index.html`, `cv/ats/index.html`). Cero build de HTML,
cero drift, todo funciona desde un clone sin build (`npm run build` solo compila CSS).

```
/  (publicado, publish = ".")
├── index.html                  # fuente directa (Opción C)
├── cv/index.html, cv/en/index.html, cv/ats/index.html
├── assets/{css,js,i18n,images,docs,fonts}
src/styles/{input.css,tokens.css,icons.css}   # SOLO fuentes de estilos (V1: no hay src/js)
scripts/{build-css.mjs,build-cv.mjs,dev.mjs}
docs/{SPEC,CONSTRAINTS,ARCHITECTURE,VERIFICATION}.md, docs/adr/ADR-00{1..6}-*.md
```

Nota (cerrado en GATE 2, A1): el GATE 1 mencionó "`src/` se reserva para `src/styles/` y
`src/js/`" — fue un lapsus; **V1 manda: no hay `src/js/`** (fuente JS en `assets/js/`).

## 6. Comandos

```bash
npm run build:css     # tailwindcss -i src/styles/input.css -o assets/css/main.css --minify
npm run watch:css     # igual en watch
npm run build:cv      # node scripts/build-cv.mjs  (Playwright → 3 PDFs en assets/docs/, FASE 7)
npm run build         # build:css (+ precheck: NO ejecuta build:cv — ver ADR-004, Netlify no instala Chromium)
npm run dev           # scripts/dev.mjs: watch:css + servidor estático (0 dependencias, ADR-005-regla5)
npm run lint:html     # npx html-validate sobre los HTML publicados
npm run test:lighthouse # npx lighthouse <url> --preset=desktop
```

No existe `build:html` (Opción C, ADR-001).

Nota: `npm test` sigue saliendo 1 por diseño (AGENTS.md). No se añade framework de tests.

## 7. Criterios de aceptación (verificables)

| # | Criterio | Verificación |
|---|---|---|
| 1 | `npm run build` sin errores | ejecución real, exit 0 |
| 2 | `npm run lint:html` sin errores | `npx html-validate` exit 0 |
| 3 | Lighthouse Performance ≥ 90 (desktop) en `/`, `/cv`, `/cv/en`, `/cv/ats` | informes en `docs/VERIFICATION.md` |
| 4 | Lighthouse Accessibility ≥ 95 (4 páginas) | ídem |
| 5 | Lighthouse SEO ≥ 95 (4 páginas) | ídem |
| 6 | **CERO** cambio de texto visible/fechas/nombres/emails/URLs externas | ver método §7.1 |
| 7 | 3 PDFs abren en Chrome, texto seleccionable, ≤ umbral (§2.7) | apertura manual + tamaño |
| 8 | `/`, `/cv`, `/cv/en`, `/cv/ats` → 200 en `netlify dev` | curl/`netlify dev` |
| 9 | `wcag-ai-skill` sin errores críticos | auditoría documentada |
| 10 | Capturas antes/después sin regresiones visuales | `docs/VERIFICATION.md` |

### 7.1 Método "cero cambios de texto"

1. **Antes** (FASE 0): extraer texto visible de las 3 páginas actuales →
   `docs/before/<page>.txt` (navegador o `html-validate`+script propio; normaliza whitespace).
2. **Después** (FASE 9): idéntico proceso → `docs/after/<page>.txt`.
3. `diff before after` debe mostrar **solo** diferencias de whitespace/rutas de assets.
4. Además: `git diff` revisado línea a línea — ninguna cadena de contenido
   (nombres, fechas, emails, teléfonos, URLs `https://…` de proyectos) puede aparecer
   modificada. Se aceptan **únicamente** cambios de rutas de assets (`imagen/…`,
   `estilo.css`, `script.js`, `cv_christian*.pdf`) y de marcado estructural.

## 8. Fases y gates (harness)

F0 Reconocimiento (read-only) → **GATE 1 (este documento + CONSTRAINTS)**
F1 Spec + Constraints → GATE 1
F2 ADRs → **GATE 2** ✅ escritos: `docs/adr/ADR-001-estructura-carpetas` (Opción C),
`ADR-002-tokens-diseno` (W3C DTCG), `ADR-003-i18n-json` (orden de idioma GATE 1),
`ADR-004-build-pdfs` (Playwright, umbrales Q3), `ADR-005-fonts-icons` (Q4a),
`ADR-006-lockfile` (package-lock)
F3 Scaffolding + `git mv` + scripts → **GATE 3** (commit `chore:`/`refactor:`)
F4 Tokens (`tokens.css` W3C DTCG, Tailwind solo `var(--color-*)`) → **GATE 4**
F5 JS modular (7 módulos) + i18n JSON → **GATE 5**
F6 Limpieza HTML (inline styles del CV → `cv.css`, avatar local, preload, img attrs) → **GATE 6**
F7 PDFs con Playwright → **GATE 7**
F8 `netlify.toml` (redirects + headers) → **GATE 8**
F9 Verificación (Lighthouse, a11y, perf, antes/después) → **GATE 9**
F10 README + ARCHITECTURE + commits → **GATE 10**

Un commit atómico Conventional por fase (`docs:`, `chore:`, `refactor:`, `build:`).

## 9. Boundaries

- **Always:** mantener contenido textual idéntico; `npm run build` + `lint:html` en verde
  antes de cada commit; leer `CONSTRAINTS.md` antes de escribir código; UTF-8 intacto;
  actualizar `estilo.css` vía build y commitearlo (Netlify no builda CSS por su cuenta… 
  → con FASE 8 pasa a `command = "npm run build"`, pero se sigue commiteando por costumbre del repo).
- **Ask first:** añadir dependencias (solo `playwright` está autorizado — `sharp` **descartado**
  en GATE 1/Q6); tocar los PDFs existentes antes de FASE 7; rediseñar cualquier elemento visual;
  cambiar `publish = "."`; borrar `cucoders_data/` o `.omo/`.
- **Never:** cambiar textos/traducciones/fechas/URLs externas; añadir frameworks o CDNs nuevos;
  catch-all redirect en Netlify; hand-editar `estilo.css`/`main.css` compilado;
  commitear `node_modules/`; suprimir checks (`html-validate --rule off` etc.).

## 10. Decisiones GATE 1 (cerradas) y abiertos GATE 2

### Cerradas en GATE 1

1. **Q1 → Opción C**: HTML fuente en sus rutas publicadas; `src/` solo estilos (V1); sin
   `src/templates/` ni `build:html` (ADR-001).
2. **Q2 → aprobado**: `?lang`/ruta `/cv/en/` > `localStorage` > `navigator.language` > `es`;
   persistir + `history.replaceState` (ADR-003).
3. **Q3 → umbrales**: ES ≤ 450 KB · EN ≤ 450 KB · ATS ≤ 200 KB canario (ADR-004).
4. **Q4 → (a) con refinamiento**: Inter subset latin/latin-ext auto-hospedado, Material Symbols
   subset (`text=`) auto-hospedado, FA auto-hospedado, avatar local, 0 CDNs (ADR-005).
5. **Q5 → `scripts/dev.mjs`** con `child_process.spawn` + handlers SIGINT (0 deps).
6. **Q6 → `sharp` descartado.**
7. **Baseline commit** obligatorio antes de FASE 3:
   `git add cv_christian_vazquez_ats.html AGENTS.md estilo.css` +
   `chore: baseline before refactor — untracked ATS + pending CSS`.
8. **`package-lock.json`**: fuera de `.gitignore`, trackeado (ADR-006).

### Cerradas en GATE 2 (A1–A4 + N1–N4)

- **A1 → sin `src/js/`** (V1 firme): `src/` solo estilos; JS fuente en `assets/js/` (ADR-001).
- **A2 → FA webfonts auto-hospedadas** (opción (i), 0 churn); SVG inline queda como mejora
  post-refactor (ADR-005).
- **A3 → Inter fuente variable** (latin + latin-ext, `font-display: swap`, ≤ 100 KB; si no
  cabe → 5 pesos estáticos documentando el trade-off) (ADR-005).
- **A4 → sin `navigator.language`** en el CV: cascada `?lang`/ruta > `localStorage` > `es`;
  portafolio sin cambio (ADR-003; opción (a) en "Mejoras fuera de alcance").
- **N1** rutas físicas + `content` de Tailwind ampliado → ADR-002.
- **N2** precheck de `build:css` con códigos de salida 1/2/3 → ADR-004.
- **N3** presupuesto `assets/fonts/` ≈ 240 KB (parar si ±20 %) → ADR-005.
- **N4** fila "CDNs externos = 0 con `rg`" → CONSTRAINTS (tabla Enforced).
