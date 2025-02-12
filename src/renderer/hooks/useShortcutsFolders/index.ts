import { useEffect, useState } from 'react';
import useEvents from '../useEvents';
import { ShortcutsFolder } from 'types';
import useDatabase from '../useDatabase';

const useShortcutsFolders = () => {
  const { requestMessage } = useEvents();
  const { getItem, setItem } = useDatabase();
  const [shortcutsFolders, setShortcutsFolders] = useState<
    ShortcutsFolder[] | null
  >(null);

  const [currentShortcutsFolderID, setCurrentShortcutsFolderID] = useState<
    number | null
  >(() => {
    return getItem<number>('shortcutsFolder') || null;
  });

  const [currentShortcutsFolder, setCurrentShortcutsFolder] =
    useState<ShortcutsFolder | null>(null);

  useEffect(() => {
    requestMessage('load-shortcutsfolder', (data: ShortcutsFolder[]) => {
      setShortcutsFolders(data);
    });
  }, []);

  useEffect(() => {
    if (!shortcutsFolders) return;
    const folderFind = shortcutsFolders.find(
      (folder) => folder.id === currentShortcutsFolderID
    );
    if (folderFind) {
      setItem('shortcutsFolder', currentShortcutsFolderID);
      setCurrentShortcutsFolder(folderFind);
    } else {
      setCurrentShortcutsFolder(null);
      setItem('shortcutsFolder', null);
    }
  }, [currentShortcutsFolderID, shortcutsFolders]);

  return {
    shortcutsFolders: shortcutsFolders || [],
    currentShortcutsFolder,
    currentShortcutsFolderID,
    setCurrentShortcutsFolderID,
  };
};

export default useShortcutsFolders;
