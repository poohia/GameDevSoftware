import React, { useEffect, useState } from 'react';
import { Button } from 'semantic-ui-react';
import { useEvents } from 'renderer/hooks';

const DefaultPage: React.FunctionComponent = () => {
  const [path, setPath] = useState<string | null>(null);
  const { sendMessage, once } = useEvents();
  const openFolder = () => {
    sendMessage('select-path');
    once('set-path', (args: string | null) => {
      setPath(args);
    });
  };

  useEffect(() => {
    if (path) {
      localStorage.setItem('last-path', path);
    }
  }, [path]);

  return (
    <div>
      <Button type="button" onClick={openFolder}>
        Folder
      </Button>
    </div>
  );
};

export default DefaultPage;
