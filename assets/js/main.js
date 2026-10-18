// assets/js/main.js - orquestador del portafolio.
// nav.js agrupa en un solo modulo: tema, idioma (data-lang-btn), menu movil,
// active tracking (IntersectionObserver), smooth scroll y persistencia.
// i18n.js carga los diccionarios JSON y aplica [data-i18n].
// Los modulos se ejecutan tras el parseo del DOM (type="module" == defer).

import './modules/nav.js';
import { initBackToTop } from './modules/back-to-top.js';
import { initScrollAnimations } from './modules/scroll-animations.js';
import { loadTranslations, applyTranslations, initPortfolioI18n } from './modules/i18n.js';

initBackToTop();
initScrollAnimations();

loadTranslations('portfolio')
    .then((dict) => {
        initPortfolioI18n(dict);
        // nav.js emite 'langchange' al pulsar [data-lang-btn]; aqui se reaplica
        // el diccionario para que el cambio de idioma sea efectivo.
        window.addEventListener('langchange', (e) => {
            const lang = (e.detail && e.detail.lang) || 'es';
            document.documentElement.lang = lang;
            applyTranslations(dict, lang, { placeholders: true });
        });
    })
    .catch((err) => console.error('[i18n] traducciones no disponibles:', err));
