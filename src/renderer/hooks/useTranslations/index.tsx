import { useEffect, useState } from 'react';
import { TranslationObject } from 'types';
import useDatabase from '../useDatabase';
import useEvents from '../useEvents';

const useTranslations = () => {
  const { setItem, getItem } = useDatabase();
  const [gameLocale, setGameLocale] = useState<string>(
    getItem('game-locale') || 'en'
  );
  const [translations, setTranslations] = useState<TranslationObject>({});
  const { sendMessage, on } = useEvents();

  useEffect(() => {
    setItem('game-locale', gameLocale);
    sendMessage('load-translations', gameLocale);
  }, [gameLocale]);

  useEffect(() => {
    on('load-translations', (args) => {
      setTranslations(args);
    });
  }, []);

  return { translations, gameLocale, setTranslations, setGameLocale };
};

export default useTranslations;
