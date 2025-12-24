import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en/translation.json';
import ptTranslations from './locales/pt/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      pt: {
        translation: ptTranslations,
      },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'pt'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      // Normalize pt-BR, pt-PT to pt
      convertDetectedLanguage: (lng: string) => {
        if (lng.startsWith('pt')) {
          return 'pt';
        }
        return lng === 'en' ? 'en' : 'en';
      },
    },
    interpolation: {
      escapeValue: false,
    },
  });

// Update HTML lang attribute when language changes
const updateHtmlLang = (lng: string) => {
  const normalizedLang = lng.startsWith('pt') ? 'pt' : (lng === 'en' ? 'en' : 'en');
  document.documentElement.lang = normalizedLang === 'pt' ? 'pt-BR' : 'en';
};

i18n.on('languageChanged', (lng) => {
  updateHtmlLang(lng);
});

// Set initial lang attribute after a short delay to ensure i18n is initialized
setTimeout(() => {
  updateHtmlLang(i18n.language || 'en');
}, 0);

export default i18n;

