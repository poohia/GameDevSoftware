import { useEffect } from 'react';
import { useEvents } from 'renderer/hooks';

const GameobjectPage = () => {
  const { requestMessage } = useEvents();
  useEffect(() => {
    requestMessage('load-game-object-types', (args) => {
      console.log(args);
    });
  }, []);
  return <div>Hello world</div>;
};

export default GameobjectPage;
