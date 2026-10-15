# Reporte FASE 6 — CSS inline, imágenes y fuentes auto-hospedadas (2026-10-15)

Fase ejecutada en 6 commits: `7a18d59` (6a) · `d3df698` (6b) · `1a9f17c` (6c.1) ·
`37019c7` (6c.2) · `d92fa61` (6c.3) · `8c8e6d4` (6c.4). Rango gate: `448506d..8c8e6d4`.

## 6a — extracción de `<style>` inline

- `cv.css` extraído **byte-idéntico** al bloque original de ambos CVs.
- `cv/index.html` / `cv/en/index.html`: 1023 → **309 ln** (el `<head>` de CSS → link).
- Estado actual: `assets/css/cv.css` = **14 910 B** (14 693 B en 6a + clases de 6b
  `.cv-section-mb`/`.text-cv-accent`) ≤ 18 432 B (18 KB) ✅.

## 6b — eliminación de 34 estilos inline

- 6× `image-rendering: auto` → clase `.img-auto` (`src/styles/input.css`).
- 2×14 en CVs → `.avatar-relative` + `.cv-section-mb` + `.text-cv-accent` (1/3/10 por archivo).
- **`lint:html` = 0 — exit 0** (47 → 34 en FASE 5 → 0 en 6b). Baseline de
  `CONSTRAINTS.md` actualizado en este gate.
- **E1 respetado**: `cv/ats/index.html` no recibe ningún commit de la FASE 6
  (`git log 448506d..HEAD -- cv/ats/` → vacío).
- Corrección tras el gate: la clase `accent` no existía en ningún CSS (5 `p` por CV
  caían en `--text-muted`); renombrada a `.text-cv-accent` + regla
  `.bento-card p.text-cv-accent` (0,2,1) que gana a `.bento-card p`. Verificado por CDP:
  los 10 acentos = `rgb(26, 188, 156)`, `.cv-section-mb` = 28 px, avatar = `relative`.

## 6c.1 — avatar y rutas de imagen locales

- `assets/images/avatar-200.webp` 6 812 B · `avatar-400.webp` 21 826 B (≤ 80 KB) ✅.
- 11 referencias de avatar migradas de `avatars.githubusercontent.com` → locales
  (hero: `width`/`height`/`fetchpriority=high` + `srcset`; el resto `loading="lazy"`).
- `og:image`/`twitter:image` → URL absoluta canónica propia (los OG son inherentemente
  absolutos; no cuentan como CDN de assets).
- Corregidas 6 imgs de proyecto que apuntaban a `imagen/` (directorio **inexistente →
  404**) → `assets/images/projects/` con dimensiones intrínsecas reales.

## 6c.2 — Inter variable auto-hospedada

- `assets/fonts/inter-latin.woff2` = 72 920 B; `@font-face` Inter 300–800,
  `font-display: swap`, `unicode-range` latin en `src/styles/tokens.css`.
- **0 usos de latin-ext** (los 9 no-ASCII del sitio están todos en U+0000–00FF):
  `inter-latin-ext.woff2` (133 336 B) descartado; eliminado el bloque asociado en 6c.3.
- Links y preconnect de `fonts.googleapis.com`/`fonts.gstatic.com` eliminados de los
  3 HTML.

## 6c.3 — Material Symbols subset local

- 21 glifos (20 en HTML + `light_mode`/`dark_mode` inyectados por `theme.js`).
- `text=` param de Google servía 193 908 B / 2 524 glyphs (ligaduras rlig); subset
  propio con fontTools: cmap PUA `U+E000..U+E014` + drop GSUB/GPOS →
  `material-symbols-outlined-subset.woff2` = **1 912 B**.
- 30 spans de `index.html` → entidades numéricas `&#xE000;..&#xE013;`;
  `theme.js` → `&#xE014;` / `&#xE004;`.
- `assets/css/material-symbols.css` (936 B): `@font-face` + unicode-range + **clase
  `.material-symbols-outlined`** (sin ella: tofu — verificado en pantalla).

## 6c.4 — Font Awesome 6.4.0 auto-hospedado

- Inventario: 38 clases usadas = 27 `fas` + 10 `fab` + 1 `far` (`fa-envelope`);
  0 utilidades (`fa-fw`, `fa-spin`…); `cv/ats` **no usa FA ni enlaza cdnjs**.
- Subsets desde cdnjs oficiales: `fa-solid-900-subset.woff2` 3 612 B ·
  `fa-brands-400-subset.woff2` 3 064 B · `fa-regular-400-subset.woff2` 688 B.
