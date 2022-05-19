import { useCallback, useEffect, useState } from 'react';
import useDatabase from '../useDatabase';

const useDarkMode = () => {
  const [darkModeActived, setDarkModeActived] = useState<boolean>(true);
  const { setItem, getItem } = useDatabase();

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
  }, [darkModeActived]);

  return {
    darkModeActived,
    toggleDarkMode,
  };
};

export default useDarkMode;
