import { useEffect, useState } from 'react';
import { ConstantObject } from 'types';
import useEvents from '../useEvents';

const useConstants = () => {
  const [constants, setConstants] = useState<ConstantObject[]>([]);
  const { requestMessage } = useEvents();
  useEffect(() => {
    requestMessage('load-all-constants', (args) => {
      setConstants(args);
    });
  }, []);

  return constants;
};

export default useConstants;
