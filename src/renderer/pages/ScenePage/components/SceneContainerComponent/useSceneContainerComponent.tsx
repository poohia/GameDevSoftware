import { useCallback, useEffect, useReducer, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { defaultStateFormReducer, FormReducer } from 'renderer/reducers';
import { SceneObjectForm, PageProps, SceneObject } from 'types';

const useSceneContainerComponent = (props: PageProps) => {
  const [loadingForm, setLoadingForm] = useState<boolean>(false);
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

  const createGameobject = useCallback(() => {
    dispatch({
      type: 'hide-form',
    });
    setTimeout(() => {
      dispatch({
        type: 'show-create-form',
        data: { ...defaultStateFormReducer },
      });
    }, 100);
  }, []);

  const updateGameobject = useCallback(
    (id: number) => {
      dispatch({
        type: 'hide-form',
      });
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
        if (!data._id) {
          dispatch({ type: 'hide-form' });
        } else {
          setLoadingForm(true);
        }
        sendMessage('create-scene', {
          ...data,
          _module: sceneObjectForm.module,
        });
      }
    },
    [sceneObjectForm]
  );

  const duplicateScene = useCallback(
    (title: string) => {
      if (!stateForm.value?._id) return;
      sendMessage('duplicate-scene', {
        id: stateForm.value._id,
        title,
        sceneType,
      });
    },
    [sceneType, stateForm.value]
  );

  const openFile = useCallback(
    () => sendMessage('open-scene-file', stateForm.key),
    [stateForm]
  );

  const openFileInFolder = useCallback(
    () => sendMessage('open-scene-in-folder', stateForm.key),
    [stateForm]
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

  useEffect(() => {
    if (loadingForm) {
      setTimeout(() => setLoadingForm(false), 500);
    }
  }, [loadingForm]);

  return {
    scenes,
    gameObjectForm: sceneObjectForm,
    stateForm,
    loadingForm,
    removeGameObject,
    createGameobject,
    updateGameobject,
    sendCreateGameobject,
    duplicateScene,
    closeForm: () => dispatch({ type: 'hide-form' }),
    openFile,
    openFileInFolder,
  };
};

export default useSceneContainerComponent;
