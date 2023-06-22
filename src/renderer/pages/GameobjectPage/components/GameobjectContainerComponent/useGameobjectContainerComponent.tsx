import { useCallback, useEffect, useReducer, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { defaultStateFormReducer, FormReducer } from 'renderer/reducers';
import { GameObject, GameObjectForm, PageProps } from 'types';

const useGameobjectContainerComponent = (props: PageProps) => {
  const [loadingForm, setLoadingForm] = useState<boolean>(false);
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
    (id: number) => {
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
      // @ts-ignore
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
    setLoadingForm(true);
    sendMessage('create-game-object', data);
  }, []);

  const openFile = useCallback(
    () => sendMessage('open-gameobject-file', stateForm.key),
    [stateForm]
  );

  useEffect(() => {
    sendMessage('load-game-objects', gameObjectType);
    sendMessage('get-formulaire-game-object', gameObjectType);
    // @ts-ignore
    on(`load-game-objects-${gameObjectType}`, (args) => {
      setGameObjects(args);
    });
    // @ts-ignore
    once(`get-formulaire-game-object-${gameObjectType}`, (args) => {
      setGameObjectForm(args);
    });
  }, [gameObjectType]);

  useEffect(() => {
    if (loadingForm) {
      setTimeout(() => setLoadingForm(false), 500);
    }
  }, [loadingForm]);

  return {
    gameObjects,
    gameObjectForm,
    stateForm,
    loadingForm,
    removeGameObject,
    createGameobject,
    updateGameobject,
    sendCreateGameobject,
    closeForm: () => dispatch({ type: 'hide-form' }),
    openFile,
  };
};

export default useGameobjectContainerComponent;
