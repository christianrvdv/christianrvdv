# FASE 9.3 — Lighthouse final: 4 páginas × desktop/móvil × 3 corridas

Fecha: 2026-10-16 · Lighthouse **13.5.0** · Chrome headless · servidor local `node scripts/serve.mjs 8888` · categorías: `performance, accessibility, seo`.

## Protocolo de medición

- 3 corridas por página/modo; el valor de gate es la **mediana** (Chrome headless tiene varianza por estado de cache y carga de CPU).
- Desktop: `--preset=desktop`. Móvil: preset default de Lighthouse (simulación Moto G Power, 4x CPU, red 1.6 Mbps).
- Umbral duro: a11y ≥ 95, SEO ≥ 95, perf desktop ≥ 90. Perf móvil ≥ 85 (no bloqueante si desktop ≥ 90, con gap documentado).
- Los JSONs de cada corrida están en este directorio: `lighthouse-fase9-{index|cv|cv-en|cv-ats}-{desktop|mobile}-run{1|2|3}.json` (24 archivos).

## Tabla resumen (medianas)

| Página | Modo | Perf | A11y | SEO | ¿Cumple? |
|---|---|---|---|---|---|
| `/` | Desktop | **98** | 98 | 100 | ✅ (a11y 98 ≥ 95) |
| `/` | Móvil | **92** | 100 | 100 | ✅ |
| `/cv/` | Desktop | **100** | 100 | 100 | ✅ |
| `/cv/` | Móvil | **98** | 100 | 100 | ✅ |
| `/cv/en/` | Desktop | **100** | 100 | 100 | ✅ |
| `/cv/en/` | Móvil | **98** | 100 | 100 | ✅ |
| `/cv/ats/` | Desktop | **100** | 96 | 100 | ✅ (a11y 96 ≥ 95) |
| `/cv/ats/` | Móvil | **100** | 96 | 100 | ✅ |

**Los 8 combos cumplen los tres umbrales. Ningún umbral duro falla.**

## Detalle por página (3 corridas → mediana)

```
/ Desktop:
  Perf:  78, 98, 99            → mediana 98   (rango 21 — ver G4)
  A11y:  98, 98, 98            → mediana 98   (rango 0)
  SEO:   100, 100, 100         → mediana 100  (rango 0)
  LCP:   2332, 952, 807 ms     → mediana 952 ms
  TBT:   0, 0, 0 ms            → mediana 0 ms
  CLS:   0.0001, 0.0001, 0.0001 → mediana 0.0001

/ Móvil:
  Perf:  79, 93, 92            → mediana 92   (rango 14 — ver G4)
  A11y:  100, 100, 100         → mediana 100  (rango 0)
  SEO:   100, 100, 100         → mediana 100  (rango 0)
  LCP:   3024, 2780, 2846 ms   → mediana 2846 ms
  TBT:   526, 154, 0 ms        → mediana 154 ms
  CLS:   0.012, 0.012, 0.012   → mediana 0.012

/cv/ Desktop:
  Perf:  100, 100, 100         → mediana 100  (rango 0)
  A11y:  100, 100, 100         → mediana 100  (rango 0)
  SEO:   100, 100, 100         → mediana 100  (rango 0)
  LCP:   618, 614, 557 ms      → mediana 614 ms
  TBT:   0, 0, 0 ms            → mediana 0 ms
  CLS:   0, 0, 0               → mediana 0

/cv/ Móvil:
  Perf:  98, 97, 98            → mediana 98   (rango 1)
  A11y:  100, 100, 100         → mediana 100  (rango 0)
  SEO:   100, 100, 100         → mediana 100  (rango 0)
  LCP:   2343, 2463, 2321 ms   → mediana 2343 ms
  TBT:   19, 6, 7 ms           → mediana 7 ms
  CLS:   0, 0, 0               → mediana 0

/cv/en/ Desktop:
  Perf:  100, 100, 100         → mediana 100  (rango 0)
  A11y:  100, 100, 100         → mediana 100  (rango 0)
  SEO:   100, 100, 100         → mediana 100  (rango 0)
  LCP:   584, 604, 551 ms      → mediana 584 ms
  TBT:   0, 0, 0 ms            → mediana 0 ms
  CLS:   0, 0, 0               → mediana 0

/cv/en/ Móvil:
  Perf:  98, 98, 98            → mediana 98   (rango 0)
  A11y:  100, 100, 100         → mediana 100  (rango 0)
  SEO:   100, 100, 100         → mediana 100  (rango 0)
  LCP:   2323, 2332, 2316 ms   → mediana 2323 ms
  TBT:   18, 0, 9 ms           → mediana 9 ms
  CLS:   0, 0, 0               → mediana 0

/cv/ats/ Desktop:
  Perf:  100, 100, 100         → mediana 100  (rango 0)
  A11y:  96, 96, 96            → mediana 96   (rango 0 — ver G1)
  SEO:   100, 100, 100         → mediana 100  (rango 0)
  LCP:   306, 266, 243 ms      → mediana 266 ms
  TBT:   0, 0, 2 ms            → mediana 0 ms
  CLS:   0, 0, 0.003           → mediana 0

/cv/ats/ Móvil:
  Perf:  97, 100, 100          → mediana 100  (rango 3)
  A11y:  96, 96, 96            → mediana 96   (rango 0 — ver G1)
  SEO:   100, 100, 100         → mediana 100  (rango 0)
  LCP:   874, 951, 941 ms      → mediana 941 ms
  TBT:   181, 10, 10 ms        → mediana 10 ms
  CLS:   0, 0, 0               → mediana 0
```

