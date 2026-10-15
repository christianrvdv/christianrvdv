// assets/js/modules/scroll-animations.js — IntersectionObserver: .visible en
// <section> y [data-animate]; respeta prefers-reduced-motion (port pre-FASE 5).

export function initScrollAnimations() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sections = document.querySelectorAll('section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                if (prefersReducedMotion) {
                    entry.target.style.transitionDuration = '0s';
                }
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

    sections.forEach((s) => observer.observe(s));

    document.querySelectorAll('[data-animate]').forEach((el) => {
        el.classList.add('opacity-0', 'translate-y-4');
        observer.observe(el);
    });

    window.addEventListener('load', () => {
        setTimeout(() => {
            document.querySelectorAll('[data-animate]').forEach((el) => {
                if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('visible');
            });
        }, 100);
    });
}
