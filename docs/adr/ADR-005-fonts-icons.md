# ADR-005: Fuentes e iconos auto-hospedados (eliminar CDNs)

Fecha: 2026-10-15 · Estado: **Aceptado — decisiones firmes GATE 2 (A2: FA webfonts; A3: Inter variable; N3: presupuesto)**

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

### 1. Inter → auto-hospedado, **fuente variable** (decisión firme GATE 2, A3)
- Descargar el woff2 variable (`opsz,wght` 300–800) rango **latin** y rango **latin-ext**
  a `assets/fonts/` y declararlo en `src/styles/tokens.css` con `font-display: swap`
  **obligatorio** + `unicode-range` latin/latin-ext.
- Un solo archivo por rango cubre **todos** los pesos usados (400, 500, 600, 700 y 800 —
  medidos: `font-medium` ×38, `font-bold` ×32, `font-semibold` ×5, `font-weight: 500/800` en CSS).
- Presupuesto: ≤ 100 KB total. **Si el subset variable supera 100 KB**, caer a 5 pesos
  estáticos (400/500/600/700/800 × latin/latin-ext) y documentar el trade-off aquí mismo.
- `<link>` de Google Fonts eliminado de ambas páginas (y preconnects también).

### 2. Material Symbols → subset auto-hospedado
- Usar la subset API de Google Fonts (`css2?family=Material+Symbols+Outlined&text=<16 glifos>`)
  una vez, descargar el CSS + el woff2 resultante a `assets/fonts/`, y servirlo desde
  `src/styles/icons.css`. **Cero cambios en el HTML**: se conserva
  `<span class="material-symbols-outlined">bolt</span>` (ligaduras).
- Resultado: ~5 KB en vez de ~400 KB; el `<link>` a Google Fonts sale de `index.html`.

### 3. Font Awesome → auto-hospedar webfonts — **decisión firme (GATE 2, A2: opción (i))**
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
- **−** `assets/fonts/` añade ~240 KB versionados (se sirven con header `max-age=31536000`).
- **−** Hay que repetir el subset cada vez que se use un glifo nuevo de Material Symbols /
  un peso de Inter nuevo (checklist en `docs/VERIFICATION.md`, FASE 6).
- **−** Actualizar FA local a 6.x futuro = tarea manual (hoy congelado en 6.4.0, mismo
  comportamiento que la CDN actual).

## Presupuesto de pesos de `assets/fonts/` (GATE 2, N3)

| Componente | Esperado |
|---|---|
| Inter variable — latin (1 woff2) | ~40 KB |
| Inter variable — latin-ext (1 woff2) | ~15 KB |
| Material Symbols subset (16 glifos) | ~5 KB |
| FA webfonts (solid + brands + regular) | ~180 KB |
| **Total `assets/fonts/`** | **~240 KB** (vs ~400 KB de MS completo + ~150 KB de FA CDN hoy) |

Si el peso real difiere **> 20 %** del presupuesto al instalarlos (FASE 6): **parar y avisar
en el gate correspondiente** antes de seguir, adjuntando el desglose real por fichero.

## Mejoras fuera de alcance

- **(ii) Reemplazar FA por SVG inline** en las 79 instancias / 38 glifos (CV 44, portafolio 35,
  ATS 0): bajaría ~180 KB de webfonts a ~15 KB, pero es churn alto con riesgo real de regresión
  visual (tamaño/alineación baseline). Queda como **mejora post-refactor por fases** (CV primero,
  portafolio después), nunca dentro de este refactor.

## Alternativas consideradas

1. **Mantener los 3 CDNs** (mínimo riesgo): cero beneficio de privacidad/perf, y deja 12+
   peticiones externas en el critical path. Rechazado (misión FASE 6).
2. **Iconos con SVG sprite propio** (re-dibujar): cambiaría el diseño de iconos = rediseño.
   Rechazado (regla: cero rediseño).
3. **Dejar FA en CDN y solo quitar Google Fonts**: deja una dependencia con CVEs históricos
   y el script más pesado de los tres. Rechazado.
