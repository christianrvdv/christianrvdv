# ADR-005: Fuentes e iconos auto-hospedados (eliminar CDNs)

Fecha: 2026-10-15 · Estado: Aceptado con correcciones de datos (GATE 1, Q4a) — ver "Abierto" abajo

## Contexto

Hoy hay 3 dependencias CDN en producción:

| CDN | Páginas | Qué carga |
|---|---|---|
| Google Fonts — **Inter** (`wght 300..800, opsz`) | `/`, `/cv` | texto de todo el sitio |
| cdnjs — **Font Awesome 6.4.0** (solid + brands + regular) | `/`, `/cv` | **79 usos, 38 glifos distintos** |
| Google Fonts — **Material Symbols Outlined** | `/` | **26 usos, 16 glifos distintos** |
| `avatars.githubusercontent.com` (avatar, 12 refs) | `/` | perfil |

Costes: render bloqueante parcial en FCP/LCP (fonts), ~400 KB de Material Symbols completos
para 16 glifos, terceros en el origen (privacidad/GDPR), y un punto único de fallo externo.

**Medición real (FASE 2, `Select-String` sobre los HTML):**
- FA en `index.html`: 35 instancias / 29 glifos; FA en `cv_christian.html`: 44 instancias /
  35 glifos; **unión: 38 glifos distintos**, 79 instancias. ATS: 0 iconos FA.
- Material Symbols: 16 glifos (`bolt code dark_mode download expand_more history
  keyboard_arrow_up mail menu open_in_out person school send web work account_tree`).
- Pesos Inter realmente usados: **400, 500, 600, 700 y 800** (`font-medium` ×38,
  `font-bold` ×32, `font-semibold` ×5, `font-weight: 500/700/800` en CSS del CV).

## Decisión

### 1. Inter → auto-hospedado (subset latin + latin-ext)
- Descargar el woff2 (Google Fonts API, `wght` 300–800 **variable** o estáticos 400/500/600/700/800)
  a `assets/fonts/` y declararlo en `src/styles/tokens.css` con
  `font-display: swap` + `unicode-range` latin/latin-ext.
- ⚠️ El plan original del GATE 1 ("400/600/700, ~30 KB") **subestima los pesos usados**
  (faltan 500 y 800). Alternativa recomendada: **fuente variable 1 archivo/idioma de rango**
  que cubre todo sin multiplicar ficheros. Peso objetivo real: ≤ 100 KB total.
- `<link>` de Google Fonts eliminado de ambas páginas (y preconnects también).

### 2. Material Symbols → subset auto-hospedado
- Usar la subset API de Google Fonts (`css2?family=Material+Symbols+Outlined&text=<16 glifos>`)
  una vez, descargar el CSS + el woff2 resultante a `assets/fonts/`, y servirlo desde
  `src/styles/icons.css`. **Cero cambios en el HTML**: se conserva
  `<span class="material-symbols-outlined">bolt</span>` (ligaduras).
- Resultado: ~5 KB en vez de ~400 KB; el `<link>` a Google Fonts sale de `index.html`.

### 3. Font Awesome → auto-hospedar webfonts (ver "Abierto")
- Descargar `fa-all.min.css` (o generar sub-conjunto) + woff2 de solid/brands/regular
  a `assets/fonts/` + `assets/css/vendor/`, referenciarlo con `<link rel="stylesheet">`
  local. **Cero cambios en el HTML** (las 79 clases `fa…` se quedan tal cual).
- Elimina el `<script defer src="https://cdnjs.cloudflare.com/...">` de ambas páginas.
- Licencia: FA Free = **CC BY 4.0** (iconos) + **SIL OFL** (fuentes) → atribución en
  `README.md` (añadir en FASE 10).

### 4. Avatar → local
- Descargar `avatars.githubusercontent.com/u/61900349` (…, 12 refs con `?v=4`) a
  `assets/images/avatar.webp` y reescribir las 12 referencias. Añadir `width`/`height`
  (CLS) y `loading="lazy"` donde no sea LCP.
- Elimina la última petición a un tercero no-font en `/`.

### Resultado final: **0 CDN externos** en las 4 páginas.

## Consecuencias

- **+** FCP/LCP sin bloqueo de red externo; privacidad (sin peticiones a Google/cdnjs/GitHub).
- **+** La verificación "sin CDNs" es comprobable con grep: `https?://(fonts|cdnjs|avatars)` = 0.
- **−** `assets/fonts/` añade ~100 KB versionados (se sirven con header `max-age=31536000`).
- **−** Hay que repetir el subset cada vez que se use un glifo nuevo de Material Symbols /
  un peso de Inter nuevo (checklist en `docs/VERIFICATION.md`, FASE 6).
- **−** Actualizar FA local a 6.x futuro = tarea manual (hoy congelado en 6.4.0, mismo
  comportamiento que la CDN actual).

## Abierto (corrección de datos → GATE 2)

El GATE 1 dijo "Font Awesome: reemplazar por **SVG inline en el CV** (solo ~8 iconos)".
La medición real: **44 usos/35 glifos en el CV** y **35 usos/29 glifos en el portafolio**
(79/38 en total). Opciones:

| Opción | Churn | Peso | Riesgo |
|---|---|---|---|
| **(i) Webfonts FA auto-hospedadas** (recomendado arriba) | 0 cambios de markup | ~400 KB (cacheado 1 año) | mínimo |
| **(ii) SVG inline en las 79 instancias** | alto (38 glifos × 2 estilos) | ~15 KB | regresiones visuales de tamaño/alineación |

Se adopta **(i)** mientras no llegue contraorden. (ii) sigue siendo factible como mejora
post-refactor, por fases (CV primero, portafolio después).

## Alternativas consideradas

1. **Mantener los 3 CDNs** (mínimo riesgo): cero beneficio de privacidad/perf, y deja 12+
   peticiones externas en el critical path. Rechazado (misión FASE 6).
2. **Iconos con SVG sprite propio** (re-dibujar): cambiaría el diseño de iconos = rediseño.
   Rechazado (regla: cero rediseño).
3. **Dejar FA en CDN y solo quitar Google Fonts**: deja una dependencia con CVEs históricos
   y el script más pesado de los tres. Rechazado.
