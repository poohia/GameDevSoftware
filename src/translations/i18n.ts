import i18n from 'i18n-js';

import en from './en.json';
import fr from './fr.json';

const localeEnable = ['en', 'fr'];

const fortmatLocale = () => {
  const localeFromStorage = window.localStorage.getItem('locale');
  const locale = localeFromStorage ? localeFromStorage : navigator.language;

  if (locale.includes('en')) return 'en';
  if (locale.includes('fr')) return 'fr';
  if (!localeEnable.includes(locale)) return 'en';

  return 'en';
};
// Set the key-value pairs for the different languages you want to support.
i18n.translations = {
  en,
  fr,
};
// Set the locale once at the beginning of your app.
i18n.locale = fortmatLocale();

export default i18n;