- **Incidencia**: `fa-regular-400.woff2` oficial no decompila `glyf` en fontTools
  (md5 idéntico `61f30b79…` en cdnjs **y** jsDelivr → no es corrupción de descarga;
  los navegadores lo toleran). Ruta: subset desde `fa-regular-400.ttf` → export woff2.
- `assets/css/vendor/fontawesome.css` = 3 049 B: licencia/atribución FA completa,
  3 `@font-face` locales (`font-display: block`), 9 reglas base, 38 glyph rules.
- Link cdnjs reemplazado en los 3 HTML (en `index.html` la línea 42 quedó además
  normalizada: dos `<link>` mal concatenados → dos líneas indentadas).

## Verificaciones del gate

| Check | Resultado |
|---|---|
| `npm run lint:html` | **0 problems, exit 0** ✅ |
| N4 (`fonts.googleapis\|cdnjs.cloudflare\|avatars.githubusercontent` en HTML/CSS/JS) | **0 hits / 17 archivos** ✅ |
| Texto visible vs FASE 5 (`448506d`, sin estilos/scripts/glifos) | **idéntico**: 10 300 / 2 690 / 2 690 chars ✅ |
| Presupuesto `assets/fonts/` | **82 196 / 307 200 B** ✅ |
| Presupuesto `cv.css` | 14 833 / 18 432 B ✅ |
| Presupuesto avatares | 6 812 + 21 826 ≤ 81 920 B ✅ |
| `main.css` | 30 786 B / 34 674 B (≤ +15 %) · build **determinista** (SHA-256 idéntico) ✅ |
| `tokens.css` | 11 281 / 12 288 B (+636 B por `@font-face` Inter) ✅ |
| E1 `cv/ats/` | 0 commits de FASE 6 lo tocan ✅ |
| `git status` | limpio (solo docs de este gate) ✅ |

### Verificación visual (Chrome headless, servidor :8089)

| Página | Captura | Resultado |
|---|---|---|
| Página de prueba FA | `shots/fatest.png` | **38/38 glifos** sin tofu (27 solid + 10 brands + 1 regular) |
| `/` | `shots/f64-index-b.png` | hero completo: avatar local, **briefcase** + **download** FA, sol PUA |
| `/cv/` | `shots/f64-cv.png` | envelope/github/globe/phone/map, chips con FA, imprimir/PDF |
| `/cv/en/` | `shots/f64-cv-en.png` | idéntico a ES en estructura de iconos |

Nota: la primera captura de `/` salió en blanco por flake de `--virtual-time-budget`
(14 KB); reintentada con 15 000 ms → 101 KB con contenido. No es regresión.
Decisión **sellada** (pendiente desde FASE 5): `tel-non-breaking` —
`(+53)&nbsp;56449593` se mantiene; en pantalla aparece “(+53) 56449593” sin corte ✅.

### Lighthouse desktop (baseline FASE 6)

| Página | Performance | A11y | Best Practices | SEO | JSON |
|---|---|---|---|---|---|
| `/` | 99 | 98 | 96 | 100 | `lighthouse-fase6-index.json` |
| `/cv/` | 95 | 87 | 96 | 91 | `lighthouse-fase6-cv.json` |
| `/cv/en/` | 95 | 87 | 96 | 91 | `lighthouse-fase6-cv-en.json` |
| `/cv/ats/` | 100 | 96 | 96 | 90 | `lighthouse-fase6-cv-ats.json` |

A11y de CV = 87 es el baseline a subir ≥ 95 en FASE 9 (sin regresión vs FASE 6;
no se auditaron contraste/ARIA en esta fase).

## Cómo re-ejecutar

```powershell
npm run lint:html | Select-String problems        # esperado: 0 problems
(Get-ChildItem assets\fonts\* | Measure-Object Length -Sum).Sum   # 82196
py <script N4>                                    # 0 hits
npx --yes lighthouse http://127.0.0.1:8089/ --preset=desktop --output=json `
  --output-path=docs\verification\lighthouse-fase6-index.json --quiet `
  "--chrome-flags=--headless=new --no-sandbox --disable-gpu"
```

## Gate de esta fase

- [x] `lint:html` = 0 (nivel 2: < 34) ✅
- [x] N4 = 0 (0 CDNs de assets en HTML/CSS/JS) ✅
- [x] Presupuestos 6a–6c: cv.css / fonts / avatares ✅
- [x] Texto visible byte-idéntico vs `448506d` ✅
- [x] E1: `cv/ats/index.html` intacto ✅
- [x] Screenshots `/`, `/cv/`, `/cv/en/` sin regresiones; FA 38/38 glifos ✅
- [x] Lighthouse ×4 desktop → `docs/verification/lighthouse-fase6-*.json` ✅
