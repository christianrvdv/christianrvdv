// assets/js/modules/back-to-top.js — botón "volver arriba": aparece tras 300px
// de scroll y lleva al tope con scroll suave (port literal pre-FASE 5).

export function initBackToTop() {
    const backToTop = document.getElementById('backToTop');

    const toggleBackToTop = () => {
        if (!backToTop) return;
        if (window.pageYOffset > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    };

    if (backToTop) {
        backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    window.addEventListener('scroll', toggleBackToTop);
    window.addEventListener('load', toggleBackToTop);
}
