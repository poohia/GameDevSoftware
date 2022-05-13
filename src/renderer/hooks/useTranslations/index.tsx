import { useEffect, useState } from 'react';
import { Translation } from 'types';
import useDatabase from '../useDatabase';
import useEvents from '../useEvents';

const useTranslations = (path: string | null | undefined) => {
  const [gameLocale, setGameLocale] = useState<string>('en');
  const [translations, setTranslations] = useState<Translation>({});
  const { sendMessage, on } = useEvents();
  const { getItem } = useDatabase();

  useEffect(() => {
    if (!path) return;
    sendMessage('load-all-translations', gameLocale);
  }, [path, gameLocale]);

  useEffect(() => {
    setGameLocale(getItem('game-locale') || 'en');
  }, [getItem]);

  useEffect(() => {
    on('load-all-translations', (args) => {
      setTranslations(args);
    });
  }, []);

  return { translations, gameLocale, setGameLocale };
};

export default useTranslations;
