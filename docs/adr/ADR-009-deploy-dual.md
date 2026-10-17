# ADR-009: Deploy dual (Netlify raíz + GitHub Pages subpath) con rutas relativas

- **Estado:** Aceptado
- **Fecha:** 2026-10-17 (FASE 10; decisión operativa desde FASE 8.5)
- **Decisión previa relacionada:** ADR-001 (deploy estático, `publish = "."`), ADR-007 (rutas relativas — mecánica de resolución), ADR-004 (PDFs commiteados)

## Contexto

El refactor migra el portafolio a dos hosts con un **mismo árbol de archivos**:

- **Netlify** sirve el repo desde la raíz del dominio (`https://christianrvdv.netlify.app/`) y sí ejecuta build (`npm run build:css`) y sí soporta redirects 301/200 definidos en `netlify.toml`.
- **GitHub Pages** sirve el mismo repo desde el subpath `https://christianrvdv.github.io/christianrvdv/` **sin build** y **sin redirects**.

Cualquier ruta absoluta (`/assets/...`) en el HTML funciona en Netlify pero devuelve 404 en GitHub Pages (resolvería contra la raíz del dominio `github.io`, que no tiene el sitio). Esto ya fue verificado empíricamente en FASE 8.5 antes de la migración (ADR-007).

## Decisión

1. **Rutas relativas en todo el HTML** (`assets/…`, `../assets/…`, `../../assets/…`), resolviéndose según la profundidad del archivo. Mecánica completa en ADR-007.
2. **JS resuelve contra el módulo**: fetch de i18n y enlaces a PDFs usan `new URL('…', import.meta.url)`, porque un `fetch` con ruta relativa resuelve contra el documento y rompería en `/cv/` y `/cv/en/`.
3. **Detección de ruta por sufijo** (`endsWith('/cv/en')`) en vez de igualdad exacta, para que el CV EN funcione con y sin subpath.
4. **URLs absolutas de Netlify solo en metas Open Graph/Twitter** (`og:image`, `twitter:image`, `og:url`): una preview de compartir link no tiene contexto de base y debe servir la imagen desde cualquier host. Es la única excepción consciente a la relatividad.
5. **Build solo donde hay build**: Netlify ejecuta `npm run build:css` en cada deploy; en GitHub Pages se commitea `assets/css/main.css` resultante (regla duras en AGENTS.md).
6. **PDFs commiteados** (ADR-004): imprescindible para GH Pages, que no ejecuta `npm run build:cv`; además el sitio los sirve directamente en ambos hosts.

## Consecuencias

- **+** Un solo árbol, cero configuración por host, cero drift: las capturas de producción de ambos hosts son byte-idénticas (`docs/verification/fase9.6-screenshots/`, SHA256 iguales en light y dark).
- **+** Netlify no necesita ajustes: `publish = "."` + relatividad resuelven correctamente.
- **−** GitHub Pages no ejecuta build: hay que commitear `main.css` tras cada cambio de CSS; olvidarlo deja el espejo con estilos viejos (mitigado con regla en AGENTS.md).
- **−** GitHub Pages no soporta 301s: los redirects legacy de `netlify.toml` (`/cv-en`, `/estilo.css`, `/script.js`, `/imagen/*`, PDFs antiguos) solo aplican en Netlify. Aceptado: son compatibilidad de URLs históricas, no enlaces internos (los enlaces internos ya apuntan a rutas relativas nuevas).
- **−** Doble superficie de verificación: cualquier cambio debe smoke-tearse en ambos hosts antes de dar por cerrada una fase (así lo hizo el GATE 9.6).

## Alternativas descartadas

1. **Renombrar el repo a `christianrvdv.github.io`** → descartado: cambiaría la URL pública (desaparecería el subpath `/christianrvdv/`) y rompería los enlaces ya compartidos.
2. **`<base href="...">`** → descartado: afecta a todos los anchors internos (`#seccion`) del SPA, es frágil ante despliegues parciales y añade un punto de fallo silencioso.
3. **Rutas absolutas + HTML duplicado por host** → descartado: dos copias del HTML derivan en drift inevitable; ya existe el precedente de la migración de FASE 8.
4. **Rutas absolutas + repositorio propio `assets` en CDN** → descartado: introduce dependencia externa (CDNs prohibidas) y no resuelve la base del subpath sin un `<base>` o un build con variable de entorno.
