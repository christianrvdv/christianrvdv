# AGENTS.md

## Qué es este repo
Portafolio personal estático: HTML5 + JavaScript vanilla (módulos ES) + Tailwind CSS v3. Sin framework, sin SSR, sin test runner (`npm test` sale 1 por diseño). Se despliega en **doble host** con el mismo árbol de archivos:

- **Netlify** (producción principal): sirve desde la raíz — https://christianrvdv.netlify.app/
- **GitHub Pages** (espejo): sirve desde el subpath `/christianrvdv/` — https://christianrvdv.github.io/christianrvdv/

Páginas: `index.html` (portafolio SPA), `cv/index.html` (CV interactivo ES), `cv/en/index.html` (CV EN), `cv/ats/index.html` (CV ATS, CSS inline a propósito), más los PDFs exportados en `assets/docs/`. El repo canónico en GitHub es `christianrvdv/christianrvdv`.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | `watch:css` + servidor estático en :3000 (override con env `PORT`); Ctrl+C detiene ambos |
| `npm run build:css` | Tailwind v3 CLI: `src/styles/input.css` → `assets/css/main.css` (minificado). **Único build step** |
| `npm run build` | Alias de `build:css` (lo ejecuta Netlify en cada deploy) |
| `npm run watch:css` | Igual en modo watch |
| `npm run build:cv` | Regenera los 3 PDFs con Playwright (ver «PDFs») |
| `npm run serve` | Servidor estático (env `PORT`, por defecto :3000) |
| `npm run lint:html` | `html-validate` sobre `index.html` + `cv/**/*.html`; debe dar exit 0 |
| `npm test` | Sale 1 a propósito — no hay suite |

## Pipeline de CSS — léelo antes de tocar estilos
- `assets/css/main.css` es **output generado y commiteado**. Netlify ejecuta `npm run build:css` en deploy, pero GitHub Pages **no builda**: commitea siempre el `main.css` resultante o el espejo se queda sin estilos nuevas.
- **Nunca edites `assets/css/main.css` a mano**; el siguiente build la pisa. La fuente es `src/styles/input.css` (directivas Tailwind + clases custom como `.glass`, `.bento-card`) que hace `@import "./tokens.css"`.
- `tailwind.config.js` escanea `content: ["./*.html", "./cv/**/*.html", "./assets/js/**/*.js"]`. Clases usadas fuera de esos globs se descartan en silencio.
- Tokens en `tailwind.config.js` con dos estilos: (a) colores con opacidad (`bg-primary/50`) mapean a `rgb(var(--color-*-rgb) / <alpha-value>)` y necesitan triple RGB en `:root` y `.dark`; (b) el resto mapea a `var(--color-*)` plano. Un color nuevo requiere config **+** variables CSS en ambos temas dentro de `src/styles/tokens.css`.
- `darkMode: 'class'`: tema = clase `dark` en `<html>`, persistida en `localStorage.theme`. `index.html` tiene un script anti-FOUC inline en `<head>` que duplica esa lógica — mantenlos sincronizados.
- Los cambios de CSS tardan hasta 7 días en llegar a visitantes recurrentes (headers `max-age=604800` sin cache-busting); si hay que forzar, cambia el query de la URL del recurso.

## Deploy / rutas (Netlify + GitHub Pages)
- Rutas de recursos **relativas** en todo el HTML (`assets/…`, `../assets/…`, `../../assets/…`) para que un mismo árbol sirva en raíz y en subpath (ADR-007, ADR-009). El JS resuelve fetch/URLs con `new URL('…', import.meta.url)`.
- `netlify.toml` define 200 rewrites (`/cv`, `/cv/en`, `/cv/ats`) y 301s de URLs legacy (`/cv-en`, `/cv_christian.html`, `/estilo.css`, `/script.js`, `/imagen/*`, PDFs). **No añadas catch-all redirect** (comentario en el propio `netlify.toml`: rompería CV/PDF/imágenes).
- GitHub Pages no soporta 301s: los redirects solo aplican en Netlify (aceptado, ADR-007).
- Las metas Open Graph/Twitter usan **URLs absolutas de Netlify** (única excepción a las rutas relativas) para que la preview cargue desde cualquier host.

## PDFs
- `npm run build:cv` usa Playwright/Chromium headless sobre un servidor estático interno (puerto efímero) y exporta A4 con `printBackground`:
  - `assets/docs/cv-christian-vazquez.pdf` (ES ≤ 450 KB), `…-en.pdf` (EN ≤ 450 KB), `…-ats.pdf` (ATS ≤ 200 KB, canary de subsetting). 2 páginas máximo cada uno.
- **Los PDFs se commitean** (el sitio los sirve tal cual). No corren en Netlify: solo el build de CSS.
- Tras regenerarlos: verifica tamaño, nº de páginas y que el texto siga siendo seleccionable (Ctrl+F).

## i18n
- Diccionarios en `assets/i18n/` (`portfolio.{es,en}.json`, `cv.{es,en}.json`), aplicados por claves `data-i18n` desde `assets/js/modules/i18n.js` (portafolio: `assets/js/main.js`; CV: `assets/js/cv.js`).
- Cascada del CV: `?lang=xx` o ruta `/cv/en/` > `localStorage['language']` > `es`. El portafolio: `localStorage['language']` > `es`. No se usa `navigator.language` (decisión GATE 2/A4).
- Anti-FOUC: el HTML trae prefilled el texto exacto del diccionario (ES en `/cv/`, EN en `/cv/en/`). **Si cambias una clave en los JSON, actualiza también el HTML** o volverá el flash de idioma.
- Todo texto visible nuevo requiere entrada en **ambos** idiomas. El default es español; conserva los acentos UTF-8.

## Restricciones duras
- **Sin dependencias nuevas sin ADR** (hoy solo devDependencies de build: tailwindcss, postcss, autoprefixer, playwright). CDNs externos prohibidos: fuentes e iconos son auto-hospedados (subset).
- `package-lock.json` **sí está trackeado** (ADR-006); usa `npm install` (no `npm ci` desde una rama sin lockfile).
- PowerShell 5.1 en este entorno: escribe UTF-8 **sin BOM** (`[IO.File]::WriteAllText` o scripts Node; nunca `Set-Content -Encoding utf8`), sin `&&`, sin `rg` (usa `Select-String`).
- El contenido visible de las 4 páginas está congelado salvo orden explícita (GATE 9.4): cambios de copy pasan por revisión.

## Documentación
- `docs/SPEC.md` (contrato de contenido/rutas), `docs/CONSTRAINTS.md` (umbrales: a11y ≥ 95, SEO ≥ 95, perf desktop ≥ 90, LCP ≤ 2500 ms, CLS ≤ 0.1), `docs/VERIFICATION.md` (índice de reportes), `docs/ARCHITECTURE.md` (arquitectura técnica).
- ADRs en `docs/adr/ADR-001..009` (estructura, tokens, i18n, PDFs, fuentes/iconos, lockfile, rutas relativas, a11y CV, deploy dual). Toda decisión no obvia debe quedar en un ADR.
- Reportes de verificación en `docs/verification/` (lint por fase, Lighthouse JSON, diffs de contenido, screenshots).
- Git: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`), mensajes a menudo en español.
