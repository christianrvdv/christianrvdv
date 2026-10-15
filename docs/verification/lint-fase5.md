# Reporte de lint HTML — FASE 5 (2026-10-15)

Comando: `npm run lint:html` → `npx html-validate index.html cv/**/*.html`
(html-validate 11.16.2, preset recommended por defecto).

**Resultado: ✖ 34 problems (34 errors, 0 warnings) — exit 1.**

Gate (nivel 2, gate que SÍ toca HTML — resolución D2 GATE 4): `conteo < gate anterior`.
- FASE 3 baseline = **47** → FASE 5 = **34** (−13). **✅ Cumple** (también ≤35, el objetivo operativo).
- Última restante antes de la corrección de botones fue 35; tras añadir `type="button"`
  al botón `backToTop` de `index.html` bajó a 34.

Estado: **las 34 restantes son toda `no-inline-style`** — deuda pre-existente, NO introducida
por la FASE 5. Toda se elimina en **FASE 6** (mover `style="…"` suelto a clases / `cv.css`),
de modo que el nivel de deuda cae a 0 en esa fase.

| Archivo | Errores | Detalle |
|---|---|---|
| `index.html` | 29 | `no-inline-style` (estilos inline residuales) |
| `cv/index.html` | 5 | `no-inline-style` (CV) |
| `cv/en/index.html` | 0 | pasa limpio |
| `cv/ats/index.html` | **0** | pasa limpio |

Totales por regla: `no-inline-style` ×34 · resto ×0.

Correcciones de HTML ya aplicadas en FASE 5 (−13 vs baseline 47):
- `no-implicit-button-type` ×5 → todos con `type="button"` (themeToggle, languageToggle,
  mobileMenuBtn, backToTop en `index.html`; `.btn-print` en ambos CV).
- `no-redundant-role` ×2 → `role="banner"`/`role="contentinfo"` eliminados de `index.html`.
- `no-raw-characters` ×3 → `&` → `&amp;` (idéntico al render).
- `tel-non-breaking` ×2 → `(+53)&nbsp;56449593` (mismo texto visible; decisión visual
  confirmada: evita corte de línea — pendiente de sellar en GATE 6).
- `no-inline-style` −1 de `index.html` (el del `backToTop`, al pasar a botón tipado).

## Efecto colateral del build (documentado, sin impacto visual)

`role="banner"`/`role="contentinfo"` contenían literalmente la palabra "inline" dentro del
valor del atributo. Al retirarlos, Tailwind dejó de "ver" ese literal y su scanner
(`tailwind.config.js` `content`) dejó de inyectar la utilidad huérfana `.inline`.

- `main.css` FASE 4 (HEAD): 31014 B → FASE 5: **31033 B** (+19 B).
- Único delta real vs HEAD: se **añade** `.inline{display:inline}` (+19 B). Cero eliminaciones,
  cero cambios de reglas existentes (verificado por diff de selectores, no por diff de línea
  — el archivo es un minificado de una sola línea, git lo reporta entero).
- Build **determinista** (dos corridas seguidas → mismo SHA-256), así que el delta es
  atribuible 1:1 al cambio de scanner, no a entropía.
- `.inline` sin uso = ~19 B inertes. Presupuesto: 31033 ≪ **35840 B** → **✅ cumple**.

## Cómo re-ejecutar

```powershell
npm run lint:html | Select-String problems   # esperado: 34 errors
npm run build:css                            # main.css 31033 B
(Get-Item assets\css\main.css).Length        # 31033
```

## Gate de esta fase

- [x] `lint:html` < 47 (nivel 2): 34 ✅
- [x] `main.css` ≤ 35840 B: 31033 ✅
- [x] Sin errores nuevos de reglas ≠ `no-inline-style` ✅
- [x] Deuda `no-inline-style` acotada a FASE 6 ✅
