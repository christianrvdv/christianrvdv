# FASE 9.5 — Revisión pre-push (Go/No-Go)

Fecha: 2026-10-17 · Commits bajo revisión: `d1f0ddf..HEAD` (33 commits, rama `main`, aún sin push) · Gate previo: **GATE 9.4 PASS** (auditoría pasiva aprobada por el usuario).

Objetivo: verificar que el árbol completo del refactor (estructura de carpetas, CVs en rutas canónicas, i18n JSON, build de PDFs, a11y) está limpio, medible y sin regresiones **antes** de hacer push en FASE 9.6.

---

## 9.5.1 Estado del repositorio y dependencias ✅

- `git status`: **limpio** al inicio de la fase (los PDFs regenerados por 9.5.4 son la única modificación intencional de la fase, commiteados abajo).
- 34 commits por delante de `origin/main`; ninguno con mensajes WIP (`wip|tmp|fixup|squash`): 0 hits.
- `npm ls` → 0 errores de instalación; solo `UNMET OPTIONAL` de `fsevents`, `tsx`, `yaml` — opcionales legítimos en Windows (no usados por el build).
- `git diff HEAD -- package.json package-lock.json` → **vacío** (sin cambios de dependencias sin commitear).
- `package-lock.json` está trackeado (regla ADR-006).

## 9.5.2 Búsqueda de artefactos de debug ✅

- `console.log`, `TODO:`, `FIXME:`, `debugger;` en HTML/CSS/JS de navegador (`index.html`, `cv/`, `assets/js/`, `assets/css/`, `src/`): **0 hits**.
- `console.error`: 2 permitidos — fallback de i18n (`assets/js/main.js:23`, `assets/js/cv.js:10`). Sin `console.warn` ni `alert`.
- `console.log` solo en CLI (`scripts/serve.mjs`, `scripts/dev.mjs`, `scripts/build-cv.mjs`): permitido, no se sirve al navegador.

## 9.5.3 Lighthouse final ✅

Batería completa: **4 páginas × desktop/móvil × 3 corridas = 24 corridas**, Lighthouse 13.5.0, Chrome headless, `scripts/serve.mjs` en 8888, medianas como valor de gate. JSONs en `docs/verification/lighthouse-fase9.5-*.json`.

| Página | Modo | Perf | A11y | SEO | ¿Cumple? |
|---|---|---|---|---|---|
| `/` | Desktop | **100** | 100 | 100 | ✅ |
| `/` | Móvil | **93** | 100 | 100 | ✅ |
| `/cv/` | Desktop | **100** | 100 | 100 | ✅ |
| `/cv/` | Móvil | **98** | 100 | 100 | ✅ |
| `/cv/en/` | Desktop | **100** | 100 | 100 | ✅ |
| `/cv/en/` | Móvil | **98** | 100 | 100 | ✅ |
| `/cv/ats/` | Desktop | **100** | 100 | 100 | ✅ |
| `/cv/ats/` | Móvil | **100** | 100 | 100 | ✅ |

- Umbrales duros (a11y ≥ 95, SEO ≥ 95, perf desktop ≥ 90): **8/8 cumplidos**.
- LCP ≤ 2500 ms desktop: sí (259–623 ms). CLS ≤ 0.1 en medianas: sí (0 en 7/8; `/` móvil 0.012). TBT ≤ 200 ms: sí.
- Gap móvil `/` (LCP 2733 ms, perf 93 ≥ 85): **documentado y aceptado** desde FASE 9.3 (G4).
- Único outlier de la batería: `/cv/` móvil run3 (perf 87 / CLS 0.183) — mismo patrón no reproducible del outlier P4 de 9.3; mediana 98/0. No bloqueante.
- Detalle completo en `docs/verification/fase9-lighthouse.md` (sección FASE 9.5).

## 9.5.4 PDFs ✅

- `node scripts/build-cv.mjs` → **exit 0** (puerto efímero, sin colisión con el servidor de pruebas).

| PDF | Tamaño | Umbral | Páginas | Umbral |
|---|---|---|---|---|
| `cv-christian-vazquez.pdf` (ES) | 387.2 KiB | ≤ 450 KiB ✅ | 2 | ≤ 2 ✅ |
| `cv-christian-vazquez-en.pdf` (EN) | 378.1 KiB | ≤ 450 KiB ✅ | 2 | ≤ 2 ✅ |
| `cv-christian-vazquez-ats.pdf` (ATS) | 87.1 KiB | ≤ 200 KiB ✅ | 2 | ≤ 2 ✅ |

