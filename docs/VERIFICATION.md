# VERIFICATION — índice de criterios y reportes

La fuente autoritativa de los umbrales es `docs/CONSTRAINTS.md`. Este índice enlaza los
reportes de verificación por fase alojados en `docs/verification/`.

## Criterios de aceptación final (resumen; FASE 9)

- `npm run lint:html` → 0 errores.
- Lighthouse desktop en `/`, `/cv`, `/cv/en`, `/cv/ats`: Performance ≥ 90,
  Accessibility ≥ 95, SEO ≥ 95; LCP ≤ 2500 ms, CLS ≤ 0.1, INP ≤ 200 ms (proxy TBT).
- Rutas: 200 en las 4 páginas canónicas; 301s de URLs viejas; 0 CDNs externos.
- PDFs: 3 archivos con texto seleccionable; CV ES ≤ 450 KB, CV EN ≤ 450 KB, ATS ≤ 200 KB.
- Contenido: diff de texto visible = solo rutas/marcado (sin cambios de contenido).

## Reportes por fase

| Fase | Reporte | Estado |
|---|---|---|
| 3 | `docs/verification/lint-baseline-fase3.md` | done (baseline 47) |
| 4 | — | done (lint = 47, CSS only; gate lint nivel 1, no-regresión) |
| 5 | `docs/verification/lint-fase5.md` | done (lint 34 = todo `no-inline-style`; deuda inline → FASE 6) |
| 6 | `docs/verification/lint-fase6.md` | done (lint 0; N4 0; fonts 82196/307200 B; texto visible intacto; Lighthouse baseline ×4 en `docs/verification/lighthouse-fase6-*.json`) |
| 6B | `docs/verification/redesign-fase6b-layout.md` + capturas | done (section-gap 64px; footer compacto alineado a la izquierda; proyectos 2 cols ≥768 con max-w-6xl; placeholders `[ Sin vista previa ]` i18n; 0 overflow en 320/375/768/1280) |
| 7 | ADR-004 + `docs/verification/fase9.5-pre-push.md` §9.5.4 | done (build-cv reproducible; PDFs regenerados y verificados: ≤450/450/200 KB, 2 págs., texto seleccionable decodificado, layout intacto) |
| 8 | `docs/verification/fase8-redirects.txt` + `docs/verification/fase9-301.txt` | done (301s legacy y 200s canónicas en `netlify dev`) |
| 8.5 | `docs/verification/fase8.5-audit.txt` + `docs/verification/fase8.5-screenshots/` | done (rutas relativas Netlify+GH Pages; 32 instancias `/assets` → 0 internas; dual-sim :8888/:9999 14×200; 8 screenshots con pares byte-idénticos; 0×404/0 errores consola; ADR-007) |
| 9.2/9.2b | ADR-008 + `docs/verification/lighthouse-fase9.2b-cv.json` | done (a11y CV 87 → 100: contraste teal-700, landmark, jerarquía) |
| 9.3 | `docs/verification/fase9-lighthouse.md` + `lighthouse-fase9-*.json` (24) | done (8/8 combos en umbral; remediación P1–P4: preloads, prefill EN, heading/landmark; FOUC 0 ms) |
| 9.4 | `docs/verification/fase9.4-content-diff.md` + `fase9.4-diff-*.txt` | done (diff de contenido 4 páginas: solo uppercase/marcado; auditoría pasiva aprobada) |
| 9.5 | `docs/verification/fase9.5-pre-push.md` + `lighthouse-fase9.5-*.json` (24) | done (pre-push: repo/debug/secretos limpios; Lighthouse sin regresiones; PDFs; smoke 301/200; diff global 33 commits sin hallazgos) |
| 9.5.5 | `docs/verification/fase9.6-push.md` §FASE 9.5.5 | done (OG/Twitter cards en 3 páginas; imagen `og-preview`) |
| 9.6 | `docs/verification/fase9.6-push.md` + `docs/verification/fase9.6-screenshots/` | done (push a producción; Netlify y GH Pages verificados 200; capturas byte-idénticas; GATE 9.6 PASS) |
| 10 | `docs/ARCHITECTURE.md` + ADR-009 + este índice | done (documentación de cierre; imagen OG optimizada a 1600×900 / <250 KB) |

**Refactor completado el 2026-10-17. 36+ commits. Todos los gates PASS.**

## Rediseño dirección B — Terminal Industrial (rama `redesign`)

Ciclo posterior al cierre del 2026-10-17. Stack y contenido congelados; solo cambia la capa visual/motion.

| Fase | Reporte | Estado |
|---|---|---|
| 4B | — | done (i18n clave-a-clave en `index.html`; borrados `theme.js`, `mobile-menu.js`, `active-nav.js`, `navbar.js`; 6 imágenes webp reales con `srcset`; 4 placeholders neutros) |
| 5 | `docs/MOTION.md` + `docs/verification/fase5-nojs-{375,1280}.png` | done (IO único para 22 `[data-animate]`; curvas 200 ms expo / 320 ms quart verificadas; stagger 40 ms; reduced-motion en estado final; hero iPhone SE `CTA bottom 602 ≤ 667`) |
| 6 | `docs/verification/redesign-fase6-auditoria.md` | done (scorecard 92.3/100, color 95; 0 anti-patrones en portafolio; 0 errores/404 en Netlify raíz + GH Pages subdirectorio; skip link corregido; `.hidden` eliminada) |
