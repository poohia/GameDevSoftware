import { useEffect, useMemo, useState } from 'react';
import useEvents from '../useEvents';
import useDatabase from '../useDatabase';
import { ShortcutsFolder } from 'types';

const DB_KEY = 'shortcutsFolder';

const useShortcutsFolder = () => {
  const { requestMessage } = useEvents();
  const { getItem, setItem } = useDatabase();

  const [shortcutsFolders, setShortcutsFolders] = useState<ShortcutsFolder[]>(
    []
  );

  const [currentShortcutsFolderID, setCurrentShortcutsFolderID] = useState<
    number[]
  >(() => getItem<number[]>(DB_KEY) ?? []);

  useEffect(() => {
    requestMessage('load-shortcutsfolder', (data: ShortcutsFolder[]) => {
      setShortcutsFolders(data);
    });
  }, [requestMessage]);

  const currentShortcutsFolder = useMemo(() => {
    if (currentShortcutsFolderID.length === 0) return [];
    return shortcutsFolders.filter((f) =>
      currentShortcutsFolderID.includes(f.id)
    );
  }, [shortcutsFolders, currentShortcutsFolderID]);

  useEffect(() => {
    setItem(DB_KEY, currentShortcutsFolderID);
  }, [currentShortcutsFolderID, setItem]);

  return {
    shortcutsFolders,
    currentShortcutsFolder,
    currentShortcutsFolderID,
    setCurrentShortcutsFolderID,
  };
};

export default useShortcutsFolder;
