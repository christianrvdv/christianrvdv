# ADR-006: `package-lock.json` trackeado (fuera de `.gitignore`)

Fecha: 2026-10-15 · Estado: Aceptado (GATE 1)

## Contexto

Estado actual incoherente (detectado en FASE 0):
- `.gitignore` (commit `884b4a9`) incluye `package-lock.json`.
- …pero `package-lock.json` **está trackeado** en git desde antes (`git ls-files` lo lista):
  la regla de ignore llegó tarde y nunca se resolvió.
- Netlify ejecuta `npm ci` cuando encuentra lockfile en el repo: sin él, cada build de Netlify
  resuelve dependencias de nuevo (resolución no reproducible; una release mayor de `tailwindcss`
  puede compilar un CSS distinto sin que nadie toque código).
- `package-lock.json` no está en ningún commit de esta sesión — la FASE 0 lo confirma en
  `git status` como "tracked pero ignorado".

## Decisión

- **Quitar `package-lock.json` de `.gitignore`** (y cualquier patrón equivalente:
  `npm-debug.log*` y `node_modules/` se quedan ignorados, solo se toca la línea del lock).
- **Mantenerlo trackeado en git** y commitearlo **junto con cada cambio de `package.json`**
  (regla: dependencias y su lockfile, mismo commit).
- Netlify pasa a tener builds reproducibles con `npm ci` (comportamiento automático del
  platform cuando el lock está presente). No se necesita tocar nada más.
- No se añade `npm ci` manual en ningún script: el platform ya lo hace; localmente se sigue
  usando `npm install` (sin lockfile en un clon nuevo, `npm install` lo regenera).

## Consecuencias

- **+** Builds reproducibles en Netlify y entre máquinas (mismo árbol de dependencias exacto).
- **+** Se cierra la incoherencia ignore↔trackeado: el estado futuro es coherente y documentado.
- **+** Cualquier diff de dependencias es visible en `git diff` (auditable en review).
- **−** Ruido en diffs si alguien corre `npm install` con un npm distinto (formatea el lock).
  Mitigación: `.nvmrc`/`.npmrc` no entran en alcance; basta con commitear el lock solo cuando
  cambie `package.json` (regla de arriba).
- **−** La frase de AGENTS.md "`package-lock.json` es gitignored, usa `npm install`"
  queda **desactualizada**: actualizar `AGENTS.md` en FASE 10 (documentación) para que diga
  "hay lockfile trackeado; `npm install` local, `npm ci` en CI".

## Alternativas consideradas

1. **Dejarlo trackeado y en `.gitignore`** (estado actual): confuso y contra-intuitivo — el
   ignore no surte efecto sobre un fichero ya trackeado, pero sí oculta intenciones futuras
   (p. ej. si algún día se regenera). Rechazado.
2. **Dejar de trackearlo y confiar en `npm install` libre**: pierde la reproducibilidad
   (el problema de Netlify de arriba). Rechazado por la regla 5/6 de la misión.
3. **Renombrarlo/otro formato (pnpm/yarn)**: cambio de gestor fuera de alcance. Rechazado.
