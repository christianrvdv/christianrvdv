# Baseline de lint HTML — FASE 3 (2026-10-15)

Comando: `npm run lint:html` → `npx html-validate index.html cv/**/*.html`
(html-validate 11.16.2, preset recommended por defecto).

**Resultado: ✖ 47 problems (47 errors, 0 warnings) — exit 1.**

Estado: **deuda pre-existente**, no introducida por la FASE 3 (el HTML solo se movió con
`git mv`, cero edición). Regla transitoria acordada en GATE 3: no superar estas 47 cifras en
FASE 4–8 y llegar a **0 errores en FASE 9** (además de 0 errores nuevos en cualquier momento).

| Archivo | Errores | Detalle |
|---|---|---|
| `index.html` | 15 | 6 `no-inline-style` · 4 `no-implicit-button-type` · 3 `no-raw-characters` (`&` sin codificar) · 2 `no-redundant-role` (`banner`, `contentinfo`) · — |
| `cv/index.html` | 16 | 14 `no-inline-style` · 1 `no-implicit-button-type` · 1 `tel-non-breaking` (espacio normal en teléfono) |
| `cv/en/index.html` | 16 | idénticos a `cv/index.html` (mismo template) |
| `cv/ats/index.html` | **0** | pasa limpio (verificado con `npx html-validate cv/ats/index.html` → exit 0) |

Totales por regla: `no-inline-style` ×34 · `no-implicit-button-type` ×5 ·
`no-raw-characters` ×3 · `no-redundant-role` ×2 · `tel-non-breaking` ×2.

**Sin errores de rutas/activos:** html-validate no resuelve `href`/`src` contra el disco, así
que los enlaces rotos provocados por los `git mv` (los HTML aún apuntan a `estilo.css`,
`script.js`, `cv-translations.js`, `imagen/*.webp` — todo se reescribe en FASE 5/6) **no
aparecen aquí**. Esos se verifican con `netlify dev` + `curl` en FASE 8/9 y con la regla
"CDNs externos" de `CONSTRAINTS.md`.

Plan de corrección (FASE 6, sin cambio de contenido visible):
- `no-implicit-button-type`: añadir `type="button"` (5 elementos).
- `no-redundant-role`: eliminar `role="banner"`/`role="contentinfo"` redundantes (2).
- `no-raw-characters`: `&` → `&amp;` en 3 sitios (idéntico al render).
- `no-inline-style`: mover los `style="…"` sueltos a clases/`cv.css` (34).
- `tel-non-breaking`: espacio → `&nbsp;` en los 2 teléfonos (mismo texto visible, decisión
  visual: evita corte de línea — confirmar en GATE 6).

Baseline re-ejecutar: `npm run lint:html | Select-String problems`.
