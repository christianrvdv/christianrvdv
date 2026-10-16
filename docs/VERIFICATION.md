# VERIFICATION — índice de criterios y reportes

*(Placeholder creado en GATE 4 (flag F2). Rellenar en FASE 9.)*

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
| 4 | — | lint = 47 (CSS only; gate lint nivel 1, no-regresión) |
| 5 | `docs/verification/lint-fase5.md` | done (lint 34 = todo `no-inline-style`; main.css 31033 B; deuda inline → FASE 6) |
| 6 | `docs/verification/lint-fase6.md` | done (lint 0; N4 0; fonts 82196/307200 B; texto visible intacto; Lighthouse baseline ×4 en `docs/verification/lighthouse-fase6-*.json`) |
| 7 | `docs/verification/pdfs-fase7.md` | pendiente |
| 8 | `docs/verification/rutas-fase8.md` | pendiente |
| 8.5 | `docs/verification/fase8.5-audit.txt` + `docs/verification/fase8.5-screenshots/` | done (rutas relativas Netlify+GH Pages; 32 instancias `/assets` → 0 internas; dual-sim :8888/:9999 14×200; 8 screenshots con pares byte-idénticos; 0×404/0 errores consola; `cv/ats` intocado; ADR-007) |
| 9 | `docs/verification/final-fase9.md` (lint + Lighthouse + CWV + contenido + PDFs) | pendiente |
