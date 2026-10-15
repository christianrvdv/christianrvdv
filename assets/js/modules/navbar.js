// assets/js/modules/navbar.js — navbar sticky: se oculta al bajar (>80px) y
// reaparece al subir o volver al tope (port literal del monolito pre-FASE 5).

export function initNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll <= 0) {
            navbar.classList.remove('-translate-y-full');
            return;
        }
        if (currentScroll > lastScroll && currentScroll > 80) {
            navbar.classList.add('-translate-y-full');
        } else {
            navbar.classList.remove('-translate-y-full');
        }
        lastScroll = currentScroll;
    });
}
