import { useCallback, useEffect, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { ApplicationImageParams, SplashscreenType } from 'types';

const useImagesParamsComponent = () => {
  const [imagesParams, setImagesParams] = useState<
    ApplicationImageParams | undefined
  >();
  const [splashscreenInformation, setSplashscreenInformation] = useState<
    SplashscreenType | undefined
  >();
  const { requestMessage, sendMessage } = useEvents();

  const replaceImage = (target: keyof ApplicationImageParams) => {
    sendMessage('replace-params-image', target);
  };

  const modifySlogan = useCallback(
    (brandSlogan: string) => {
      setSplashscreenInformation(
        splashscreenInformation
          ? { ...splashscreenInformation, brandSlogan }
          : undefined
      );
    },
    [splashscreenInformation]
  );

  const updateSlogan = useCallback(() => {
    if (typeof splashscreenInformation !== 'undefined') {
      sendMessage(
        'splashscreen-modify-slogan',
        splashscreenInformation?.brandSlogan
      );
    }
  }, [splashscreenInformation]);

  const replaceBrandImage = useCallback(() => {
    sendMessage('splashscreen-replace-brand-image');
  }, []);

  const replacePromotionVideo = useCallback((asset: string) => {
    sendMessage('splashscreen-replace-promotion-video', asset);
  }, []);

  useEffect(() => {
    requestMessage('load-params-image', (args: ApplicationImageParams) => {
      setImagesParams(args);
    });
  }, []);

  useEffect(() => {
    requestMessage(
      'load-splashscreen-informations',
      (args: SplashscreenType) => {
        setSplashscreenInformation(args);
      }
    );
  }, []);

  return {
    imagesParams,
    splashscreenInformation,
    replaceImage,
    modifySlogan,
    updateSlogan,
    replaceBrandImage,
    replacePromotionVideo,
  };
};

export default useImagesParamsComponent;
