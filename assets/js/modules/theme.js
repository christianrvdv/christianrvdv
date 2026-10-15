// assets/js/modules/theme.js — tema oscuro/claro (clase 'dark' en <html>).
// El anti-FOUC del <head> (inline) ya aplicó la clase antes del primer paint;
// aquí solo se mantiene sincronizada con localStorage y el toggle.

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
        if (themeToggle) themeToggle.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">light_mode</span>';
    } else {
        htmlElement.classList.remove('dark');
        if (themeToggle) themeToggle.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">dark_mode</span>';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (htmlElement.classList.contains('dark')) {
                htmlElement.classList.remove('dark');
                try {
                    localStorage.setItem('theme', 'light');
                } catch (e) { /* ignore */
                }
                themeToggle.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">dark_mode</span>';
            } else {
                htmlElement.classList.add('dark');
                try {
                    localStorage.setItem('theme', 'dark');
                } catch (e) { /* ignore */
                }
                themeToggle.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">light_mode</span>';
            }
        });
    }
}
