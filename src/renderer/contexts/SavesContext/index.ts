import { createContext } from 'react';
import { GameDatabase, GameDatabaseSave } from 'types';

type SavesContextType = {
  saves: GameDatabaseSave[];
  addSave: (game: GameDatabase, title?: string) => void;
  eraseSave: (save: GameDatabaseSave) => void;
  removeSave: (id: number) => void;
  reorderSaves: (orderedIds: number[]) => void;
};

const SavesContext = createContext<SavesContextType>({
  saves: [],
  addSave: () => {},
  eraseSave: () => {},
  removeSave: () => {},
  reorderSaves: () => {},
});

export default SavesContext;
