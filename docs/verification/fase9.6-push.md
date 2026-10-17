# FASE 9.6 — Push a producción y verificación (GATE 9.6)

Fecha: 2026-10-17 · GATE previo: **9.5 GO (aprobado)** · Incluye FASE 9.5.5 (imagen Open Graph).

## FASE 9.5.5 — Imagen Open Graph / Twitter Cards

- Asset: `assets/images/og-preview.png` — **1 966 929 B (1.88 MB)**, 1672×941. ⚠️ **Advertencia no bloqueante**: supera el umbral advisory de 300 KB por ~6×; recomendable recomprimir a ≤300 KB (pngquant/oxipng o exportar a WebP/JPEG) en una iteración futura. Las URLs OG usan `?v=1` como cache-buster y Netlify sirve `/assets/images/*` con `immutable`, así que futuras rotaciones de imagen requieren cambiar el parámetro `v`.
- Nota menor: los metas declaran `og:image:width/height` 1600×900 (especificación del gate) mientras la imagen real es 1672×941 — los scrapers usan los bytes reales; no bloqueante.
- Bloque OG + Twitter aplicado a `index.html` (exactamente el bloque especificado: `summary_large_image`, imagen absoluta de Netlify, `og:locale` es_ES) y añadido a `cv/index.html` (es_ES, `/cv/`) y `cv/en/index.html` (en_US, `/cv/en/`) con sus descripciones respectivas.
- `npm run lint:html` → **exit 0** tras los cambios.
- Commit: `4cf37d3 feat(seo): imagen de previsualizacion Open Graph y Twitter Cards (FASE 9.5.5)`.

## Push

```
git push origin main
884b4a9..4cf37d3  main -> main
```

- Nota: el remote respondió `This repository moved. Please use the new location: https://github.com/christianrvdv/christianrvdv.git` — URL antigua con mayúscula redirige; el push llegó correctamente.

## Verificación Netlify (`https://christianrvdv.netlify.app/`)

| Check | Resultado |
|---|---|
| `HEAD /assets/images/og-preview.png?v=1` | **200**, `image/png`, 1 966 929 B, `Cache-Control: public,max-age=31536000,immutable` ✅ |
| `GET /` | **200** ✅ |
| HTML desplegado contiene `og-preview.png?v=1` y `summary_large_image` | ✅ |

## Verificación GitHub Pages (`https://christianrvdv.github.io/christianrvdv/`)

| Check | Resultado |
|---|---|
| `HEAD /christianrvdv/` | **200** ✅ |
| `HEAD /christianrvdv/assets/css/main.css` | **200** ✅ |

## Smoke visual de producción (Playwright, Chromium, 1440×900)

4 capturas en `docs/verification/fase9.6-screenshots/`:

| Archivo | Origen | Tema | SHA256 |
|---|---|---|---|
| `netlify-light.png` | Netlify | light | `0E0C36A3…16BF3` |
| `ghpages-light.png` | GitHub Pages | light | `0E0C36A3…16BF3` |
| `netlify-dark.png` | Netlify | dark | `AE5295FB…F5C89` |
| `ghpages-dark.png` | GitHub Pages | dark | `AE5295FB…F5C89` |

- **Netlify y GitHub Pages son byte-idénticos** (mismo hash por tema): fuentes Inter, iconos Material Symbols, avatar, gradiente del título y dark mode renderizan igual en ambos orígenes.
- Errores de consola/página/peticiones fallidas en las 4 cargas: **0**.
- Dark mode aplicado (`<html class="dark">`, toggle luna/sol operativo).

## GATE 9.6: **PASS** ✅

- `main` empujado completo (refactor FASE 1–9 + OG) a `origin/main`.
- Netlify y GitHub Pages sirviendo el mismo árbol, sin errores de CSS/JS.
- Pendiente cosmético documentado (no bloqueante): recomprimir `og-preview.png` (1.88 MB → ≤300 KB) y alinear width/height declarados con los reales.

**¿Listo para FASE 10 (documentación)? Sí.**
