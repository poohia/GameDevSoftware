import { createContext } from 'react';
import { GameObject } from 'types';

type GameObjectContextType = {
  gameObjects: GameObject[];
  findGameObjectsByType: (_type: string) => GameObject[];
};

const GameObjectContext = createContext<GameObjectContextType>({
  gameObjects: [],
  findGameObjectsByType: () => {
    return [];
  },
});

export default GameObjectContext;
