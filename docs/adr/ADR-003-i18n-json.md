# ADR-003: i18n migrado a JSON (`assets/i18n/`) + orden de resolución de idioma

Fecha: 2026-10-15 · Estado: Aceptado (GATE 1, Q2) · **Cascada firme GATE 2, A4**

## Contexto

Hay **dos** sistemas de traducción duplicados en forma: objeto inline `translations` dentro de
`script.js` (portafolio, ~300 ln del monolito) y objeto global `cvTranslations` en
`cv-translations.js` (CV, 142 ln). Ambos contienen cadenas visibles hardcodeadas en JS, lo que
obliga a tocar JS cada vez que cambia un texto y hace imposible revisar traducciones con
`git diff` centrado. Además, el CV ignora hoy `?lang=` (solo lee `localStorage`), por lo que
`/cv-en?lang=en` no funciona: un usuario con `language=es` en localStorage ve el CV en español
aunque la URL pida inglés.

## Decisión

### Estructura
- Cuatro ficheros en `assets/i18n/` (UTF-8, claves exactamente iguales a los `data-i18n`
  actuales — **las claves no cambian**, solo cambia el contenedor):
  - `portfolio.es.json`, `portfolio.en.json` (desde el `translations` inline de `script.js`)
  - `cv.es.json`, `cv.en.json` (desde `cvTranslations` de `cv-translations.js`)
- `cv-translations.js` se **elimina** (su `<script>` sale del CV en FASE 5); la misma lógica
  pasa al módulo `assets/js/modules/i18n.js`.
- Carga: `fetch()` con `cache: 'force-cache'`; si falla (p. ej. `file://`), **no** se rompe la
  página: se conserva el texto ya presente en el markup (que es el default ES) y se loguea un
  warning. El toggle queda limitado a ES mientras falle el fetch.

### Orden de resolución de idioma (CV) — decisión firme (GATE 2, A4)
1. **Intención de URL**: `?lang=xx` en la query **o** la ruta `/cv/en/` (equivalente a
   `?lang=en`; es la razón de existir de esa página — decisión GATE 1: `/cv/en` es físico).
2. `localStorage['language']`
3. Fallback `es`

**No se usa `navigator.language`** (decisión GATE 2, A4): añadirlo al CV introduciría
inconsistencia con `/` (que sigue en ES por defecto), violando "cero regresiones" — las
alternativas implicaban cambiar el comportamiento del portafolio o dejar la inconsistencia,
ambas fuera de scope.

Además, tras aplicar `?lang`:
- se **persiste** en `localStorage['language']` (para que `/` y `/cv/` queden coherentes), y
- se **limpia** el query de la URL con `history.replaceState` (sin recargar).

Aplica a `/cv/`, `/cv/en/`, `/cv-en` (redirect) y `/cv?lang=en`.

### Orden en el portafolio (`index.html`)
- Sin cambio: `localStorage['language'] || 'es'`.
- Coherencia entre páginas: tras la primera interacción que aplique `?lang`, el idioma queda
  persistido en `localStorage`, así que `/` y `/cv/` coinciden desde entonces.

## Consecuencias

- **+** Los textos revisables/diffables en JSON; `script.js` baja de 492 ln sin reescritura de
  contenido; un solo módulo i18n para ambos HTML (misma tecla `data-i18n`).
- **+** `/cv-en` y `/cv/en` pasan a funcionar de verdad (hoy `?lang` se ignora).
- **−** `fetch` exige servidor http: la validación FASE 9 corre sobre `netlify dev` / `scripts/dev.mjs`,
  no sobre `file://` (documentado en CONSTRAINTS como método de verificación).
- **−** Duplicidad de claves entre los 4 JSON: mitigada porque la edición normal de copy es
  "misma clave, dos idiomas" y un test manual de paridad de claves (diff de `Object.keys`)
  se incluye en la verificación FASE 9.

## Mejoras fuera de alcance

- **(a) Aplicar `navigator.language` también en `/`** (o en la cascada del CV): eliminaría
  el salto de idioma de primera visita en navegadores no-ES, pero cambia el default actual
  del portafolio → requiere aprobación explícita aparte. No forma parte de este refactor.

## Alternativas consideradas

1. **Mantener objetos JS embebidos** (`cvTranslations` + `translations`): sin fetch, pero
   conserva el duplicado de formatos y el acoplamiento texto↔código. Rechazado por la misión
   (FASE 5 exige JSON) y por revisabilidad.
2. **`<script type="application/json">` inline por página** (sin fetch): funciona en `file://`,
   pero duplica el contenido otra vez (uno por página y idioma). Rechazado.
3. **Sistema i18n de librería** (i18next): dependencia nueva (regla 5). Rechazado — 2 idiomas,
   ~40 claves, `data-i18n` resuelto en ~30 líneas.
