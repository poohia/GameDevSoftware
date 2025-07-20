import { useCallback } from 'react';
import { Tables } from 'types';

const useDatabase = () => {
  const setItem = useCallback(<T = string>(key: Tables, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value));
  }, []);

  const getItem = useCallback(<T = string>(key: Tables): T | null => {
    const valueStorage = localStorage.getItem(key);
    if (!valueStorage) {
      return null;
    }
    return JSON.parse(valueStorage);
  }, []);

  const clearLocalStorage = useCallback(() => {
    localStorage.clear();
  }, []);

  return {
    setItem,
    getItem,
    clearLocalStorage,
  };
};

export default useDatabase;
