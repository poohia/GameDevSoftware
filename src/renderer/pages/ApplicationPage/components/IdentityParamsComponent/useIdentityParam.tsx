import { useCallback, useEffect, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { ApplicationIdentityParams } from 'types';

const useIdentityParams = () => {
  const [params, setParams] = useState<ApplicationIdentityParams>();
  const { requestMessage, sendMessage } = useEvents();

  const setParam = useCallback(
    (key: keyof ApplicationIdentityParams, value: string) => {
      setParams((_params) => {
        if (!_params) return _params;
        _params[key] = value;
        return JSON.parse(JSON.stringify(_params));
      });
    },
    []
  );

  const onSubmit = () => {
    console.log(params);
    sendMessage('set-params-identity', params);
  };

  useEffect(() => {
    requestMessage(
      'load-params-identity',
      (args: ApplicationIdentityParams) => {
        setParams(args);
      }
    );
  }, []);

  return { params, setParam, onSubmit };
};

export default useIdentityParams;
