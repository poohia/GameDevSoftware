import { useEffect, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { ApplicationImageParams } from 'types';

const useImagesParamsComponent = () => {
  const [imagesParams, setImagesParams] = useState<
    ApplicationImageParams | undefined
  >();
  const { requestMessage, sendMessage } = useEvents();

  const replaceImage = (target: keyof ApplicationImageParams) => {
    sendMessage('replace-params-image', target);
  };

  useEffect(() => {
    requestMessage('load-params-image', (args: ApplicationImageParams) => {
      setImagesParams(args);
    });
  }, []);

  return { imagesParams, replaceImage };
};

export default useImagesParamsComponent;
