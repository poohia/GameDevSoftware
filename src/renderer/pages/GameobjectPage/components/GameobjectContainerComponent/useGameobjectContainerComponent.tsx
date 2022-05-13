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
      dispatch({ type: 'hide-form' });
      sendMessage('remove-game-object', { id, objectType: gameObjectType });
    },
    [gameObjectType]
  );

  const createGameobject = useCallback(
    () =>
      dispatch({
        type: 'show-create-form',
        data: { ...defaultStateFormReducer },
      }),
    []
  );

  const updateGameobject = useCallback(
    (id: number) => {
      once(`get-game-object-value-${gameObjectType}`, (value) => {
        dispatch({
          type: 'show-update-form',
          data: { key: id.toString(), value },
        });
      });
      sendMessage('get-game-object-value', { id, gameObjectType });
    },
    [gameObjectType]
  );

  const sendCreateGameobject = useCallback((data: any) => {
    dispatch({ type: 'hide-form' });
    sendMessage('create-game-object', data);
  }, []);

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
    updateGameobject,
    sendCreateGameobject,
  };
};

export default useGameobjectContainerComponent;
