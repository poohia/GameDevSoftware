import { useCallback, useEffect, useReducer, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { defaultStateFormReducer, FormReducer } from 'renderer/reducers';
import { SceneObjectForm, PageProps, SceneObject } from 'types';

const useSceneContainerComponent = (props: PageProps) => {
  const [scenes, setScenes] = useState<SceneObject[]>([]);
  const [sceneObjectForm, setSceneObjectForm] = useState<
    SceneObjectForm | undefined
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

  const sendCreateGameobject = useCallback(
    (data: any) => {
      if (sceneObjectForm) {
        dispatch({ type: 'hide-form' });
        sendMessage('create-scene', {
          ...data,
          _module: sceneObjectForm.module,
        });
      }
    },
    [sceneObjectForm]
  );

  useEffect(() => {
    sendMessage('load-scenes', sceneType);
    sendMessage('get-formulaire-scene', sceneType);
    // @ts-ignore
    on(`load-scenes-${sceneType}`, (args) => {
      setScenes(args);
    });
    // @ts-ignore
    once(`get-formulaire-scene-${sceneType}`, (args) => {
      setSceneObjectForm(args);
    });
  }, [sceneType]);

  return {
    scenes,
    gameObjectForm: sceneObjectForm,
    stateForm,
    removeGameObject,
    createGameobject,
    updateGameobject,
    sendCreateGameobject,
  };
};

export default useSceneContainerComponent;
