import { createContext } from 'react';

type GameModuleContextType = {
  module: string | null;
};
const GameModuleContext = createContext<GameModuleContextType>({
  module: null,
});

export default GameModuleContext;
