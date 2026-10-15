# AGENTS.md

## What this repo is
- Static personal portfolio: plain HTML + vanilla JS + Tailwind CSS v3. No framework, no SSR, no test/lint/typecheck tooling (`npm test` exits 1 by design).
- Pages: `index.html` (portfolio SPA; all behavior lives in `script.js`), `cv_christian.html` (interactive CV; i18n in `cv-translations.js`), `cv_christian_vazquez_ats.html` (ATS CV — inline styles, intentionally no Tailwind), plus PDF exports `cv_christian_vazquez*.pdf`.
- `cucoders_data/profile-data.json` is not referenced by any page (leftover data).

## Commands
- `npm run build` — compiles `src/input.css` → `estilo.css` (minified). This is the only build step.
- `npm run watch` — same, in watch mode for dev.
- No dev server; open the HTML files directly or rely on Netlify.

## CSS pipeline — read before touching styles
- `estilo.css` is **generated, committed output**. `netlify.toml` sets no build command (only `publish = "."`), so Netlify deploys whatever `estilo.css` is in git. After editing `src/input.css` or `tailwind.config.js`: run `npm run build` **and commit `estilo.css`**, or the change never ships.
- Never hand-edit `estilo.css`; the next build overwrites it. Edit `src/input.css` (Tailwind directives, CSS custom properties, custom classes like `.glass`, `.bento-card`).
- `tailwind.config.js` `content: ["./*.{html,js}"]` scans only root-level files. Tailwind classes used in subdirectories are silently dropped from the output.
- Two token styles in `tailwind.config.js`: colors that take opacity modifiers (e. g. `bg-primary/50`) map to `rgb(var(--color-*-rgb) / <alpha-value>)`; the rest map to plain `var(--color-*)`. A new color needs config entries **plus** CSS variables in both `:root` and `.dark` in `src/input.css` (RGB triples too if it must support `/opacity`).
- `darkMode: 'class'`: theme = `dark` class on `<html>`, persisted in `localStorage.theme`. `index.html` has an inline anti-FOUC script in `<head>` that duplicates the theme logic in `script.js` — keep both in sync.

## Deploy / routing gotchas (Netlify)
- Redirects are `/cv` and `/cv-en` → `cv_christian.html`. There is deliberately **no catch-all redirect** (netlify.toml comment: it would break CV/PDF/image paths) — don't add one.
- `/cv-en` passes `?lang=en`, but `cv_christian.html` only reads `localStorage['language']` and ignores the query param; language is effectively controlled by the ES/EN toggle.
- `/*.css` and `/*.js` are served with `Cache-Control: max-age=604800` (7 days) and there is no cache busting — style/JS changes may take days to reach returning visitors.
- `package-lock.json` is gitignored, so use `npm install` (not `npm ci`; no lockfile in git).

## i18n
- Two independent translation systems: inline `translations` in `script.js` for `index.html`, and `cvTranslations` in `cv-translations.js` for the CV page. Both keyed by `data-i18n` attributes. Adding visible text requires updating **both** `es` and `en` entries on the page you touched.
- Default language is Spanish; keep UTF-8 accents intact (PowerShell may display the files as mojibake — that's the console, not the file).

## Git
- Commit style: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`), messages often in Spanish.
