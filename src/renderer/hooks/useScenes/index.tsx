import { useEffect, useState } from 'react';
import { SceneObject } from 'types';
import useEvents from '../useEvents';

const useScenes = () => {
  const [scenes, setScenes] = useState<SceneObject[]>([]);
  const { sendMessage, on } = useEvents();

  useEffect(() => {
    sendMessage('load-all-scene');
    on('load-scene', (args) => {
      setScenes(args);
    });
  }, []);

  return scenes;
};

export default useScenes;
