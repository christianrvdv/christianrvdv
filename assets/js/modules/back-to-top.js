/**
 * back-to-top.js — Flecha ascendente Terminal Industrial
 * - Aparece tras scroll > 1 viewport (IntersectionObserver)
 * - Click → smooth scroll to top
 * - Focus-visible = accent outline (regla base en input.css)
 *
 * El centinela debe estar EN FLUJO (position:absolute), no fixed:
 * un elemento fixed no cambia de posición respecto al viewport al
 * scrollear, así que IntersectionObserver nunca lo vería salir.
 */

(() => {
    'use strict';

    const BTN_SELECTOR = '#backToTop';

    let btn = null;
    let sentinel = null;
    let observer = null;

    const createSentinel = () => {
        const el = document.createElement('div');
        el.setAttribute('data-back-to-top-sentinel', '');
        el.setAttribute('aria-hidden', 'true');
        // Ocupa exactamente el primer viewport desde el origen del documento.
        // visibility:hidden (no display:none) → sigue en el árbol de layout.
        el.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:100vh;pointer-events:none;visibility:hidden;';
        document.body.appendChild(el);
        return el;
    };

    const init = () => {
        btn = document.querySelector(BTN_SELECTOR);
        if (!btn) return;

        // El centinela se crea ANTES de observarlo (debe existir en el DOM)
        sentinel = createSentinel();

        observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                // Salió del viewport (scroll > 1 viewport) → mostrar
                btn.classList.toggle('visible', !entry.isIntersecting);
            });
        }, {
            rootMargin: '0px',
            threshold: 0
        });

        observer.observe(sentinel);

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('beforeunload', () => {
            observer.disconnect();
            sentinel.remove();
        });

        // API mínima para verificación
        window.__BACK_TO_TOP__ = {
            sentinel,
            reveal: () => btn.classList.add('visible'),
            hide: () => btn.classList.remove('visible'),
            isVisible: () => btn.classList.contains('visible')
        };
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
