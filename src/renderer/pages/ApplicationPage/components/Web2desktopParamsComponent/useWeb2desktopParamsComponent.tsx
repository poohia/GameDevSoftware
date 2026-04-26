import { useCallback, useEffect, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { ApplicationWeb2DesktopParams } from 'types';

const useWeb2desktopParamsComponent = () => {
  const [params, setParams] = useState<ApplicationWeb2DesktopParams>();
  const { requestMessage, sendMessage } = useEvents();

  const setParam = useCallback(
    <K extends keyof ApplicationWeb2DesktopParams>(
      key: K,
      value: ApplicationWeb2DesktopParams[K]
    ) => {
      setParams((_params) => {
        if (!_params) return _params;
        return { ..._params, [key]: value };
      });
    },
    []
  );

  const onSubmit = useCallback(() => {
    sendMessage('set-web2desktop-params', params);
  }, [params, sendMessage]);

  useEffect(() => {
    requestMessage(
      'load-web2desktop-params',
      (args: ApplicationWeb2DesktopParams) => {
        setParams(args);
      }
    );
  }, []);

  return {
    params,
    setParam,
    onSubmit,
  };
};

export default useWeb2desktopParamsComponent;
