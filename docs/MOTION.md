# MOTION.md — Plan de movimiento (Terminal Industrial)

> Contrato de animación del portafolio. **Fase 4 (skeleton) NO aplica nada de
> esto**: el HTML debe verse y funcionar sin JS. La aplicación real es **Fase 5**,
> donde se verificará que cada reveal es un *fade suave*, nunca un *snap*.

## Principios (si dudas, no anima)
1. **Movimiento = información**, no adorno. Solo anima lo que ayuda a leer el flujo.
2. **Revelado una vez**: al entrar en viewport, y se deja de observar. Nunca re-dispara al subir.
3. **Prohibido**: movimiento ambiental/loops, parallax, transforms ligados a scroll, `transition-all`.
4. **Progressive enhancement**: sin JS, todo el contenido es **visible y legible**. El estado inicial
   oculto se aplica ÚNICAMENTE bajo una clase raíz `js` en `<html>` (patrón anti-FOUC). Si falla el JS,
   no hay nada oculto.
5. **Solo propiedades explícitas**: `opacity` y `transform`. Nada de animar layout.
6. **Duraciones**: feedback `fast 120ms` · reveal `base 200ms` · hero `slow 320ms`. Nunca `slow` en hover.
7. **Curvas**: reveal corto y hover → `ease-out-expo`; hero (recorrido mayor, asentamiento calmado) →
   `ease-out-quart`. Prohibido `ease`/`linear`.
8. **Distancia**: reveal `translateY(8px→0)`; hero `translateY(12px→0)`. Corta, tipo impresión.
9. **Stagger**: solo en grupos **paralelos y de igual peso, ≤6**. Paso 40ms; el 7.º en adelante
   comparte el delay del 6.º (200ms). Nunca simultáneo, nunca en listas largas.
10. **reduced-motion**: la variante de cada animación escribe el **estado final directo**
    (`opacity:1; transform:none`) bajo `@media (prefers-reduced-motion: reduce)`. El collapse global a
    `0.01ms` (input.css) es SOLO red de seguridad, no la estrategia.

## Tabla por bloque

| Bloque | ¿Anima? | Propiedades | Duración | Curva | Stagger | reduced-motion |
|---|---|---|---|---|---|---|
| **navbar** (chrome fijo) | **No** | — | — | — | — | — |
| navbar links / botones (hover·focus) | Sí (feedback) | `color`, `border-color` | fast 120ms | expo | — | sin transición (estado final) |
| navbar panel móvil (abrir/cerrar) | Sí | `grid-template-rows` (0fr↔1fr) | base 200ms | expo | — | sin transición (estado final) |
| **hero** panel (whoami) | Sí (1 vez, al cargar) | `opacity`, `translateY(12px→0)` | slow 320ms | **quart** | — (bloque único) | `opacity:1; transform:none` |
| hero stack chips (dentro del panel) | **No** — heredan el reveal del panel | — | — | — | — | — |
| hero CTAs (hover) | Sí (feedback) | `background-color`, `color`, `border-color` | fast 120ms | expo | — | — |
| **section-header** ×5 (índice+título) | Sí (reveal) | `opacity`, `translateY(8px→0)` | base 200ms | expo | no (cada header entra por su cuenta) | `opacity:1; transform:none` |
| **skill-category** ×N | Sí (reveal) | `opacity`, `translateY(8px→0)` | base 200ms | expo | **sí: 40ms, máx 6** | `opacity:1; transform:none` |
| **project-card** ×10 (reveal por fila) | Sí | `opacity`, `translateY(8px→0)` | base 200ms | expo | 40ms **solo si la fila tiene >2 cards**; 0ms con ≤2 | `opacity:1; transform:none` |
| **footer** | **No** | — | — | — | — | — |
| footer links (hover) | Sí (feedback) | `color`, `border-color` | fast 120ms | expo | — | — |
| **back-to-top** (aparece >1 viewport) | Sí | `opacity`, `visibility`, `translateY(8px→0)` | base 200ms | expo | — | estado final directo |

