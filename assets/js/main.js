// assets/js/main.js — orquestador del portafolio (FASE 5).
// Antes: monolito de 492 ln. Ahora: delega en módulos ES (assets/js/modules/)
// y carga las traducciones desde assets/i18n/portfolio.{es,en}.json.
// Los módulos se ejecutan tras el parseo del DOM (type="module" ≈ defer).

import { initTheme } from './modules/theme.js';
import { loadTranslations, initPortfolioI18n } from './modules/i18n.js';
import { initMobileMenu } from './modules/mobile-menu.js';
import { initNavbar } from './modules/navbar.js';
import { initBackToTop } from './modules/back-to-top.js';
import { initScrollAnimations } from './modules/scroll-animations.js';
import { initActiveNav } from './modules/active-nav.js';

initTheme();
initNavbar();
initMobileMenu();
initBackToTop();
initScrollAnimations();
initActiveNav();

loadTranslations('portfolio')
    .then((dict) => initPortfolioI18n(dict))
    .catch((err) => console.error('[i18n] traducciones no disponibles:', err));