- **Texto seleccionable probado en los 3 PDFs**: se decodificaron los flujos de contenido reales del PDF (resolución `Fnn → ToUnicode → bfchar/bfrange`). Cadenas extraídas: `Symfony 7/8, Spring Boot 3 y arquitecturas modernas, siempre…` (ES/ATS) y `Symfony 7/8, Spring Boot 3 and modern architectures, always…` (EN). Equivalente funcional al test "Ctrl+F en el PDF".
- **Layout intacto**: HEAD y regenerados tienen 2 páginas en los 3 y el texto extraído es **idéntico** (5023 / 4824 / 3900 chars OLD vs NEW, mismo contenido). El diff binario son timestamps (`CreationDate`/`ModDate`). Commiteados abajo.

## 9.5.5 Smoke test de URLs ✅

Servidor: `netlify dev --offline` (netlify-cli 27.12.1) en :8888 — mismo motor que producirá los 301 en producción. Antes de levantarlo se limpió un `netlify dev` huérfano (PID 9624, de una sesión previa) que ocupaba el puerto 3999.

| URL | Resultado | Location |
|---|---|---|
| `/cv-en` | **301** ✅ | `/cv/index.html?lang=en` ✅ |
| `/cv_christian.html` | **301** ✅ | `/cv/` ✅ |
| `/imagen/sgr1300.webp` | **301** ✅ | `/assets/images/projects/sgr1300.webp` ✅ |
| `/estilo.css` | **301** ✅ | `/assets/css/main.css` ✅ |
| `/script.js` | **301** ✅ | `/assets/js/main.js` ✅ |
| `/cv_christian_vazquez.pdf` | **301** ✅ | `/assets/docs/cv-christian-vazquez.pdf` ✅ |
| `/` | **200** ✅ | — |
| `/cv` | **200** ✅ | — |
| `/cv/en` | **200** ✅ | — |
| `/cv/ats` | **200** ✅ | — |

- Los 6 destinos de 301 resuelven **final 200** con contenido real (HTML/CSS/JS/PDF/WEBP verificados byte a byte en la respuesta).
- Sin catch-all (conservado el comentario de `netlify.toml`: rompería CV/PDF/imágenes).

## 9.5.6 Git diff global (`d1f0ddf → HEAD`) ✅

- 33 commits, 138 archivos, +237 732 / −2 102 líneas — coherente con el refactor completo (estructura, i18n, fonts, ADRs, docs).
- Archivos nuevos (`^A`): solo lo esperado — `cv/*/index.html`, `assets/{css,js,i18n,fonts,images,docs}/`, `scripts/`, `src/styles/`, `docs/{SPEC,CONSTRAINTS,VERIFICATION}.md`, `docs/adr/ADR-001..008`, artefactos de verificación. Sin `.env`, sin claves, sin dumps.
- Renombres coherentes: `cv_christian.html → cv/index.html`, `cv_christian_vazquez*.pdf → assets/docs/`, `estilo.css → assets/css/main.css`, `script.js → assets/js/main.js`.
- **Secretos**: scan (`API_KEY|SECRET|password=|PRIVATE KEY|AKIA…|gh…_|sk-…`) sobre todo el árbol → **0 hits reales** (solo el comentario `# ENTORNO / SECRETOS` de `.gitignore`).
- Archivos > 1 MB: solo 2 screenshots de verificación de FASE 8.5 (1.14 MB, mismo blob) — artefactos de auditoría ya aceptados.
- No hay cambios pendientes de `package.json` ni dependencias nuevas sin ADR.

## 9.5.7 Commits de cierre ✅

```
chore(docs): regenerar PDFs con el build actual (FASE 9.5)
docs(verification): pre-push review final (FASE 9.5)
```

Incluyen: los 3 PDFs regenerados, los 24 JSONs de Lighthouse 9.5, la sección FASE 9.5 de `fase9-lighthouse.md` y este reporte.

---

# GATE 9.5: **GO** ✅

| # | Verificación | Resultado |
|---|---|---|
| 1 | Repo limpio, sin WIP, sin dependencias sucias | ✅ PASS |
| 2 | Cero artefactos de debug servidos | ✅ PASS |
| 3 | Lighthouse 8/8 combos dentro de umbral, sin regresiones | ✅ PASS |
| 4 | PDFs bajo umbral, 2 páginas, texto seleccionable, layout intacto | ✅ PASS |
| 5 | 6 URLs históricas 301 con Location correcto + 4 canónicas 200 | ✅ PASS |
| 6 | Diff global sin secretos ni archivos inesperados | ✅ PASS |
| 7 | Commits de cierre atómicos | ✅ PASS |

**Ningún bloqueador. Los gaps conocidos (LCP móvil de `/`, outlier no reproducible de CLS, G3 de peso 0) siguen documentados y aceptados desde fases anteriores.**

**Veredicto: GO → procede FASE 9.6 (`git push` de `main`).**
