// assets/js/cv.js — entrada del CV (FASE 5).
// Reemplaza cv-translations.js + el <script> inline de los CV: carga
// assets/i18n/cv.{es,en}.json y aplica la cascada ADR-003 (A4):
// ?lang > ruta /cv/en/ > localStorage > 'es'.

import { loadTranslations, initCvI18n } from './modules/i18n.js';

loadTranslations('cv')
    .then((dict) => initCvI18n(dict))
    .catch((err) => console.error('[i18n] traducciones CV no disponibles:', err));
