import { useCallback, useEffect, useReducer, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { defaultStateFormReducer, FormReducer } from 'renderer/reducers';
import { GameObject, GameObjectForm, PageProps } from 'types';

const useGameobjectContainerComponent = (props: PageProps) => {
  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
  const [gameObjectForm, setGameObjectForm] = useState<
    GameObjectForm | undefined
  >(undefined);

  const { title: gameObjectType } = props;
  const { sendMessage, on, once } = useEvents();

  const [stateForm, dispatch] = useReducer(
    FormReducer,
    defaultStateFormReducer
  );

  const removeGameObject = useCallback(
    (id: string) => {
      sendMessage('remove-game-object', { id, objectType: gameObjectType });
    },
    [gameObjectType]
  );

  const createGameobject = useCallback(
    () =>
      dispatch({
        type: 'show-create-form',
        data: defaultStateFormReducer,
      }),
    []
  );

  useEffect(() => {
    sendMessage('load-game-objects', gameObjectType);
    sendMessage('get-formulaire-game-object', gameObjectType);
    on(`load-game-objects-${gameObjectType}`, (args) => {
      setGameObjects(args);
    });
    once(`get-formulaire-game-object-${gameObjectType}`, (args) => {
      setGameObjectForm(args);
    });
  }, [gameObjectType]);

  return {
    gameObjects,
    gameObjectForm,
    stateForm,
    removeGameObject,
    createGameobject,
  };
};

export default useGameobjectContainerComponent;
