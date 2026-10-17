/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: ["./*.html", "./cv/**/*.html", "./assets/js/**/*.js"],
    theme: {
        extend: {
            // ============================================================
            // COLOR — tokens nombrados por rol (Terminal Industrial)
            // Se mapean a var(--color-*) en plano: el valor real (OKLCH, con
            // HEX documentado) vive en src/styles/tokens.css. Sin <alpha-value>
            // a propósito: el sistema es sólido + bordes, no translúcido.
            // Para translucidez puntual: color-mix(in oklab, var(--color-accent) 12%, transparent)
            // ============================================================
            colors: {
                background: 'var(--color-background)',
                surface: 'var(--color-surface)',
                'surface-elevated': 'var(--color-surface-elevated)',
                foreground: 'var(--color-foreground)',
                muted: 'var(--color-muted)',
                border: 'var(--color-border)',
                'border-strong': 'var(--color-border-strong)',
                accent: 'var(--color-accent)',
                'accent-muted': 'var(--color-accent-muted)',
                'accent-ink': 'var(--color-accent-ink)',
                focus: 'var(--color-focus)',
                error: 'var(--color-error)',
                success: 'var(--color-success)',
                warn: 'var(--color-warn)',
                link: 'var(--color-link)',
                'link-visited': 'var(--color-link-visited)',
            },

            // ============================================================
            // TIPOGRAFÍA — IBM Plex Mono es display + UI + labels.
            // IBM Plex Sans SOLO para párrafos > ~80 caracteres (about,
            // descripciones de proyecto). Umbral: 80 car. Si el texto cabe
            // en una línea de UI, es mono. Ver docs/ADR tras FASE 2.
            // ============================================================
            fontFamily: {
                mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
                sans: ['IBM Plex Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                display: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
                ui: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
                label: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
            },

            // Escala modular nombrada por rol (8 roles; nada fuera de escala).
            // tabular-nums se aplica por CSS base a headings/métricas (mono ya es tabular).
            fontSize: {
                'display-xl': ['clamp(3rem, 8vw, 6.5rem)', { lineHeight: '0.95', letterSpacing: '-0.03em', fontWeight: '600' }],
                'display-lg': ['clamp(2.25rem, 5vw, 3.5rem)', { lineHeight: '1.02', letterSpacing: '-0.02em', fontWeight: '600' }],
                'heading': ['1.75rem', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '600' }],
                'subhead': ['1.25rem', { lineHeight: '1.35', fontWeight: '500' }],
                'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
                'caption': ['0.8125rem', { lineHeight: '1.45', fontWeight: '400' }],
                'code': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
                'mono-label': ['0.75rem', { lineHeight: '1.2', letterSpacing: '0.08em', fontWeight: '500' }],
            },

            // Espaciado semántico sobre base 8px. NO se pisa la escala numérica
            // de Tailwind (la usan las páginas CV, fuera de alcance); la regla
            // "múltiplos de 8" se aplica por convención vía estos tokens.
            spacing: {
                unit: 'var(--space-unit)',
                gutter: 'var(--space-gutter)',
                'margin-mobile': 'var(--space-margin-mobile)',
                'margin-desktop': 'var(--space-margin-desktop)',
                'section-gap': 'var(--space-section-gap)',
                'panel-padding': 'var(--space-panel-padding)',
            },

            // Radios: SOLO 0 y full (ancla Terminal). Sin excepciones.
            borderRadius: {
                none: '0',
                sm: '0', DEFAULT: '0', md: '0', lg: '0', xl: '0', '2xl': '0', '3xl': '0',
                full: '9999px',
            },

            // Sombras: NINGUNA. La separación es con bordes de 1px o guías
            // de 1px dashed. Se anulan los defaults para que nada las reintroduzca.
            boxShadow: {
                none: 'none',
                DEFAULT: 'none', sm: 'none', md: 'none', lg: 'none', xl: 'none', '2xl': 'none', inner: 'none',
            },

            // Motion: 3 duraciones.
            transitionDuration: {
                DEFAULT: '200ms',
                fast: '120ms',
                base: '200ms',
                slow: '320ms',
            },

            // Motion: 2 curvas custom. Prohibido ease/linear.
            transitionTimingFunction: {
                DEFAULT: 'cubic-bezier(0.16, 1, 0.3, 1)',
                expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
                quart: 'cubic-bezier(0.25, 1, 0.5, 1)',
            },
        },
    },
    plugins: [],
};
