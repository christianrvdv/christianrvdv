// assets/js/modules/scroll-animations.js — Reveal de entrada (Fase 5).
// Un solo IntersectionObserver para section-header, skill-category y
// project-card: revela una vez y hace unobserve (nunca re-dispara al subir).
// Sin scroll listeners. El estado oculto vive bajo html.js, asi que sin JS el
// contenido es visible y legible.
// reduced-motion: estado final directo (fade de opacidad, sin desplazamiento).
// El hero no usa IO: dispara una vez con window.load (ver MOTION.md).

const REVEAL = '[data-animate]';
const HERO = '.hero__panel';
const STEP_MS = 40;   // --stagger-step
const MAX_STAGGER = 6; // --stagger-max

export function initScrollAnimations() {
    if (!document.documentElement.classList.contains('js')) return;

    const reveal = (el) => el.classList.add('is-visible');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // reduced-motion: sin observer ni esperas; el CSS ya quita el desplazamiento.
    if (reduced) {
        document.querySelectorAll(`${REVEAL}, ${HERO}`).forEach(reveal);
        return;
    }

    // project-card: stagger SOLO por fila con >2 cards (40ms x columna, max 6).
    // La fila se detecta por offsetTop (mismo top = misma fila). Se recalcula
    // al cambiar de ancho; nunca en scroll.
    const applyRowStagger = () => {
        const cards = document.querySelectorAll('.project-card[data-animate]');
        let row = [];
        let rowTop = null;
        const flush = () => {
            row.forEach((el, i) => {
                if (row.length > 2 && i < MAX_STAGGER) {
                    el.style.setProperty('--reveal-delay', `${i * STEP_MS}ms`);
                } else {
                    el.style.removeProperty('--reveal-delay');
                }
            });
            row = [];
        };
        cards.forEach((el) => {
            const top = el.offsetTop;
            if (rowTop === null) rowTop = top;
            if (top !== rowTop) {
                flush();
                rowTop = top;
            }
            row.push(el);
        });
        flush();
    };

    applyRowStagger();

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            reveal(entry.target);
            obs.unobserve(entry.target); // revelado una sola vez
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

    document.querySelectorAll(REVEAL).forEach((el) => observer.observe(el));

    // Columnas pueden cambiar con el ancho: reajusta los delays pendientes.
    let raf = 0;
    window.addEventListener('resize', () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(applyRowStagger);
    });

    // Hero: entrada principal, una vez, al terminar la carga.
    const revealHero = () => {
        const panel = document.querySelector(HERO);
        if (panel) reveal(panel);
    };
    if (document.readyState === 'complete') revealHero();
    else window.addEventListener('load', revealHero, { once: true });
}
