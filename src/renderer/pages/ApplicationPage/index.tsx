import { useEffect } from 'react';
import { useEvents } from 'renderer/hooks';

const ApplicationPage = () => {
  const { requestMessage } = useEvents();
  useEffect(() => {
    requestMessage('load-params-1', (args) => {
      console.log(args);
    });
  }, []);
  return <div>hello world</div>;
};

export default ApplicationPage;
