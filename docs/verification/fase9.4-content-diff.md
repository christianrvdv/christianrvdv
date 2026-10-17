# FASE 9.4 — Content diff SPEC §7.1: 4 páginas (baseline pre-refactor vs actual)

Fecha: 2026-10-17 · Playwright 1.64.1 (Chromium headless) · baseline: worktree de `d1f0ddf` (`chore: baseline before refactor`) en `:9999` · actual: repo en `:8888`.

## Objetivo (SPEC §7.1)

Comprobar que el refactor (UI/estructura) **no cambió el texto visible** de las 4 páginas: el diff solo puede contener diferencias de whitespace/presentación; cualquier cambio de contenido textual es una violación.

## Protocolo de extracción

- 8 extracciones (4 páginas × baseline/actual), viewport fijo **1280×720**, contexto frío por página.
- Inyección de `localStorage.language` **antes** del render en las páginas CV del baseline (`es` para `/cv/`, `en` para `/cv/en/`): `cv_christian.html` solo lee localStorage (bug de i18n preexistente, ADR-003). **Inyección verificada**: el baseline `/cv/en/` renderizó "About Me" y no contiene "Sobre Mí" → comparación EN-rendered vs EN-rendered.
- Espera: `waitUntil: 'load'` + `document.fonts.ready` (race 3 s) + 500 ms (no se usó `networkidle` por dependencias CDN del baseline).
- Texto: `document.body.innerText` **sobre el documento vivo** tras eliminar `script, style, noscript, template, [hidden], [aria-hidden="true"]` (leer innerText de un clon desprendido degrada a textContent e incluye texto oculto).
- Normalización: `\r\n`→`\n`, colapso de `[ \t]+`→espacio, trim por línea, eliminación de líneas vacías. Sin filtrado por contenido.
- Extractos crudos (sin normalizar) quedaron en `%TEMP%\opencode\text\` (efímeros); los `.txt` versionados aquí son los normalizados, que son los que producen los diffs commiteados.

## Tabla resumen

| Página | Líneas baseline | Líneas actual | Diff (líneas ±) | Clasificación | Veredicto |
|---|---|---|---|---|---|
| `/` | 187 | 188 | +1 | aria-live `sr-only` dinámico (no visible) | **PASS** |
| `/cv/` | 101 | 114 | ~10−/23+ | mayúsculas (CSS) + reagrupación de líneas | **PASS** |
| `/cv/en/` | 101 | 114 | ~10−/23+ | idéntico a `/cv/` (EN) | **PASS** |
| `/cv/ats/` | 70 | 70 | **0** (diff vacío, exit 0) | idéntico | **PASS** |

**Verificación fuerte — stream de tokens (whitespace colapsado, case-insensitive, mismo orden):**

| Página | Tokens baseline | Tokens actual | case-insensitive |
|---|---|---|---|
| `/` | 1395 | 1399 (+4 = el aria-live) | idéntico hasta el token final extra |
| `/cv/` | 652 | 652 | **IGUAL palabra por palabra** |
| `/cv/en/` | 613 | 613 | **IGUAL palabra por palabra** |
| `/cv/ats/` | 497 | 497 | **IGUAL** (también case-sensitive) |

## Detalle por página

### `/` (portafolio) — 1 línea de diff

```
+Idioma cambiado a español
```

**Clasificación: no-contenido (chrome de a11y, invisible).** Es un `div` `role="status"` `aria-live="polite"` clase `sr-only` que `assets/js/modules/i18n.js:65-71` **crea en runtime** al init, con texto del anuncio de cambio de idioma, y **elimina a los 1500 ms**. La captura ocurrió dentro de esa ventana y `innerText` incluye texto clipped (`sr-only` = clip 1px). El baseline no tenía este anunciador (se añadió en la fase i18n previa ya aprobada). Los 1395 tokens restantes del portafolio son **idénticos palabra por palabra**: el rediseño bento preservó todo el texto visible.

### `/cv/` (CV ES) — 97 líneas de diff, dos causas

1. **Mayúsculas (presentación, no contenido)**: 7 titulares (`FULL STACK DEVELOPER`, `SOBRE MÍ`, `EXPERIENCIA`, `ESTUDIOS`, `PROYECTOS DESTACADOS`, `HABILIDADES TÉCNICAS`, `IDIOMAS`). Verificado en runtime: el `<h2 data-i18n="cv.about.title">` tiene `textContent: "Sobre Mí"` (**idéntico al baseline**) y `innerText: "SOBRE MÍ"` porque `getComputedStyle.textTransform = 'uppercase'` (fuente: `assets/css/cv.css:123,186,309` + utilidad Tailwind `.uppercase`). §7.1 protege el **contenido textual**, no la transformación de presentación: el DOM y el diccionario i18n no cambian.
2. **Reagrupación de líneas (whitespace)**: el baseline agrupaba varias piezas en una línea de innerText (p. ej. `Imprimir Descargar PDF`, la línea de contacto completa, `SGR-Turnos Symfony 8`) y el actual las separa (los mismos tokens en líneas distintas, por el nuevo layout en bloque). El diff exacto está en `docs/verification/fase9.4-diff-cv-es.txt`.

El stream de tokens case-insensitive es **IGUAL (652 = 652)**: cero cambio, adición o pérdida de palabras.

### `/cv/en/` (CV EN) — 97 líneas de diff, mismas dos causas

Aplicando la inyección correcta, el diff es el análogo EN del CV ES: mismos titulares en mayúsculas (presentación) y mismas reagrupaciones de líneas. Stream de tokens case-insensitive **IGUAL (613 = 613)**. **No aparece ningún "Sobre Mí" vs "About Me"**: la inyección de `localStorage.language = 'en'` en el baseline funcionó (si hubiera fallado, el diff mostraría el bug de i18n del baseline como si fuera regresión — comprobado que no es el caso). Dato relevante de la comparación: el baseline EN ya traía "Symfony 7/8" y todo el texto de la maestría/harness, es decir, el contenido EN post-refactor es el mismo.

### `/cv/ats/` (CV ATS) — 0 líneas de diff

`git diff --no-index` exit **0**, archivo de diff vacío (0 bytes): los 497 tokens son idénticos **case-sensitive**, es decir, el ATS es byte a byte el mismo texto visible. El ATS nunca tuvo i18n y el wrapping `<main>` (B2 de 9.3) no altera innerText.

## Conclusión

**Cero cambio de contenido textual en las 4 páginas. GATE 9.4 (content diff §7.1): PASS.**

- Las 4 páginas conservan su texto visible palabra por palabra (verificación por stream de tokens).
- Los dos diffs presentes están clasificados y justificados: anuncio `aria-live` `sr-only` de a11y (`/`) y `text-transform: uppercase` de presentación (CV ES/EN). Ninguno altera el contenido del DOM ni el diccionario i18n (SPEC §7.1 intacto).
- El diff del ATS es vacío (control negativo del método).
- El bug de i18n del baseline (ruta EN dependiente de localStorage, ADR-003) fue neutralizado con la inyección, tal como preveía el plan: sin ella el diff habría mostrado "Sobre Mí" vs "About Me" como falsa regresión.

## Artefactos

- `docs/before/{index,cv-es,cv-en,cv-ats}.txt` — texto visible normalizado del baseline `d1f0ddf` (reconstruible vía `git worktree add <dir> d1f0ddf`).
- `docs/after/{index,cv-es,cv-en,cv-ats}.txt` — texto visible normalizado del HEAD actual.
- `docs/verification/fase9.4-diff-{index,cv-es,cv-en,cv-ats}.txt` — salida de `git diff --no-index` (el de ATS es vacío = sin diferencias).
- Los diffs quedan así auditables: regenerar con `git diff --no-index docs/before/X.txt docs/after/X.txt`.