### Justificaciones puntuales
- **hero a 320ms (`slow`) con `quart`**: es la entrada principal de la página, ocurre una sola vez y no
  compite con nada. El recorrido es mayor (12px) y `quart` asienta el movimiento largo antes que el
  `expo` corto, evitando el "frenazo" final en un desplazamiento amplio. **Es el único uso de `slow`.**
- **back-to-top a `translateY(8px→0)` / `200ms`**: se iguala a la velocidad de los `section-header`
  (misma distancia y duración) para que el chrome flotante no parezca más "nervioso" que el contenido.
- **hero stack chips**: van DENTRO del panel del hero y heredan su reveal (aparecen con él). No tienen
  animación propia: el "No" de la tabla significa **"no animan por separado"**.

## Qué NO anima y por qué
- **navbar** completo: es chrome persistente; animarlo distrae de la lectura. Solo feedback de interacción.
- **footer**: es el final de la lectura; un reveal ahí no aporta.
- **stack chips del hero**: no animan por separado; heredan el reveal del panel (ver Justificaciones).
- **guías dashed** de `section-header`: textura estática (identidad Terminal), no se anima.
- **bordes/superficies**: solo cambian en estados hover/focus, no por entrada.

## Orden y mecánica del stagger
- **skill-category**: orden = orden del DOM = orden de lectura; `delay = índice × 40ms`. El 7.º y
  siguientes → `delay = 200ms` fijo (máx 6 escalonados). Implementado por la utilidad `.stagger` de
  input.css.
- **project-card**: el stagger es **por fila**, nunca global. Solo si una fila tiene **>2 cards** se
  escalona `40ms × índice de columna` dentro de esa fila; con ≤2 cards la fila aparece **sin delay**
  (10 filas por scroll ya bastan). El orden se lee izquierda→derecha, arriba→abajo (orden del DOM por
  filas); verificado en Fase 5.

## Set de reveal — marcador, trigger y estado
- **Marcador (HTML)**: atributo `data-animate` en `section-header`, `skill-category` y `project-card`.
  El `hero` panel NO lleva `data-animate`: dispara con `window.load`, no con IO.
- **Marcador (Fase 4)**: los bloques llevan `data-animate` pero **sin** estado oculto en el CSS base, así
  el skeleton se ve y funciona completo sin JS.
- **Estado (Fase 5)**: el observer añade la clase `.is-visible`; el estado oculto vive **solo** bajo
  `html.js [data-animate]:not(.is-visible)` → `{ opacity:0; transform:translateY(8px) }`.

| Grupo | Entrada | rootMargin | threshold | unobserve |
|---|---|---|---|---|
| `hero` panel | `window.load` (una vez) | — | — | — (n/a) |
| `section-header` ×5 | IO | `0px 0px -10% 0px` | `0.1` | sí |
| `skill-category` ×N | IO | `0px 0px -10% 0px` | `0.1` | sí |
| `project-card` ×10 | IO (por fila) | `0px 0px -10% 0px` | `0.1` | sí |

- **`rootMargin: 0px 0px -10% 0px`** → dispara cuando el bloque asoma un 10 % desde el borde inferior del
  viewport (no al primer píxel), para que el reveal no se sienta "tarde".
- **`threshold: 0.1`** → basta con que el 10 % del bloque sea visible.
- **`unobserve()` tras el primer disparo**: revelado una sola vez; nunca re-dispara al subir.
- **Sin JS**: `<html>` no lleva la clase `js` → ninguna regla oculta aplica → todo visible.

## Verificación (Fase 5)
- Cada reveal: confirmar **fade suave** (no snap) con Playwright midiendo opacidad intermedia.
- `prefers-reduced-motion: reduce`: el elemento aparece en **estado final inmediato**, sin desplazamiento.
- Curvas medidas: `cubic-bezier(0.16, 1, 0.3, 1)` (expo) y `cubic-bezier(0.25, 1, 0.5, 1)` (quart).
- Stagger medido: `0/40/80/120/160/200/200…` ms, máx 6 distintos.
- **project-card**: orden de lectura del stagger por fila confirmado (izq→der, arriba→abajo) y regla
  "≤2 cards → sin delay" respetada en 375/768/1280 px.
