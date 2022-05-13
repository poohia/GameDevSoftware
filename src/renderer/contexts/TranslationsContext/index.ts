import { createContext } from 'react';
import { Translation } from 'types';

type TranslationsContextType = {
  translations: Translation;
  gameLocale: string;
  setGameLocale: (locale: string) => void;
};
const TranslationsContext = createContext<TranslationsContextType>({
  translations: {},
  gameLocale: 'en',
  setGameLocale: () => {},
});

export default TranslationsContext;
