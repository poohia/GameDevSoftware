import { useCallback, useEffect, useState } from 'react';
import { GameObject } from 'types';
import useEvents from '../useEvents';

const useGameObjects = () => {
  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
  const { requestMessage } = useEvents();

  const findGameObjectsByType = useCallback(
    (_type: string) => {
      return !!_type.trim()
        ? gameObjects.filter((gameObject) => gameObject._type === _type)
        : gameObjects;
    },
    [gameObjects]
  );

  useEffect(() => {
    requestMessage('load-game-objects', (_gameObjects) =>
      setGameObjects(_gameObjects)
    );
  }, []);

  return {
    gameObjects,
    findGameObjectsByType,
  };
};

export default useGameObjects;
