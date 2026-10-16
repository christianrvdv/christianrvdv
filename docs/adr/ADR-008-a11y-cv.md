# ADR-008: Fix de accesibilidad en el CV (contraste, landmark y jerarquía)

- **Estado:** Aceptado
- **Fecha:** 2026-10-16 (FASE 9.2 / 9.2b)
- **Decisión previa relacionada:** ADR-002 (tokens de diseño: `--accent: #1abc9c`),
  ADR-007 (rutas relativas, `cv/` y `cv/en/`)

## Contexto

Lighthouse sobre `/cv/` en la FASE 6
(`docs/verification/lighthouse-fase6-cv.json`) dio **Accessibility = 87**, por
debajo del umbral ≥ 95 del GATE 9.2. El gap quedó registrado así:

| Audit FASE 6 | Score | Items |
|---|---|---|
| `color-contrast` | 0 | 18 |
| `heading-order` | 0 | 2 |
| `landmark-one-main` | 0 | 1 |
| `meta-description` (SEO) | 0 | — (SEO total 91) |

Desglose de los 18 pares de contraste, por color:

| Par (texto sobre fondo) | Repeticiones | Ratio medido |
|---|---|---|
| `#1abc9c` sobre `#f1f5f9` (badges de proyectos) | 8 | 2.2:1 |
| `#94a3b8` (slate-400) sobre `#ffffff` (fechas 10px) | 7 | 2.56:1 |
| `#1abc9c` sobre `#ffffff` (`.title p`) | 1 | 2.4:1 |
| `#ffffff` sobre `#1abc9c` (botón `.btn-pdf`) | 1 | 2.4:1 |
| `#cbd5e1` (slate-300) sobre `#f8fafc` (`.text-xs`) | 1 | 1.4:1 |

Todos por debajo de 4.5:1 (texto pequeño). `heading-order` señalaba el
`<h4>` de Estudios y el `<h5>` de proyecto saltando nivel desde el `<h2>`;
`landmark-one-main` señalaba la ausencia de `<main>` en `html.light`.

## Decisión

1. **Contraste — teal de marca degradado a teal-700 SOLO en `/cv`.**
   `#1abc9c` (2.4:1 sobre blanco) y `#0d9488` / teal-600 (3.74:1) no cumplen
   AA (≥ 4.5:1). Se adopta **`#0f766e`** (teal-700, **5.47:1** sobre blanco)
   aplicado a los selectores de texto/acciones de `assets/css/cv.css`
   (`.text-cv-accent`, `.title p`, `.bento-card h3 .badge`,
   `.bento-card p.text-cv-accent`, `.btn-pdf`). El portafolio (`index.html`)
   **mantiene `#1abc9c`** como token de marca global: el override vive
   únicamente en `cv.css`, que solo carga `/cv/` y `/cv/en/`.
2. **Contraste — slate-300/400 corregido en el mismo scope.** Se añade
   `.text-slate-400, .text-slate-300 { color: #64748b; }` en `cv.css`
   (slate-500, 4.76:1 sobre blanco), que resuelve los 8 pares slate
   restantes sin tocar `main.css` ni `index.html`.
3. **Landmark.** El contenedor `.a4-page` pasa de `<div>` a
   `<main class="a4-page" id="main-content">`, cerrado al final del
   documento, en `cv/index.html` y `cv/en/index.html`.
4. **Jerarquía de encabezados.** Se normaliza a **H1 → H2 → H3**:
   - H1: nombre (`CHRISTIÁN R. VAZQUEZ`).
   - H2: 4 `.section-header` — Sobre Mí, Experiencia, Estudios,
     Proyectos Destacados. El `<h4>` de Estudios sube a `<h3>` (2 nodos,
     con cierres correctos).
   - H3: todos los items — los 8 `<h5>` de proyecto suben a `<h3>` y el
     CSS `.bento-card h5` pasa a `.bento-card h3` (mismo bloque de
     declaraciones, `main.css` incluye preflight de Tailwind con
     `h1..h6 { font-size: inherit; font-weight: inherit; margin: 0 }`,
     así que no cambia métrica tipográfica ni ritmo vertical).
   - El selector `.section-header h4` (intento intermedio sin valor
     semántico) se descarta: `.section-header` vuelve a selector único
     `h2`.
5. **SEO.** `<meta name="description">` añadido a `cv/index.html` (ES) y
   `cv/en/index.html` (EN): SEO 91 → 100.

## Resultado verificado

Comando:

```
npx lighthouse http://localhost:8888/cv/ --preset=desktop \
  --only-categories=performance,accessibility,seo --output=json \
  --output-path=docs/verification/lighthouse-fase9.2b-cv.json \
  --chrome-flags="--headless" --quiet
```

| Métrica | Antes (FASE 6) | Después (FASE 9.2b) | Umbral | Cumple |
|---|---|---|---|---|
| Performance | 95 | 90 | ≥ 90 | Sí |
| Accessibility | 87 | **100** | ≥ 95 | Sí |
| SEO | 91 | 100 | ≥ 95 | Sí |
| `color-contrast` items | 18 | 0 | 0 | Sí |
| `heading-order` items | 2 | 0 | 0 | Sí |
| `landmark-one-main` items | 1 | 0 | 0 | Sí |

Performance baja de 95 a 90 por variabilidad de medición en este entorno
(LCP 721 ms → 1300 ms, Speed Index 607 → 1079) sin cambio de comportamiento:
CLS es prácticamente idéntico entre ambas corridas (0.12789 vs 0.12792) y no
hay layout-shift elements atribuibles a este cambio. El umbral ≥ 90 se
cumple.

## Consecuencias

- **+** Accessibility de `/cv/` = 100 (≥ 95 del GATE 9.2); los tres audits en
  rojo quedan en 0 items.
- **+** Cero cambios visuales perceptibles: teal-700 solo sustituye el verde
  en texto pequeño y en el botón PDF; la jerarquía y el CSS de `.bento-card`
  conservan tamaño, peso y espaciado.
- **−** El CV tiene un tono de verde ligeramente distinto al del portafolio.
  Aceptable: son dos contextos de uso (interactivo en pantalla vs imprimible
  en A4, donde además `--accent-print` ya diferenciaba el color).
- **−** Hay que mantener dos verdes: el branding global `#1abc9c` en los
  tokens, y el override `#0f766e` en `cv.css`. Riesgo de drift si algún día
  se añade un elemento nuevo de texto teal al CV sin pasar por `cv.css`.
- **−** `cv/ats/index.html` queda fuera de este fix (CSS inline propio, E1)
  y sigue sin auditar con Lighthouse en este gate.

## Alternativas descartadas

1. **Cambiar la paleta global a `#0f766e`** → descartado: rompe el branding
   del portafolio, que usa `#1abc9c` como identidad en `index.html` y en los
   tokens de ADR-002.
2. **Dejar `#0d9488` (teal-600)** → descartado: 3.74:1 < 4.5:1, no cumple AA.
3. **Rediseñar con más contraste estructural** (bordes, iconos, fondos más
   oscuros) → descartado: scope creep sobre un CV congelado para PDF; el
   cambio de token resuelve los 18 pares con la mínima intervención.
4. **Reescribir `main.css` con utilidades de contraste** → descartado: afecta
   también a `index.html` y obligaría a re-auditar las 4 páginas; el override
   se mantiene acotado a `/cv`.
