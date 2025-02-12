import { useCallback, useEffect, useMemo, useState } from 'react';
import { TranslationObject } from 'types';
import useEvents from '../useEvents';
import { reorderByLanguage } from 'utils';

const useTranslations = () => {
  const [gameLocale, setGameLocaleState] = useState<string>('en');
  const [translations, setTranslations] = useState<TranslationObject>({});
  const [gameLocaleCharged, setGameLocalCharged] = useState<boolean>(false);
  const { sendMessage, on, requestMessage } = useEvents();

  const currentTranslations = useMemo(() => {
    if (translations === undefined || Object.keys(translations).length === 0) {
      return [];
    }
    return (
      translations[gameLocale] || translations[Object.keys(translations)[0]]
    );
  }, [translations, gameLocale]);

  const setGameLocale = useCallback((locale: string) => {
    setGameLocaleState(locale);
    sendMessage('set-game-locale', locale);
  }, []);

  useEffect(() => {
    if (gameLocaleCharged) {
      sendMessage('load-translations', gameLocale);
    }
  }, [gameLocale, gameLocaleCharged]);

  useEffect(() => {
    on('load-translations', (args) => {
      setGameLocaleState((locale) => {
        setTranslations(reorderByLanguage(args, locale));
        return locale;
      });
    });
    requestMessage('load-game-locale', (args) => {
      setGameLocaleState(args);
      setGameLocalCharged(true);
    });
  }, []);

  return {
    translations,
    gameLocale,
    currentTranslations,
    setTranslations,
    setGameLocale,
  };
};

export default useTranslations;
