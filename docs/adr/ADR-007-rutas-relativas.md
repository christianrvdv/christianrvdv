# ADR-007: Rutas relativas para compatibilidad Netlify + GitHub Pages

- **Estado:** Aceptado
- **Fecha:** 2026-10-15 (FASE 8.5)
- **Decisión previa relacionada:** ADR-001 (deploy estático, `publish = "."` en Netlify)

## Contexto

El refactor de rutas de la FASE 8 (tras ADR-001) migró los recursos a rutas
absolutas (`/assets/...`). Eso es correcto en Netlify, que sirve el sitio desde
la raíz del dominio, pero el sitio también debe publicarse en GitHub Pages,
que sirve el mismo repo desde el subpath `https://christianrvdv.github.io/christianrvdv/`.

Verificado con curl antes de la migración:

- `github.io/estilo.css` → 404 (raíz del dominio no tiene el sitio)
- `github.io/christianrvdv/estilo.css` → 200 (versión pre-refactor)

Si se hubiera pusheado el refactor tal cual, GitHub Pages habría servido el
HTML sin CSS/JS/fuentes/iconos.

## Decisión

1. **HTML:** todas las rutas de recursos (`href`/`src`/`srcset`) pasan a
   relativas, resolviéndose según la ubicación del archivo HTML:
   - `index.html` (raíz): `assets/...`
   - `cv/index.html`: `../assets/...`
   - `cv/en/index.html`: `../../assets/...`
2. **CSS:** las URLs dentro de `@font-face` son relativas al archivo CSS
   compilado (`assets/css/main.css` → `url(../fonts/...)`), declaradas así en
   `src/styles/tokens.css` y regeneradas con `npm run build:css`.
   `material-symbols.css` y `vendor/fontawesome.css` ya usaban rutas relativas.
3. **JS:** el fetch de i18n y los enlaces a PDFs en
   `assets/js/modules/i18n.js` se resuelven con
   `new URL('...', import.meta.url)` — la única forma robusta en módulos ES,
   porque un `fetch` con ruta relativa resuelve contra el *documento*, no contra
   el módulo (rompería en `/cv/` y `/cv/en/`).
4. **Detección de idioma del CV:** la comprobación de ruta
   `pathname === '/cv/en'` pasó a detección por sufijo
   (`pathname.replace(/\/+$/, '').endsWith('/cv/en')`), válida tanto en
   `/cv/en/` (Netlify) como en `/christianrvdv/cv/en/` (GitHub Pages).
5. **Enlaces legacy:** `href="cv_christian.html"` (archivo inexistente; en
   Netlify lo salvaba el 301 de `netlify.toml`) migró a `href="cv/"`.
6. **`cv/ats/index.html`:** no se tocó — usa CSS inline (E1) y no cargaba
   ningún `<link>` externo.

## Consecuencias

- **+** Un solo juego de archivos sirve a los dos hosts sin build por host.
- **+** Netlify no requiere cambios de configuración: `publish = "."` +
  rutas relativas resuelven bien.
- **+** Los sitios quedan verificados idénticos: capturas byte a byte iguales
  en ambos escenarios (`docs/verification/fase8.5-screenshots/`).
- **−** GitHub Pages no soporta redirects 301: los de `netlify.toml`
  (`/cv-en`, `/cv_christian.html`, `/estilo.css`, ...) no aplican ahí. Aceptado:
  son compatibilidad de URLs externas históricas.
- **−** GitHub Pages no ejecuta `npm run build:css`: hay que commitear
  `assets/css/main.css` tras cada cambio de CSS (regla ya existente desde
  ADR-001/FASE 8).

## Alternativas descartadas

1. **Renombrar el repo a `christianrvdv.github.io`** → descartado: cambiaría la
   URL pública (`christianrvdv.github.io` en vez de `/christianrvdv/`) y
   rompería cualquier link externo ya compartido.
2. **`<base href="...">`** → descartado: afecta a todos los anchors internos
   (`#seccion`), es frágil con el SPA del portafolio y añade un punto de
   fallo silencioso.
3. **Rutas absolutas + duplicar HTML para GitHub Pages** → descartado: dos
   copias del mismo HTML derivan en drift inevitable entre hosts.
