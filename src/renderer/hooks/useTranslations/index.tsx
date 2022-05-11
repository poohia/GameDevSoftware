import { useEffect, useState } from 'react';
import { Translation } from 'types';
import useDatabase from '../useDatabase';
import useEvents from '../useEvents';

const useTranslations = (path: string | null | undefined) => {
  const [translations, setTranslations] = useState<Translation>({});
  const { sendMessage, on } = useEvents();
  const { getItem } = useDatabase();

  useEffect(() => {
    if (!path) return;
    const locale = getItem<string>('locale');
    on('load-all-translations', (args) => {
      setTranslations(args);
    });
    sendMessage('load-all-translations', locale || 'en');
  }, [path]);

  return translations;
};

export default useTranslations;
