import { useEffect, useState } from 'react';
import { AssetType } from 'types';
import useEvents from '../useEvents';

const useAssets = () => {
  const [assets, setAssets] = useState<AssetType[]>([]);
  const { requestMessage } = useEvents();
  useEffect(() => {
    requestMessage('load-assets', (args) => {
      setAssets(args);
    });
  }, []);

  return assets;
};

export default useAssets;
