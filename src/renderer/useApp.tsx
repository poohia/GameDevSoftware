import { useEffect, useState } from 'react';
import { useEvents } from 'renderer/hooks';

const useApp = () => {
  const [path, setPath] = useState<string | null | undefined>();
  const { on, sendMessage } = useEvents();

  useEffect(() => {
    on('path-is-correct', (args: string) => {
      console.log(args);
      setPath(args);
    });
  }, []);

  useEffect(() => {
    const lastDirectory = localStorage.getItem('last-path');
    if (lastDirectory && lastDirectory !== 'undefined') {
      sendMessage('last-path', lastDirectory);
    } else {
      setPath(null);
    }
  }, []);

  useEffect(() => {
    if (path) {
      localStorage.setItem('last-path', path);
    }
  }, [path]);

  return {
    path,
  };
};

export default useApp;
