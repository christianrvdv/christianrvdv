// assets/js/modules/theme.js — tema oscuro/claro (clase 'dark' en <html>).
// El anti-FOUC del <head> (inline) ya aplicó la clase antes del primer paint;
// aquí solo se mantiene sincronizada con localStorage y el toggle.
// Nota 6c.3: los glifos Material Symbols se sirven como subset local con cmap
// privado; se inyectan como entidades HTML: dark_mode = U+E004, light_mode = U+E014.

const htmlElement = document.documentElement;

export function initTheme() {
    const themeToggle = document.getElementById('themeToggle');

    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem('theme');
    } catch (e) { /* ignore */
    }
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        htmlElement.classList.add('dark');
        if (themeToggle) themeToggle.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">&#xE014;</span>';
    } else {
        htmlElement.classList.remove('dark');
        if (themeToggle) themeToggle.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">&#xE004;</span>';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (htmlElement.classList.contains('dark')) {
                htmlElement.classList.remove('dark');
                try {
                    localStorage.setItem('theme', 'light');
                } catch (e) { /* ignore */
                }
                themeToggle.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">&#xE004;</span>';
            } else {
                htmlElement.classList.add('dark');
                try {
                    localStorage.setItem('theme', 'dark');
                } catch (e) { /* ignore */
                }
                themeToggle.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">&#xE014;</span>';
            }
        });
    }
}
