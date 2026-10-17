# ARCHITECTURE — arquitectura técnica del portafolio

Refactor completado en 2026-10-17 (FASES 1–10). Este documento explica *por qué* está construido así; el *qué* está en `docs/SPEC.md` y las decisiones individuales en `docs/adr/`.

## 1. Decisión de diseño: vanilla JS + módulos ES

El sitio es HTML estático con JavaScript vanilla organizado en módulos ES:

```
index.html  → assets/js/main.js (orquestador)  → assets/js/modules/{theme,i18n,mobile-menu,navbar,back-to-top,scroll-animations,active-nav}.js
cv/index.html, cv/en/index.html → assets/js/cv.js
cv/ats/index.html → sin JS (página imprimible pura)
```

**Por qué no un framework.** El sitio tiene ~4 comportamientos (tema, menú, i18n, animaciones por scroll) sobre contenido mayormente estático. Un framework añadiría runtime, build step y dependencias de seguridad a cambio de capacidades que no se usan. Los módulos ES dan encapsulación sin tooling: el navegador los carga con `type="module"` (semántica de defer), sin bundler y sin `node_modules` en producción.

**Por qué no jQuery/CDNs.** Regla dura del proyecto: cero peticiones a terceros. Fuentes (Inter), iconos (Material Symbols, Font Awesome subset) y todo el JS/CSS son assets locales. Resultado medible: Lighthouse 100/100/100 en las 4 páginas en desktop (FASE 9.5).

## 2. Deploy dual y rutas relativas

El mismo árbol sirve dos hosts (ADR-007, ADR-009):

| Host | Base | Build en deploy |
|---|---|---|
| Netlify (`christianrvdv.netlify.app`) | raíz del dominio | `npm run build:css` |
| GitHub Pages (`…github.io/christianrvdv/`) | subpath `/christianrvdv/` | ninguno (sirve el commit) |

La estrategia es **relatividad total**:

- HTML: `assets/…` (raíz), `../assets/…` (`cv/`), `../../assets/…` (`cv/en/`).
- CSS compilado: `url(../fonts/…)` relativo a `assets/css/main.css` (declarado en `src/styles/tokens.css`).
- JS: los fetch (i18n) y enlaces a PDFs se resuelven con `new URL('…', import.meta.url)` — un `fetch` con ruta relativa resuelve contra el *documento*, no contra el módulo, y rompería en `/cv/`.
- Detección de la ruta EN por sufijo (`endsWith('/cv/en')`), no por igualdad exacta, para que funcione con y sin subpath.

**Única excepción**: las metas Open Graph/Twitter usan URLs **absolutas** de Netlify — una preview de compartir link no tiene «base» relativa y debe cargar en cualquier host.

GitHub Pages no ejecuta build ni soporta 301s: se acepta que los redirects legacy solo funcionen en Netlify y que `assets/css/main.css` deba commitearse tras cada cambio de estilos.

## 3. Pipeline y tokens de diseño

```
src/styles/tokens.css          variables CSS: :root (light) + .dark
        │  @import
        ▼
src/styles/input.css           @tailwind base/components/utilities + clases custom (.glass, .bento-card…)
        │  npx tailwindcss (npm run build:css)
        ▼
assets/css/main.css            output minificado, commiteado, cacheado 7 días en ambos hosts
```

`tailwind.config.js` enlaza los tokens con el HTML de dos formas:

1. **Con opacidad** (`bg-primary/50`): `rgb(var(--color-primary-rgb) / <alpha-value>)` — exige triple RGB en `:root` y `.dark`.
2. **Plano** (`text-outline`): `var(--color-outline)`.

Dark mode = clase `dark` en `<html>` persistida en `localStorage.theme`. El script anti-FOUC de `index.html` aplica el tema antes del primer paint; `cv/ats/index.html` no usa Tailwind: su CSS está inline a propósito (E1, ADR-001) para que el ATS siga siendo una página autocontenida.

`assets/css/cv.css` se carga **solo** en `/cv/` y `/cv/en/` y contiene los ajustes de impresión A4 y el override de contraste del CV (ver §5).

## 4. i18n: pre-render anti-FOUC + fetch JSON

Diccionarios en `assets/i18n/` (`portfolio.{es,en}.json`, `cv.{es,en}.json`), aplicados por `data-i18n` (ADR-003).

- **Cascada del CV**: `?lang=xx` o ruta `/cv/en/` → `localStorage['language']` → `es`. Tras aplicar `?lang` se persiste y se limpia la query con `history.replaceState`. No se usa `navigator.language`.
- **Anti-FOUC por pre-render**: el HTML trae el texto del diccionario ya escrito (ES en `/cv/`, EN en `/cv/en/`). `applyTranslations` reescribe el mismo string → 0 ms de flash de idioma, CLS 0, y la página es correcta incluso sin JS (verificado con Playwright, FASE 9.3/P4).
- **Fallo del fetch**: si los JSON no cargan, se conserva el texto del markup (que ya es contenido real) y el toggle queda limitado.

Regla de mantenimiento: toda clave nueva existe en los 4 JSON **y** su HTML está prefilled con el mismo string.

## 5. Accesibilidad

Puntajes actuales (mediana de 3 corridas, FASE 9.5): **a11y 100** en las 4 páginas.

- El teal de marca `#1abc9c` da 2.4:1 sobre blanco. En el CV se degrada a **`#0f766e`** (teal-700, 5.47:1, AA) solo en `cv.css` para texto pequeño y el botón PDF; el portafolio conserva `#1abc9c` (ADR-008). Dos verdes conviven a propósito: branding en pantalla vs legibilidad imprimible.
- Jerarquía H1→H2→H3 normalizada; `<main>` único por página (`landmark-one-main`); preloads de fuentes + prefill i18n eliminaron los layout shifts (CLS 0 en medianas).

## 6. Redirects y URLs legacy

`netlify.toml` declara:

- **200 rewrites**: `/cv`, `/cv/en`, `/cv/ats` → sus `index.html`.
- **301s** de compatibilidad: `/cv-en`, `/cv_christian.html`, `/cv_christian`, `/estilo.css`, `/script.js`, `/imagen/*`, `/cv_christian_vazquez*.pdf` → rutas nuevas.
- Headers: seguridad (`X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`) y cache (`immutable` para imágenes/fuentes, 7 días para CSS/JS, 1 día para PDFs).

**Prohibido un catch-all**: redirigir `/*` rompería el subpath de GitHub Pages y cualquier asset legítimo (commentario en el propio archivo).

## 7. PDFs

`npm run build:cv` (ADR-004): servidor estático interno con puerto efímero → Chromium headless → `page.pdf()` A4 con `printBackground`. El avatar se sirve como JPEG solo durante la impresión (`assets/images/print-only/avatar-400.jpg`) porque Chromium re-codifica webp a PNG lossless y dispara el peso. Salidas commiteadas en `assets/docs/` (ES/EN ≤ 450 KB, ATS ≤ 200 KB, 2 páginas, texto seleccionable verificado decodificando los ToUnicode CMaps, FASE 9.5.4).

## 8. Verificación

Umbrales en `docs/CONSTRAINTS.md`; índice de reportes en `docs/VERIFICATION.md`. El pipeline de gates (FASE 9) exigió: lint 0, Lighthouse 8/8 combos en umbral × 3 corridas, PDFs bajo presupuesto, smoke de 301s/200s con `netlify dev`, y capturas byte-idénticas entre ambos hosts. Los JSONs de Lighthouse y los diffs de contenido viven en `docs/verification/`.
