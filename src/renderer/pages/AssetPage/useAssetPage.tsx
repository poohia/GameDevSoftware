import { useEffect, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { AssetType } from 'types';

const useAssetPage = () => {
  const { requestMessage } = useEvents();
  const [assets, setAssets] = useState<AssetType[]>([]);
  useEffect(() => {
    requestMessage('load-assets', (args) => {
      setAssets(args);
    });
  }, []);
  return { assets };
};

export default useAssetPage;
