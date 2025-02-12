import { createContext } from 'react';
import { ShortcutsFolder } from 'types';

type ShortcutsFoldersContextType = {
  shortcutsFolders: ShortcutsFolder[];
  currentShortcutsFolder: ShortcutsFolder | null;
  currentShortcutsFolderID: number | null;
  setCurrentShortcutsFolderID: (id: number | null) => void;
};

const ShortcutsFoldersContext = createContext<ShortcutsFoldersContextType>({
  shortcutsFolders: [],
  currentShortcutsFolder: null,
  currentShortcutsFolderID: null,
  setCurrentShortcutsFolderID: () => {},
});

export default ShortcutsFoldersContext;
