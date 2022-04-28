import { useEffect, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import i18n from 'translations/i18n';

const useApp = () => {
  const [path, setPath] = useState<string | null | undefined>();
  const { on, sendMessage } = useEvents();

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
    const localeDataStorage = localStorage.getItem('locale');
    if (localeDataStorage === null) {
      localStorage.setItem('locale', i18n.locale);
    }
  }, []);

  useEffect(() => {
    const lastDirectory = localStorage.getItem('last-path');
    if (lastDirectory && lastDirectory !== 'undefined') {
      sendMessage('last-path', lastDirectory);
    } else {
      setPath(null);
    }
  }, []);

  useEffect(() => {
    if (path) {
      localStorage.setItem('last-path', path);
    } else if (path === null) {
      sendMessage('select-path');
    }
  }, [path]);

  return {
    path,
  };
};

export default useApp;
