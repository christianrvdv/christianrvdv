/**
 * nav.js — Navegación Terminal Industrial
 * - Active tracking via IntersectionObserver (resuelve H16)
 * - Mobile panel grid-template-rows 0fr→1fr + inert (resuelve H16 transición muerta)
 * - Theme toggle + lang flags --lang=es|en (CLI coherente)
 * - Single nav system (resuelve H10 doble nav)
 */

(() => {
    'use strict';

    // ============================================================
    // Configuración y estado
    // ============================================================
    const NAV_HEIGHT = 64; // px — coincide con --nav-height en CSS
    const STORAGE_THEME_KEY = 'theme';
    const STORAGE_LANG_KEY = 'language';

    let sections = [];
    let observer = null;
    let mobilePanel = null;
    let mobileToggle = null;
    let mobileInner = null;
    let closeMobilePanel = () => {};
    let lastActiveId = null;

    // ============================================================
    // Utilidades
    // ============================================================
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    const setTheme = (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem(STORAGE_THEME_KEY, theme);
        // Sincronizar botones de tema
        $$('[data-theme-toggle]').forEach(btn => {
            btn.setAttribute('aria-pressed', theme === 'dark');
        });
    };

    const setLang = (lang) => {
        localStorage.setItem(STORAGE_LANG_KEY, lang);
        // Actualizar UI de idioma
        $$('[data-lang-btn]').forEach(btn => {
            btn.setAttribute('aria-pressed', btn.dataset.langBtn === lang);
        });
        // Disparar evento para i18n.js
        window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
    };

    // ============================================================
    // Theme / Lang init (desde localStorage o default)
    // ============================================================
    const initTheme = () => {
        const saved = localStorage.getItem(STORAGE_THEME_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(saved || (prefersDark ? 'dark' : 'light'));
    };

    const initLang = () => {
        const saved = localStorage.getItem(STORAGE_LANG_KEY) || 'es';
        setLang(saved);
    };

    // ============================================================
    // Mobile Panel — grid-template-rows 0fr → 1fr + inert
    // NO se usa `hidden`/`display:none`: un elemento en display:none no
    // tiene estado previo que interpolar, así que el panel "saltaría".
    // Cerrado = fila 0fr (alto real 0, padding vive en --inner) + inert.
    // ============================================================
    const initMobilePanel = () => {
        mobilePanel = $('#mobile-menu');
        mobileToggle = $('#mobile-toggle');
        mobileInner = mobilePanel?.querySelector('.navbar__nav-inner');

        if (!mobilePanel || !mobileToggle) return;

        const isDesktop = () => window.matchMedia('(min-width: 769px)').matches;

        const setOpen = (open) => {
            mobilePanel.classList.toggle('open', open);
            mobileToggle.setAttribute('aria-expanded', String(open));
            if ('inert' in mobilePanel) mobilePanel.inert = !open;
            else mobilePanel.classList.toggle('inert-polyfill', !open);
        };

        // Cerrado por defecto (el CSS lo colapsa a 0fr en móvil)
        setOpen(false);

        const updateResponsive = () => {
            if (isDesktop()) {
                // Escritorio: el panel ES el nav normal, siempre operable
                mobilePanel.classList.remove('open');
                mobileToggle.setAttribute('aria-expanded', 'false');
                if ('inert' in mobilePanel) mobilePanel.inert = false;
                else mobilePanel.classList.remove('inert-polyfill');
            } else {
                setOpen(false);
            }
        };

        updateResponsive();
        window.addEventListener('resize', updateResponsive);

        const open = () => {
            if (isDesktop()) return;
            setOpen(true);
            setTimeout(() => mobileInner?.querySelector('.navbar__link')?.focus(), 160);
        };

        const close = () => {
            if (isDesktop()) return;
            setOpen(false);
            mobileToggle.focus();
        };

        closeMobilePanel = close;

        const toggle = () => {
            if (isDesktop()) return;
            setOpen(!mobilePanel.classList.contains('open'));
        };

        mobileToggle.addEventListener('click', toggle);

        // ESC para cerrar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobilePanel.classList.contains('open')) close();
        });

        // Click en el área vacía del panel cierra
        mobilePanel.addEventListener('click', (e) => {
            if (e.target === mobilePanel) close();
        });

        // Enlaces internos cierran panel
        $$('.navbar__link', mobilePanel).forEach(link => {
            link.addEventListener('click', () => close());
        });
    };

    // ============================================================
    // Active Tracking — IntersectionObserver (resuelve H16)
    // ============================================================
    const initActiveTracking = () => {
        sections = $$('section[id]');
        if (sections.length === 0) return;

        const navHeightPx = NAV_HEIGHT;
        const rootMargin = `-${navHeightPx + 16}px 0px -50% 0px`;

        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    if (id && id !== lastActiveId) {
                        setActiveLink(id);
                        lastActiveId = id;
                    }
                }
            });
        }, {
            rootMargin,
            threshold: 0
        });

        sections.forEach(section => observer.observe(section));
    };

    const setActiveLink = (id) => {
        $$('.navbar__link').forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#') && href.slice(1) === id) {
                link.setAttribute('aria-current', 'location');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    // ============================================================
    // Smooth scroll + active update on click
    // ============================================================
    const initSmoothScroll = () => {
        $$('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (!href || href === '#') return;

                // El skip-link usa navegacion nativa para mover el foco a <main>
                if (anchor.classList.contains('skip-link')) return;

                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();
                const targetTop = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
                window.scrollTo({ top: targetTop, behavior: 'smooth' });

                // Forzar active inmediato
                const id = href.slice(1);
                if (id !== lastActiveId) {
                    setActiveLink(id);
                    lastActiveId = id;
                }

                // Cerrar mobile panel si está abierto
                if (mobilePanel?.classList.contains('open')) {
                    closeMobilePanel();
                }
            });
        });
    };

    // ============================================================
    // Theme Toggle — persistencia + sync UI
    // ============================================================
    const initThemeToggle = () => {
        $$('[data-theme-toggle]').forEach(btn => {
            btn.addEventListener('click', () => {
                const isDark = document.documentElement.classList.contains('dark');
                setTheme(isDark ? 'light' : 'dark');
            });
        });

        // Sync inicial de aria-pressed
        $$('[data-theme-toggle]').forEach(btn => {
            const isDark = document.documentElement.classList.contains('dark');
            btn.setAttribute('aria-pressed', String(isDark));
        });
    };

    // ============================================================
    // Lang Toggle — flags CLI --lang=es|en
    // ============================================================
    const initLangToggle = () => {
        $$('[data-lang-btn]').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.langBtn;
                if (lang) setLang(lang);
            });
        });

        // Sync inicial
        const current = localStorage.getItem(STORAGE_LANG_KEY) || 'es';
        $$('[data-lang-btn]').forEach(btn => {
            btn.setAttribute('aria-pressed', String(btn.dataset.langBtn === current));
        });
    };

    // ============================================================
    // Inicialización
    // ============================================================
    const init = () => {
        initTheme();
        initLang();
        initMobilePanel();
        initActiveTracking();
        initSmoothScroll();
        initThemeToggle();
        initLangToggle();

        // Exponer API para testing/debug
        window.__NAV__ = {
            setTheme,
            setLang,
            openMobile: () => mobilePanel?.classList.add('open'),
            closeMobile: () => mobilePanel?.classList.remove('open'),
            getActive: () => lastActiveId,
            observe: () => observer?.takeRecords?.()
        };
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();