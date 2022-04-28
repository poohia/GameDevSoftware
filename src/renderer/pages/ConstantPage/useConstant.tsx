import { useEffect, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { ConstantObject } from 'types';

const useConstant = () => {
  const [constants, setConstants] = useState<ConstantObject>({});
  const { once, sendMessage } = useEvents();
  useEffect(() => {
    sendMessage('load-constants');
    once('load-constants', (args) => {
      setConstants(args);
    });
  }, []);
  console.log(constants);
  return { constants };
};
export default useConstant;
