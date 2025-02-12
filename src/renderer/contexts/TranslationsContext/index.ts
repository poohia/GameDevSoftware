import { createContext } from 'react';
import { Translation, TranslationObject } from 'types';

export type TranslationsContextType = {
  translations: TranslationObject;
  gameLocale: string;
  currentTranslations: Translation[];
  setTranslations: (translations: TranslationObject) => void;
  setGameLocale: (locale: string) => void;
};
const TranslationsContext = createContext<TranslationsContextType>({
  translations: {},
  gameLocale: 'en',
  currentTranslations: [],
  setTranslations: () => {},
  setGameLocale: () => {},
});

export default TranslationsContext;
