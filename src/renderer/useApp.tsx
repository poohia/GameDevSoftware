import { useEffect, useState } from 'react';
import { useEvents, useDatabase } from 'renderer/hooks';
import i18n from 'translations/i18n';

const useApp = () => {
  const [path, setPath] = useState<string | null | undefined>();
  const { on, sendMessage } = useEvents();
  const { setItem, getItem } = useDatabase();

  useEffect(() => {
    on('path-is-correct', (args: string) => {
      setPath(args);
    });
    on('set-path', (args: string | null) => {
      if (args === null) {
        setPath(undefined);
        setTimeout(() => setPath(null), 100);
      } else {
        setPath(args);
      }
    });
    const localeDataStorage = getItem<string>('locale');
    if (localeDataStorage === null) {
      setItem('locale', i18n.locale);
    }
  }, []);

  useEffect(() => {
    const lastDirectory = getItem<string>('last-path');
    if (lastDirectory !== null) {
      sendMessage('last-path', lastDirectory);
    } else {
      setPath(null);
    }
  }, []);

  useEffect(() => {
    if (path) {
      setItem('last-path', path);
    } else if (path === null) {
      sendMessage('select-path');
    }
  }, [path]);

  return {
    path,
  };
};

export default useApp;
