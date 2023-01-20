import { useEffect, useState } from 'react';
import { Translation } from 'types';
import useDatabase from '../useDatabase';
import useEvents from '../useEvents';

const useTranslations = () => {
  const [gameLocale, setGameLocale] = useState<string>('en');
  const [translations, setTranslations] = useState<Translation>({});
  const { sendMessage, on } = useEvents();
  const { getItem } = useDatabase();

  useEffect(() => {
    sendMessage('load-all-translations', gameLocale);
  }, [gameLocale]);

  useEffect(() => {
    setGameLocale(getItem('game-locale') || 'en');
  }, [getItem]);

  useEffect(() => {
    on('load-all-translations', (args) => {
      console.log('🚀 ~ file: index.tsx:22 ~ on ~ args', args);
      setTranslations(args);
    });
  }, []);

  return { translations, gameLocale, setGameLocale };
};

export default useTranslations;
