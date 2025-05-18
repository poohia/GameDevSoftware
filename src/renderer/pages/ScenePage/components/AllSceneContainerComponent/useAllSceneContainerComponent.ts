import { useEffect, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { State } from 'renderer/reducers/FormReducer';
import { GameObjectForm } from 'types';

const useAllSceneContainerComponent = (props: { stateForm: State }) => {
  const { stateForm } = props;
  const [gameObjectForm, setGameObjectForm] = useState<
    GameObjectForm | undefined | null
  >(undefined);
  const { sendMessage, once } = useEvents();

  useEffect(() => {
    if (stateForm.show && stateForm.value?._type) {
      setGameObjectForm(null);
      once(`get-formulaire-scene-all`, (args) => {
        setGameObjectForm(args);
      });
      sendMessage(`get-formulaire-scene-all`, stateForm.value?._type);
    }
  }, [stateForm]);
  return {
    gameObjectForm,
  };
};

export default useAllSceneContainerComponent;
