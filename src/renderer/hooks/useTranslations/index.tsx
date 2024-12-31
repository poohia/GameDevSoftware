import { useCallback, useEffect, useState } from 'react';
import { TranslationObject } from 'types';
import useEvents from '../useEvents';
import { reorderByLanguage } from 'utils';

const useTranslations = () => {
  const [gameLocale, setGameLocaleState] = useState<string>('en');
  const [translations, setTranslations] = useState<TranslationObject>({});
  const [gameLocaleCharged, setGameLocalCharged] = useState<boolean>(false);
  const { sendMessage, on, requestMessage } = useEvents();

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

  return { translations, gameLocale, setTranslations, setGameLocale };
};

export default useTranslations;
