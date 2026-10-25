# Auditoría de cierre — Rediseño · Fase 6

- **Rama:** `redesign` (base: `7bf3d54`, Fase 5)
- **Fecha:** 2026-10-25
- **Alcance:** portafolio `index.html` + sistema de estilos (`src/styles/*` → `assets/css/main.css`) + módulos ES de portafolio. CVs solo como consumidores de `main.css`.
- **Resultado:** **PASS** — scorecard global **92.3/100**, color y contraste **95/100**, 0 anti-patrones en el portafolio, 0 errores de consola y 0 respuestas ≥ 400 en ambos hosts.

## 1. Método

Se invocaron las skills de cierre. Tres de ellas (`design-auditor`, `baseline-ui`, `wcag-audit-patterns`) son **stubs de catálogo** (solo apuntan a `npx skills add …`); instalarlas habría añadido dependencias, prohibido por `AGENTS.md`. Sus rúbricas se aplicaron manualmente. `anti-ui-slop-reviewer` sí trae instrucciones completas y se usó como finish gate adversarial.

Medición real con Playwright (Chromium headless) sobre dos servidores estáticos simultáneos: raíz (Netlify) y subdirectorio `/christianrvdv/` (GitHub Pages). El contraste se calculó muestreando píxeles renderizados (canvas 1×1 + `getImageData`), no parseando el texto `oklch()`.

## 2. Anti-patrones (grep)

| Patrón | `index.html` | `src/styles` + `main.css` | `assets/js` |
|---|---|---|---|
| `transition-all` | 0 | 0 | 0 |
| `text-[10px]` / `text-[Npx]` | 0 | 0 | 0 |
| `backdrop-blur` aplicado | 0 | 0 | 0 |
| `shadow-*` aplicado | 0 | 0 | 0 |
| `gradient-text` / `bg-gradient` | 0 | 0 | 0 |
| `style="` inline | 0 | — | — |
| `!important` en HTML | 0 | 2 (solo `prefers-reduced-motion`) | — |
| Valores arbitrarios `w-[ ]`, `h-[ ]` | 0 | 0 | 0 |

Los dos hits de `main.css` son variables del reset de Tailwind (`--tw-backdrop-blur: ;`, `--tw-shadow: 0 0 #0000`) y el único `box-shadow:` es el `box-shadow: none` de Preflight (`:-moz-ui-invalid`). No hay sombras decorativas ni blur de fondo.

**Excepción documentada:** las páginas CV (`cv/index.html`, `cv/en/index.html`) conservan **20 usos de `text-[10px]`**. Son preexistentes, el CV está congelado (GATE 9.4) y no forman parte del rediseño; no se tocaron.

## 3. Color y contraste (medido sobre píxeles)

| Elemento | Oscuro | Claro | Mínimo AA |
|---|---|---|---|
| Texto base | 15.50:1 | 14.01:1 | 4.5 |
| Rol del hero (20px/500) | 7.16:1 | 6.03:1 | 3.0 |
| Título de sección (28px/600) | 15.50:1 | 14.01:1 | 3.0 |
| Índice de sección (14px/600, acento) | 11.72:1 | 5.32:1 | 4.5 |
| Ítem de skill (13px/500) | 12.86:1 | 16.03:1 | 4.5 |
| Meta de proyecto (12px) | 7.16:1 | 6.03:1 | 4.5 |
| Enlace de nav (14px/500) | 7.16:1 | 6.03:1 | 4.5 |
| CTA primario | 11.71:1 | 6.30:1 | 4.5 |
| Footer / back-to-top | 15.50 / 14.33 | 14.01 / 15.16 | 4.5 |

**Mínimo global: 5.32:1** (índice de sección en tema claro) → supera AA; la mayoría del texto supera AAA.

## 4. Accesibilidad verificada

| Check | Resultado |
|---|---|
| Landmarks | `header` 1, `nav` 1, `main` 1, `footer` 1 |
| Encabezados | 1 `h1`, sin saltos de nivel (H1→H2→H3 en todo el documento) |
| Imágenes | 6/6 con `alt`; 0 sin atributo; 0 rotas (`naturalWidth > 0`) |
| Controles sin nombre accesible | 0 |
| `tabindex` positivo | 0 |
| IDs duplicados | 0 |
| Anillo de foco | `solid 2px` acento + `offset 2px` en **14/14** paradas de tabulación |
| Skip link | Tab → Enter deja `location.hash = #main-content`, foco en `MAIN`, siguiente Tab entra al contenido (ambos hosts) |
| `aria-current` | `location` en el enlace de sección activo (`nav.js`) |
| Menú móvil | `open` + `aria-expanded=true`, `inert` fuera de foco, cierre con `Escape` |
| Touch targets | Todos ≥ 24×24; única excepción el skip link (1×1 recortado a propósito hasta recibir foco) |
| Reflow | 0 desbordamiento horizontal en 320/640/768/1024/1440 |
| `prefers-reduced-motion` | `transform: none`, `opacity: 1` (estado final, sin snap) |
| Hero en 375×667 | CTA inferior a `602px` (≤ 667), nav 64px, sin overflow |

## 5. Doble host (mismo árbol de archivos)

Servidores simultáneos: `serve` raíz `:3000` y `serve` del directorio padre con el sitio en `christianrvdv/` `:3001`.

