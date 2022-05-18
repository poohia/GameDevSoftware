import { useCallback, useEffect, useReducer, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { defaultStateFormReducer, FormReducer } from 'renderer/reducers';
import { GameObjectForm, PageProps, SceneObject } from 'types';

const useSceneContainerComponent = (props: PageProps) => {
  const [scenes, setScenes] = useState<SceneObject[]>([]);
  const [gameObjectForm, setGameObjectForm] = useState<
    GameObjectForm | undefined
  >(undefined);

  const { title: sceneType } = props;
  const { sendMessage, on, once } = useEvents();

  const [stateForm, dispatch] = useReducer(
    FormReducer,
    defaultStateFormReducer
  );

  const removeGameObject = useCallback(
    (id: number) => {
      dispatch({ type: 'hide-form' });
      sendMessage('remove-scene', { id, sceneType });
    },
    [sceneType]
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
      once(`get-scene-value-${sceneType}`, (value) => {
        dispatch({
          type: 'show-update-form',
          data: { key: id.toString(), value },
        });
      });
      sendMessage('get-scene-value', { id, sceneType });
    },
    [sceneType]
  );

  const sendCreateGameobject = useCallback((data: any) => {
    dispatch({ type: 'hide-form' });
    sendMessage('create-scene', data);
  }, []);

  useEffect(() => {
    sendMessage('load-scenes', sceneType);
    sendMessage('get-formulaire-scene', sceneType);
    // @ts-ignore
    on(`load-scene-${sceneType}`, (args) => {
      setScenes(args);
    });
    // @ts-ignore
    once(`get-formulaire-scene-${sceneType}`, (args) => {
      setGameObjectForm(args);
    });
  }, [sceneType]);

  return {
    scenes,
    gameObjectForm,
    stateForm,
    removeGameObject,
    createGameobject,
    updateGameobject,
    sendCreateGameobject,
  };
};

export default useSceneContainerComponent;
