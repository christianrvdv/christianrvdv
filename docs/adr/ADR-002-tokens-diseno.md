# ADR-002: Tokens de diseño (W3C DTCG)

Fecha: 2026-10-15 · Estado: Aceptado (GATE 1) · Rutas/content confirmados (GATE 2, N1)

## Contexto

Los colores/variables viven duplicados: `:root` y `.dark` en `src/input.css`, más un segundo
conjunto de variables inline en el `<style>` del CV (`--accent`, `--bg`, …) con nombres
distintos para los mismos valores. `tailwind.config.js` ya mapea la mayoría de colores a
`var(--color-*)`, pero conviven mapeos de dos formas (`rgb(var(--…-rgb) / <a>)` vs `var(--…)`),
que es la fuente de confusión documentada en AGENTS.md.

## Decisión

### Rutas físicas (confirmadas, GATE 2 N1)
- `src/input.css` → **`git mv` a `src/styles/input.css`** (renombrado en FASE 3, no es fix de bug).
- **`src/styles/tokens.css` se crea nuevo** (FASE 4) y `input.css` lo importa con **ruta
  relativa**: `@import "./tokens.css";`.
- `tailwind.config.js` actualiza `content` a
  `["./*.html", "./cv/**/*.html", "./assets/js/**/*.js"]` — hoy solo escanea la raíz, así que
  tras FASE 3 las clases usadas en `cv/**` y en los módulos JS de `assets/js/` quedarían
  fuera del build (purge silencioso).

### Tokens
- **Fuente única de verdad**: `src/styles/tokens.css`, formato **W3C DTCG**:
  cada declaración envuelta en un comentario `/* @tokens */` con bloques `$value`/`$type`
  (compatibles con el visualizer de los DTCG Design Tokens tools), además de las Custom
  Properties CSS resultantes (`--color-primary`, `--color-accent-rgb`, …) que es lo que
  consumen Tailwind y los componentes.
- `src/styles/input.css` hace `@import "./tokens.css";` como primer desclaration.
- **Clasificación de mapeo en `tailwind.config.js`** (sin excepciones):
  - Colores que admiten `bg-primary/50` → `rgb(var(--color-*-rgb) / <alpha-value>)`
    → requieren triple RGB en `:root` **y** `.dark`.
  - Todo lo demás → `var(--color-*)` plano.
- Los tokens específicos del CV se renombran al namespace `--cv-*` (p. ej. `--accent` →
  `--cv-accent`) apuntando a los mismos valores semánticos; el CSS inline del CV se elimina
  en FASE 6 y pasa a `assets/css/cv.css` usando los tokens globales.
- Paleta verificada como inmutable en FASE 4: `#1abc9c` (primary), `#7c5cfc` (accent/secondary),
  Inter (headings/body), dark/light con clase `dark`.

## Consecuencias

- **+** Un cambio de color se hace en un solo archivo y afecta portafolio + CV + Tailwind.
- **+** La clasificación de tokens elimina el doble estilo de tailwind.config (gotcha AGENTS.md).
- **+** `$value`/`$type` DTCG deja el camino abierto a exportar JSON de tokens después,
  sin migrar nada.
- **−** FASE 4 debe verificar `bg-*/<alpha>` legados: cualquier token que pierda su triple RGB
  rompe opacidad silenciosamente → checklist de verificación en `docs/VERIFICATION.md`.
- **−** No se introduce dependencia `@tokens-studio/css` ni postcss plugin (regla 5): el
  formato DTCG es comentario+convención, consumible a mano.

## Alternativas consideradas

1. **Tailwind Design Tokens (`@tokens-studio/css`)**: convierte DTCG real a CSS, pero es una
   devDependency nueva que exige ADR y pipeline. Rechazado: la misión no aporta el valor extra.
2. **Tailwind v4 `@theme`**: migración de mayor alcance (v3 instalado, `content`/plugins cambian).
   Rechazado: fuera de alcance, riesgo alto de regresión visual.
3. **Dejar tokens en `input.css` y solo "renombrar"**: no elimina la duplicación CV↔global,
   que es el problema real. Rechazado.
