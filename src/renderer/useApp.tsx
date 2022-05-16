import { useEffect, useMemo, useState } from 'react';
import { useEvents, useDatabase, useTranslations } from 'renderer/hooks';
import i18n from 'translations/i18n';
import useTabs, { UseTabsProps } from './hooks/useTabs';

const useApp = () => {
  const [path, setPath] = useState<string | null | undefined>();
  const { on, sendMessage } = useEvents();
  const { setItem, getItem } = useDatabase();

  const tabOptions: UseTabsProps = useMemo(() => {
    return {
      tableTabs: 'tabs',
      tableActiveTab: 'tab-active',
      activeKeyboardControl: true,
    };
  }, []);
  const { tabs, tabActive, onTabChange } = useTabs(tabOptions);

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
    tabs,
    tabActive,
    onTabChange,
  };
};

export default useApp;
