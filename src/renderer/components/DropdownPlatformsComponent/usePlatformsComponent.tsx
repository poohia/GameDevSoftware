import { useEffect, useMemo, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { DropdownItemProps } from 'semantic-ui-react';
import { PlatformsParams } from 'types';

const usePlatformsComponent = () => {
  const [platforms, setPlatforms] = useState<PlatformsParams | undefined>();
  const { requestMessage } = useEvents();

  const options: DropdownItemProps[] = useMemo(() => {
    const _options: DropdownItemProps[] = [];

    if (platforms?.android) {
      _options.push({
        text: 'Android',
        value: 'android',
        key: 'android',
        icon: 'android',
      });
    }
    if (platforms?.ios) {
      _options.push({ text: 'Ios', value: 'ios', key: 'ios', icon: 'apple' });
    }
    if (platforms?.browser) {
      _options.push({
        text: 'Browser',
        value: 'browser',
        key: 'browser',
        icon: 'chrome',
      });
    }
    if (platforms?.electron) {
      _options.push({
        text: 'Software',
        value: 'electron',
        key: 'electron',
        icon: 'windows',
      });
    }

    return _options;
  }, [platforms]);

  useEffect(() => {
    requestMessage('load-platforms', (args: PlatformsParams) => {
      setPlatforms(args);
    });
  }, []);

  return {
    platforms,
    options,
  };
};

export default usePlatformsComponent;
