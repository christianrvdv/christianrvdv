# Constraints

Last reviewed: 2026-10-15 (FASE 1). Proyecto: refactor estructural portafolio + CV.

> Lee `docs/SPEC.md` antes de escribir código. **No debilitar este archivo para que un cambio pase.**

## Floor (siempre, sin setup)

- Cero cambios de contenido textual: nombres, apellidos, emails, teléfonos, fechas,
  tecnologías, descripciones, traducciones ES/EN, URLs externas (`https://…`).
  Ver método de verificación en `docs/SPEC.md` §7.1.
- Cero rediseño visual: paleta `#1abc9c` / `#7c5cfc`, dark/light con clase `dark`, tipografía
  Inter, layout actual intacto.
- Cero pérdida de funcionalidad: tema, i18n ES/EN, menú móvil, sticky navbar, back-to-top,
  animaciones scroll, nav activa, formulario Netlify.
- Cero rotura de URLs: `/`, `/cv`, `/cv-en`, `/cv/en`, `/cv/ats`, `/imagen/*.webp`,
  `/*.pdf` (tabla completa en `docs/SPEC.md` §4). Sin catch-all redirect.
- Sin frameworks (React/Vue/…) y sin CDNs nuevos. Vanilla HTML/CSS/JS.
- Sin dependencias nuevas sin ADR. Única autorizada: `playwright` (ADR-004). `sharp` **descartado** (GATE 1/Q6).
- Sin suppressions nuevas: `eslint-disable`, `html-validate --rule … off`, `@ts-ignore`.
- No hand-editar CSS compilado (`estilo.css` → `assets/css/main.css`): solo `src/styles/`.
- UTF-8 intacto (PowerShell puede mostrar mojibake; es la consola, no el archivo).
- Los PDFs existentes no se tocan hasta FASE 7.
- Este archivo no se debilita para que un cambio pase; endurecer es silencioso, aflojar es ruidoso.

## Enforced with numbers

| Dimensión | Regla | Comando (Checked by) | Cuándo corre |
|---|---|---|---|
| Build | exit 0, sin warnings de Tailwind | `npm run build` | cada commit de fase |
| HTML | 0 errores de validación | `npm run lint:html` (`npx html-validate`) | cada commit de fase |
| Performance | Lighthouse ≥ 90 (desktop) en `/`, `/cv`, `/cv/en`, `/cv/ats` | `npx lighthouse <url> --preset=desktop --output=json` | FASE 9 + PR |
| Accessibility | Lighthouse ≥ 95 (4 páginas) | ídem (`--preset=desktop`) | FASE 9 + PR |
| SEO | Lighthouse ≥ 95 (4 páginas) | ídem | FASE 9 + PR |
| A11y (contraste/ARIA) | 0 errores críticos | `wcag-ai-skill` + revisión manual teclado | FASE 9 |
| Core Web Vitals | LCP ≤ 2500 ms, CLS ≤ 0.1, INP ≤ 200 ms (lab proxy: TBT) | Lighthouse JSON | FASE 9 |
| Rutas | 200 en `/`, `/cv`, `/cv/en`, `/cv/ats`; 301 en URLs viejas | `netlify dev` + `curl -I` | FASE 8–9 |
| Contenido | diff de texto visible = solo rutas/marcado | `diff docs/before/*.txt docs/after/*.txt` | FASE 9 |
| PDFs | 3 archivos, texto seleccionable; CV ES ≤ 450 KB · CV EN ≤ 450 KB · **CV ATS ≤ 200 KB** (canario: si lo supera ⇒ fuente mal subsetteada o imagen colándose) | `npm run build:cv` (exit 1 si se supera) + apertura en Chrome | FASE 7 |
| Tamaño CSS | `assets/css/main.css` ≤ 35 KB (baseline hoy: `estilo.css` 30 KB) | `Get-Item` | cada build |
| CDN externos | 0 referencias a `fonts.googleapis` / `cdnjs.cloudflare` / `avatars.githubusercontent` | `rg "https?://(fonts\.googleapis|cdnjs\.cloudflare|avatars\.githubusercontent)" index.html cv/` → 0 hits | FASE 6 y PR |

Cada fila tiene comando. Una dimensión con número y sin comando es una aspiración, no una restricción.

## Medido, aún no forzado

| Métrica | Hoy | Dirección |
|---|---|---|
| `estilo.css` (CSS compilado) | 30 180 B | no debe crecer > 15 % |
| `index.html` | 89 409 B | no debe crecer |
| `script.js` (→ modular) | 34 668 B / 492 ln | no debe crecer en total |
| CV inline `<style>` | ~710 ln | debe llegar a ~0 en `cv/index.html` |
| Lighthouse actual | sin baseline | capturar en FASE 9 antes/después |

## Excepciones

| ID | Regla | Ruta | Motivo | Owner | Caduca |
|---|---|---|---|---|---|
| E1 | CSS inline permitido | `cv/ats/index.html` | Requisito ATS: parsers prefieren HTML autocontenido | @christianrvdv | indefinido |
| E2 | ~~CDN Google Fonts~~ **obsoleta** | — | GATE 1 + ADR-005: los 3 CDNs se eliminan (Inter, Material Symbols, Font Awesome → `assets/fonts/`) | — | cerrada |

## Guardas (revisión de que el bar no se afloje)

En cada review, mirar el diff buscando:
1. Umbral bajado (Lighthouse, tamaño, KB de PDF).
2. Texto de contenido modificado en `git diff`.
3. Check silenciado (`--rule`, skip, excepción nueva sin discusión).
4. Trabajo inacabado (TODO donde debe haber código, `catch {}` vacío).
5. Excepción nueva sin owner ni caducidad.

Al menos una restricción es **externa** (Lighthouse/axe miden un navegador real; el agente no
puede discutirla escribiendo código).
