import { useEffect, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { PlatformsParams } from 'types';

const usePlatformsComponent = () => {
  const [platforms, setPlatforms] = useState<PlatformsParams | undefined>();
  const { requestMessage } = useEvents();

  useEffect(() => {
    requestMessage('load-platforms', (args: PlatformsParams) => {
      setPlatforms(args);
    });
  }, []);

  return {
    platforms,
  };
};

export default usePlatformsComponent;