## Bloqueador detectado y corregido dentro de 9.3 (performance de los CV)

La primera tanda de corridas (pre-fix) dio **`/cv/` desktop perf mediana 87 < 90 → umbral duro roto**, con móvil aún peor:

| Combo | Perf antes (3 corridas) | CLS antes | Perf después (3 corridas) | CLS después |
|---|---|---|---|---|
| `/cv/` desktop | 93, 87, 87 → **87** ❌ | 0.150 – 0.221 | 100, 100, 100 → **100** | 0 |
| `/cv/` móvil | 76, 75, 78 → **76** | 0.331 | 98, 97, 98 → **98** | 0 |
| `/cv/en/` desktop | 94, 94, 90 → **94** | 0.128 – 0.147 | 100, 100, 100 → **100** | 0 |
| `/cv/en/` móvil | 78, 79, 94 → **79** | 0.352 / 0.352 / 0 | 98, 98, 98 → **98** | 0 |

Diagnóstico (auditoría `layout-shifts`, peso 25 en performance):

1. **Fuentes web que llegaban después del FCP.** Las 3 fuentes Font Awesome (`fa-solid-900`, `fa-regular-400`, `fa-brands-400`) e `inter-latin` se descubrían desde los CSS (cadena render-blocking) y aplicaban el swap sobre contenido ya pintado → 2–3 layout shifts (sección EXPERIENCIA + párrafo "about", 0.14 + 0.08 desktop / 0.33 móvil).
2. **Contenido `data-i18n` vacío rellenado por JS.** 12 elementos por página (`cv.about.p1..p4` + 9 `<li>` de experiencia) estaban **vacíos** en el HTML y se rellenaban desde `assets/i18n/cv.{es,en}.json` tras la ejecución de `cv.js` (~2.8 s tras navStart) → todo el bloque inferior se desplazaba (shift residual de 0.13 desktop / 0.32 móvil una vez resuelto el punto 1).

Fixes aplicados (solo HTML, sin tocar CSS ni JS):

- `cv/index.html` y `cv/en/index.html`: `<link rel="preload" as="font" ... crossorigin>` para las 3 fuentes FA + `inter-latin.woff2` (4 preloads, ~78 KB en total), de modo que las fuentes lleguen antes del primer paint.
- `cv/index.html` y `cv/en/index.html`: los 12 `data-i18n` vacíos se prefilaron con **el mismo texto del diccionario** (`cv.es.json` en `/cv/`, `cv.en.json` en `/cv/en/`). `applyTranslations` sigue haciendo `innerHTML` con el mismo contenido → cero desplazamiento. **No cambia el contenido visible**: es exactamente el texto que el JS ya mostraba; además mejora el render sin JS y el SEO inicial.
- Verificado: `html-validate` en `index.html` + los 3 CV → exit 0; sin mojibake UTF-8; sin BOM; los 12 elementos vacíos por página → 0.

