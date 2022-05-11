import { createContext } from 'react';
import { Translation } from 'types';

type TranslationsContextType = {
  translations: Translation;
};
const TranslationsContext = createContext<TranslationsContextType>({
  translations: {},
});

export default TranslationsContext;
