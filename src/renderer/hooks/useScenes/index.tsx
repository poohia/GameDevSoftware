import { useEffect, useState } from 'react';
import { SceneObject } from 'types';
import useEvents from '../useEvents';

const useScenes = () => {
  const [scenes, setScenes] = useState<SceneObject[]>([]);
  const { requestMessage } = useEvents();

  useEffect(() => {
    requestMessage('load-scenes', (args) => {
      setScenes(args);
    });
  }, []);

  return scenes;
};

export default useScenes;
