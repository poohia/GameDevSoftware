import { useEffect, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { State } from 'renderer/reducers/FormReducer';
import { GameObjectForm } from 'types';

const useAllGameobjectContainerComponent = (props: { stateForm: State }) => {
  const { stateForm } = props;
  const [gameObjectForm, setGameObjectForm] = useState<
    GameObjectForm | undefined | null
  >(undefined);
  const { sendMessage, once } = useEvents();

  useEffect(() => {
    if (stateForm.show && stateForm.value?._type) {
      setGameObjectForm(null);
      once(`get-formulaire-game-object-all`, (args) => {
        setGameObjectForm(args);
      });
      sendMessage(`get-formulaire-game-object-all`, stateForm.value?._type);
    }
  }, [stateForm]);
  return {
    gameObjectForm,
  };
};

export default useAllGameobjectContainerComponent;
