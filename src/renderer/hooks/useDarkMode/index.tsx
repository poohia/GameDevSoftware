import { useCallback, useEffect, useState } from 'react';
import useDatabase from '../useDatabase';
import useEvents from '../useEvents';

const useDarkMode = () => {
  const [darkModeActived, setDarkModeActived] = useState<boolean>(true);
  const { setItem, getItem } = useDatabase();
  const { sendMessage } = useEvents();

  const toggleDarkMode = useCallback(() => {
    setItem<boolean>('dark-mode', !darkModeActived);
    setDarkModeActived(!darkModeActived);
  }, [darkModeActived]);

  const toggleClassBody = useCallback(
    (_darkModeActived = darkModeActived) => {
      if (_darkModeActived) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    },
    [darkModeActived]
  );

  useEffect(() => {
    const _darkModeActivated = getItem<boolean>('dark-mode');
    toggleClassBody(!!_darkModeActivated);
    setDarkModeActived(!!_darkModeActivated);
  }, []);

  useEffect(() => {
    toggleClassBody();
    sendMessage('switch-theme', darkModeActived ? 'dark' : 'light');
  }, [darkModeActived]);

  return {
    darkModeActived,
    toggleDarkMode,
  };
};

export default useDarkMode;