## Gaps y justificaciones

- **G1 — `/cv/ats/` a11y 96 (no 100), ambos modos.** Auditoría `landmark-one-main` (peso 3, binary): el documento ATS no tiene landmark `<main>` (su raíz es `<div class="cv">`). **No bloqueante** (≥ 95). Fix propuesto (fuera del alcance de 9.3, que para el ATS solo contempla lang/meta): envolver `.cv` en `<main>` o añadir `role="main"` — sin cambio de contenido visible ni de layout. Pendiente de decisión en 9.4+.
- **G2 — `/` desktop a11y 98 (no 100).** Auditoría `heading-order` (peso 3): el `<aside>` lateral (`class="hidden lg:flex"`, index.html:165) contiene un `<h3>` "Christián V." (línea 172) **antes** del primer `<h2>` (línea 230). En móvil el aside está oculto → la auditoría no aplica y da 100. **No bloqueante** (≥ 95). Fix propuesto: cambiar ese `<h3>` por `<h2>` (el tamaño tipográfico viene de clases Tailwind, no del tag, por lo que no habría cambio visual) o mover el aside tras la primera sección.
- **G3 — `label-content-name-mismatch` en `#languageToggle`** (index, ambos modos). Auditoría con **peso 0** en la categoría accessibility → no afecta el score (móvil da 100 pese a fallar). Documentada como known-gap cosmético del nombre accesible del botón de idioma.
- **G4 — Varianza de performance en `/` (rangos 21 y 14 puntos).** Investigada: no es inestabilidad de la página. En la corrida lenta, **todas** las peticiones locales tardaron ~1 s (server TTFB observado 66 ms vs 13 ms en la corrida rápida; `main.css` 1077 ms, `avatar-200.webp` 1050 ms, etc.), con TBT = 0 y CLS = 0 — patrón de **contención de CPU de la máquina** (Chrome del usuario al 100 % de carga durante la sesión), no de la página. Las corridas 2 y 3 son estables (98/99 desktop, 92/93 móvil) y a11y/SEO tienen varianza 0 en las 24 corridas. Se usan medianas según protocolo; en `/cv/` y `/cv/en/` (medidos tras los fixes, en condiciones más calmadas) la varianza fue 0–1.
- **G5 — Sin compresión en el servidor local.** `uses-compression: false` en todos los JSONs: `scripts/serve.mjs` no gzip. Es artefacto del entorno local; en Netlify sí hay compresión. No afecta los scores de esta medición (auditoría con peso 0).

## Casos especiales (checklist de la fase)

- **A) ATS minimalista**: `<html lang="es">` ✅, `<meta name="viewport">` ✅, `<title>` descriptivo ✅, y **se añadió `<meta name="description">`** (faltaba; sin cambio de contenido visible). Resultado: perf 100, SEO 100, a11y 96 (G1).
- **B) Móvil del ATS**: sin problemas de viewport; perf 100 mediana, CLS 0. La única caída es la misma G1 de desktop.
- **C) `/cv/en/` lang**: el HTML tenía `lang="es"` mientras que `initCvI18n()` (cascada ADR-003) fija `document.documentElement.lang = 'en'` en runtime para esa ruta. Se corrigió el atributo estático a **`lang="en"`** para que el markup coincida con el contrato de la ruta también antes del JS y para crawlers sin render de JS.

## Cambios de código dentro de 9.3

```
 cv/ats/index.html |  1 +   (meta description)
 cv/en/index.html  | 31 ++++++++++-------------   (lang es→en, 4 preloads, 12 data-i18n rellenados)
 cv/index.html     | 29 ++++++++++++++++++------------   (4 preloads, 12 data-i18n rellenados)
```

No se tocaron CSS (`main.css`, `cv.css`, `fontawesome.css`), JS ni el index. `/cv/ats/index.html` solo recibió la meta description (contenido intacto).

## Conclusión

Umbral duro cumplido en las 8 combinaciones (a11y ≥ 95, SEO ≥ 95, perf desktop ≥ 90) y también en los umbrales suaves de móvil (≥ 85). **GATE 9.3: PASS → procede a FASE 9.4.**
