// assets/js/modules/i18n.js — carga de traducciones desde JSON (assets/i18n/*.json)
// y aplicación a elementos [data-i18n] / [data-i18n-placeholder].
// Portafolio: localStorage || 'es' (sin cambio). CV: cascada ADR-003 (A4):
// ?lang > ruta /cv/en/ > localStorage > 'es'.

const I18N_BASE = '/assets/i18n';

export async function loadTranslations(scope) {
    const [es, en] = await Promise.all([
        fetch(`${I18N_BASE}/${scope}.es.json`).then((r) => {
            if (!r.ok) throw new Error(`${scope}.es.json HTTP ${r.status}`);
            return r.json();
        }),
        fetch(`${I18N_BASE}/${scope}.en.json`).then((r) => {
            if (!r.ok) throw new Error(`${scope}.en.json HTTP ${r.status}`);
            return r.json();
        }),
    ]);
    return { es, en };
}

export function applyTranslations(dict, lang, options = {}) {
    const t = dict[lang] || dict.es;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (t[key] !== undefined) {
            if (el.tagName === 'TITLE') {
                el.textContent = t[key];
            } else {
                el.innerHTML = t[key];
            }
        }
    });
    if (options.placeholders) {
        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (t[key] !== undefined) {
                el.placeholder = t[key];
            }
        });
    }
}

export function initPortfolioI18n(dict) {
    const languageToggle = document.getElementById('languageToggle');
    const languageText = document.querySelector('.language-text');

    let currentLang = 'es';
    try {
        currentLang = localStorage.getItem('language') || 'es';
    } catch (e) { /* ignore */
    }
    document.documentElement.lang = currentLang;
    if (languageText) languageText.textContent = currentLang === 'en' ? 'EN' : 'ES';

    const changeLanguage = (lang) => {
        document.documentElement.lang = lang;
        try {
            localStorage.setItem('language', lang);
        } catch (e) { /* ignore */
        }
        applyTranslations(dict, lang, { placeholders: true });
        if (languageText) languageText.textContent = lang === 'en' ? 'EN' : 'ES';

        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.className = 'sr-only';
        liveRegion.textContent = lang === 'es' ? 'Idioma cambiado a español' : 'Language changed to English';
        document.body.appendChild(liveRegion);
        setTimeout(() => liveRegion.remove(), 1500);
    };

    changeLanguage(currentLang);

    if (languageToggle) {
        languageToggle.addEventListener('click', () => {
            const newLang = document.documentElement.lang === 'es' ? 'en' : 'es';
            changeLanguage(newLang);
        });
    }
}

export function initCvI18n(dict) {
    const params = new URLSearchParams(window.location.search);
    const paramLang = params.get('lang');

    let lang = null;
    if (paramLang === 'en' || paramLang === 'es') {
        lang = paramLang;
    } else if (window.location.pathname === '/cv/en' || window.location.pathname.startsWith('/cv/en/')) {
        lang = 'en';
    } else {
        try {
            lang = localStorage.getItem('language') || 'es';
        } catch (e) { /* ignore */
        }
    }
    if (!lang) lang = 'es';

    try {
        localStorage.setItem('language', lang);
    } catch (e) { /* ignore */
    }
    document.documentElement.lang = lang;
    if (paramLang) {
        history.replaceState(null, '', window.location.pathname);
    }

    const updatePdfLink = (useLang) => {
        const pdfLink = document.getElementById('cv-pdf-link');
        if (pdfLink) {
            pdfLink.href = useLang === 'en'
                ? '/assets/docs/cv-christian-vazquez-en.pdf'
                : '/assets/docs/cv-christian-vazquez.pdf';
        }
    };

    applyTranslations(dict, lang);
    updatePdfLink(lang);

    window.addEventListener('storage', (e) => {
        if (e.key === 'language') {
            const newLang = e.newValue || 'es';
            document.documentElement.lang = newLang;
            applyTranslations(dict, newLang);
        }
    });
}
