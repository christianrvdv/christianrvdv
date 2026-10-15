# ADR-001: Estructura de carpetas (Opción C: HTML en rutas publicadas)

Fecha: 2026-10-15 · Estado: Aceptado (GATE 1)

## Contexto

`netlify.toml` declara `publish = "."` y no hay build de HTML en Netlify. La misión original
proponía `src/templates/` como fuente de los 4 HTML + un paso `build:html` que los copiara a
sus rutas publicadas, con las copias en `.gitignore`. Eso introduce **dos copias de cada HTML**
(fuente + publicada) sin mecanismo de sincronía: riesgo de drift y de que Netlify sirva una copia
vieja si alguien edita solo la fuente.

## Decisión

- **Opción C**: los HTML son fuente *y* artefacto publicado en su ruta final:
  - `index.html` → `/`
  - `cv/index.html` → `/cv`
  - `cv/en/index.html` → `/cv/en` (archivo físico, **no** rewrite — se elimina la V3)
  - `cv/ats/index.html` → `/cv/ats`
- **No existe `src/templates/`, ni `build:html`, ni copias en `.gitignore`.**
- `src/` queda reservado **solo** para fuentes de estilos (`src/styles/`).
  *(Nota: el GATE 1 mencionó `src/js/`; contradice la V1 aprobada "sin `src/js/`".
  Se mantiene V1 — el JS fuente vive directo en `assets/js/`. Confirmar en GATE 2.)*
- `assets/` es el único directorio publicado de recursos: `css/ js/ i18n/ images/ docs/`.
- La estructura completa de fuentes/verificación queda: `src/styles/`, `assets/`, `scripts/`, `docs/`.

## Consecuencias

- **+** Cero duplicación: no puede haber drift fuente↔publicado.
- **+** Un clon nuevo funciona sin build de HTML (`npm run build` solo compila CSS).
- **+** Los HTML se pueden abrir/inspeccionar directamente en sus rutas; git history simple
  (se usan `git mv`, conservando el blame).
- **−** Se desvía deliberadamente de la estructura objetivo de la misión (autorizado en GATE 1).
- **−** `/cv/en/index.html` duplica el marcado de `/cv/index.html`. Mitigación: tras la FASE 5
  el texto visible vive en `assets/i18n/*.json`, así que la superficie de duplicación queda en
  marcado estructural (idéntico `data-i18n`), y los dos archivos comparten el mismo JS.
  Regla: editar el CV siempre en los dos HTML (o tocar solo JSON/JS).

## Alternativas consideradas

1. **A — `src/templates/` + `build:html`** (estructura de la misión): única fuente, pero añade
   un paso de build, copias `.gitignore`-adas y un estado "publicado desactualizado" posible.
   Descartada en GATE 1.
2. **B — Bundler (Vite/Parcel) con `dist/`**: cambios de DX reales pero introduce build tooling,
   dependencias y `publish = dist` (regla 5 + la misión prohíbe frameworks/nuevas deps). Descartada.
3. **D — `/cv/en/` como rewrite a `/cv/index.html?lang=en` (V3)**: cero duplicación de marcado,
   pero la misión exige 4 HTMLs y la PDF-ización local de `/cv/en` queda implícita. Eliminada en GATE 1.
