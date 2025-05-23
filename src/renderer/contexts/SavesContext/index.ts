import { createContext } from 'react';
import { GameDatabase, GameDatabaseSave } from 'types';

type SavesContextType = {
  saves: GameDatabaseSave[];
  addSave: (game: GameDatabase, title?: string) => void;
  removeSave: (id: number) => void;
};

const SavesContext = createContext<SavesContextType>({
  saves: [],
  addSave: () => {},
  removeSave: () => {},
});

export default SavesContext;