| Check | Netlify (raíz) | GitHub Pages (`/christianrvdv/`) |
|---|---|---|
| Errores de consola / `pageerror` / `requestfailed` | 0 | 0 |
| Respuestas ≥ 400 | 0 | 0 |
| Fuentes (mono/sans) | true / true | true / true |
| Token `--color-background` | `oklch(0.17 0.01 140)` | idéntico |
| Imágenes / revelados | 6/6 · 22/22 | 6/6 · 22/22 |
| Tema + idioma persisten | sí / sí | sí / sí |
| CV `cv/`, `cv/en/`, `cv/ats/` | 200 · 0 err · 0 404 | 200 · 0 err · 0 404 |
| 3 PDFs | 200 | 200 |

Las rutas del portafolio y de los CV son relativas (0 referencias `="/`), por eso ambos hosts resuelven igual.

## 6. Código muerto

- `src/styles/components.css`: 58 clases definidas. Se eliminó `.hidden` (sin uso en HTML ni JS; Tailwind ya provee la utilidad si se necesita).
- `.inert-polyfill` **se conserva**: es fallback real de `nav.js` para navegadores sin `inert`.
- 6 módulos JS; todos importados: `main.js` → `nav`, `back-to-top`, `scroll-animations`, `i18n`; `cv.js` → `i18n`. 0 módulos huérfanos.
- No quedan restos de la etapa anterior (`theme.js`, `mobile-menu.js`, `active-nav.js`, `navbar.js` fueron borrados en Fase 4B).

## 7. Correcciones aplicadas en Fase 6

1. **Skip link roto:** el handler de smooth scroll interceptaba `a[href^="#"]`, incluido el skip link, con `preventDefault`, por lo que el foco nunca llegaba al contenido. Ahora `nav.js` deja pasar el skip link a la navegación nativa.
2. **`<main>` focusable:** se añadió `tabindex="-1"` a `#main-content` para que la navegación nativa mueva el foco.
3. **Anillo de contenedor:** `main:focus { outline: none }` evita dibujar el anillo de 2px alrededor de toda la página al aterrizar el skip link.
4. **Limpieza:** eliminada la clase `.hidden` sin uso.

`npm run build:css`, `npm run lint:html` y `npm run lint:css` en verde tras los cambios (`verify-css: OK`, 29 821 B).

## 8. Hallazgos H01–H21 de la auditoría inicial

El listado H01–H21 **no existe en el repositorio**. Se buscó en todos los archivos de texto (incluidos `docs/`, capturas y reportes): solo hay referencias a **H10** y **H16**, ambas en comentarios de `assets/js/modules/nav.js`.

| Hallazgo | Estado | Evidencia |
|---|---|---|
| **H10** — doble sistema de navegación | **Resuelto por construcción** | Un único `nav.js`; borrados `navbar.js`, `active-nav.js`, `mobile-menu.js`, `theme.js`; un solo `#navbar` / `#mobile-menu` |
| **H16** — tracking activo y transición del panel móvil | **Resuelto por construcción** | `IntersectionObserver` + `aria-current="location"`; panel con `grid-template-rows` (`0fr→1fr` medido: `397px` abierto) + `inert` |
| H01–H09, H11–H15, H17–H21 | **No verificables** | Su enunciado no está en el repo; no se inventan estados |

En su lugar, el cierre se valida contra los criterios medibles de la fase (secciones 2–7), que cubren las clases de problema típicas de esa auditoría: contraste, navegación, motion, imágenes, i18n, rutas y código muerto.

## 9. Scorecard (19 categorías)

| # | Categoría | Nota |
|---|---|---|
| 1 | Tipografía | 92 |
| 2 | Color y contraste | **95** |
| 3 | Espaciado | 91 |
| 4 | Jerarquía visual | 90 |
| 5 | Consistencia | 92 |
| 6 | WCAG 2.2 AA | 93 |
| 7 | Formularios | N/A (sin formularios) |
| 8 | Motion | 94 |
| 9 | Modo oscuro | 93 |
| 10 | Responsive | 93 |
| 11 | Estados loading/empty/error | N/A (sitio estático; 0 imágenes rotas) |
| 12 | Microcopy | 90 |
| 13 | i18n / RTL | 88 (ES/EN completos; RTL no aplica) |
| 14 | Elevación | 95 (0 sombras decorativas; bordes) |
| 15 | Iconografía | 90 (un solo set FA + SVG inline) |
| 16 | Navegación | 93 |
| 17 | Design tokens | 94 |
| 18 | Diseño ético / dark patterns | 96 (sin cookies, urgencia falsa ni preselecciones) |
| 19 | Heurísticas de Nielsen | 90 |

**Global (17 categorías aplicables): 92.3/100.** Umbral ≥ 85 ✔ · color ≥ 90 ✔.

## 10. Riesgos y limitaciones

- **Caché:** `max-age=604800` sin cache-busting; los cambios de CSS pueden tardar hasta 7 días en visitantes recurrentes (ya documentado en `AGENTS.md`).
- **Tema inicial:** sin preferencia guardada, el script anti-FOUC respeta `prefers-color-scheme`. En un SO claro, la primera visita usa el tema impresión; el oscuro se activa por toggle y persiste.
- **CV:** conserva `text-[10px]` y su propio diseño (congelado). No se modificó.
- **H-list:** ver sección 8.

## 11. Reproducir

```powershell
# host raíz (Netlify)
npx serve -l 3000 .
# host subdirectorio (GitHub Pages): copiar index.html, cv/ y assets/ a <padre>/christianrvdv/
npx serve -l 3001 <padre>
```
