# Rediseño · Fase 6B — densidad, footer y grid de proyectos

- **Rama:** `redesign` (base: `9d5e1dc`, Fase 6)
- **Cambios:** espaciado entre secciones, footer compacto estilo log, `projects-grid` a 2 columnas y placeholders con texto.
- **Resultado:** PASS — 0 overflow horizontal en 320/375/768/1280; 0 errores de consola; 0 respuestas ≥ 400.

## 1. Qué cambió

| Área | Antes | Después |
|---|---|---|
| `--space-section-gap` | `clamp(64px, 10vw, 128px)` | `64px` fijo |
| Contenedor | `max-w-5xl` (1024px) | `max-w-6xl` (1152px) |
| `.projects-grid` | 1 columna | 1 col < 768 · 2 cols ≥ 768 (gap 24px) |
| `.project-card` | `index · contenido · enlaces` en una fila | `index · contenido` + enlaces a lo ancho (todas las anchuras) |
| Footer | `padding` 1.5× section-gap, `space-between` | `padding` 24px, columna alineada a la izquierda |
| Enlaces del footer | cajas con borde | texto tipo log (`github telegram email`) con `min-height: 24px` |
| Placeholders | `>_` gigante (24px) vía `::after` | `[ Sin vista previa ]` 12px mono, muted, i18n |

## 2. Footer

- `padding: 24px` (antes ≈ 96–192px verticales).
- `footer__grid`: `flex-direction: column`, `align-items: flex-start`, `gap: 8px`; el `max-width` pasa a `72rem` para alinear con el contenedor.
- Los 4 enlaces quedan **en una sola fila**, debajo del copyright (`copyright.bottom 842` → `actions.top 850`), alineados a la izquierda.
- Altura del footer: **146px** a 375, **127px** a 768/1280 (antes ~250px).
- Enlaces a 26px de alto (≥ 24px de WCAG 2.2 · 2.5.8) sin caja visible.

## 3. Grid de proyectos

| Ancho | Columnas | Tarjeta | Contenido | Overflow X |
|---|---|---|---|---|
| 320 | 1 | 288px | 187px | no |
| 375 | 1 | 343px | 242px | no |
| 768 | 2 | 324px | 223px | no |
| 1280 | 2 | 516px | 415px | no |

- Imágenes: caja `aspect-ratio: 16/9`, `object-fit: cover` → relación renderizada 1.779 vs natural ~1.770, sin deformación.
- `sizes` pasa a `(max-width: 767px) 100vw, 50vw` para que el navegador elija el candidato correcto en 2 columnas.
- **Bug detectado y corregido:** con `grid-template-columns: auto minmax(0,1fr) auto` el contenido colapsaba a **0px** a 375 (las columnas `auto` se quedaban el ancho). Se pasó la tarjeta a 2 columnas con los enlaces a lo ancho; el contenido recuperó 242px y no hay elementos que escapen de la tarjeta.

## 4. Placeholders

- 4 tarjetas sin imagen muestran `[ Sin vista previa ]` en mono 12px, `--color-muted`.
- Contraste: **5.94:1** (oscuro) y **6.90:1** (claro) sobre `--color-surface-elevated`.
- Clave `projects.no_preview` en ambos diccionarios; el HTML prefiere el texto ES exacto (anti-FOUC). Verificado el cambio a EN → `[ No preview ]`.
- El bloque sigue `aria-hidden="true"` (decorativo).

## 5. Ritmo vertical

Las 5 secciones del contenedor tienen `margin-top: 64px` (la primera 0). Altura total de página a 1280: **7761px**.

## 6. Verificación

- `npm run build:css` ✔ · `npm run lint:html` exit 0 ✔ · `npm run lint:css` `verify-css: OK` ✔
- Overflow horizontal: 320/375/768/1280 → `scrollWidth === clientWidth`.
- 0 errores de consola, 0 `pageerror`, 0 respuestas ≥ 400.
- Capturas: `docs/verification/redesign-fase6b-projects-{375,768,1280}.png`, `redesign-fase6b-footer-1280.png`.
