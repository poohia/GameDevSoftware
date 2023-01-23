import { createContext } from 'react';
import { TranslationObject } from 'types';

export type TranslationsContextType = {
  translations: TranslationObject;
  gameLocale: string;
  setTranslations: (translations: TranslationObject) => void;
  setGameLocale: (locale: string) => void;
};
const TranslationsContext = createContext<TranslationsContextType>({
  translations: {},
  gameLocale: 'en',
  setTranslations: () => {},
  setGameLocale: () => {},
});

export default TranslationsContext;
