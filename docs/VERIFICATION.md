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
| 5 | `docs/verification/lint-fase5.md` | pendiente |
| 6 | `docs/verification/lint-fase6.md` | pendiente |
| 7 | `docs/verification/pdfs-fase7.md` | pendiente |
| 8 | `docs/verification/rutas-fase8.md` | pendiente |
| 9 | `docs/verification/final-fase9.md` (lint + Lighthouse + CWV + contenido + PDFs) | pendiente |
