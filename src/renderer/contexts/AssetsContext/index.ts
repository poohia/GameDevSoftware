import { createContext } from 'react';
import { AssetType } from 'types';

type AssetsContextType = {
  assets: AssetType[];
};

const AssetsContext = createContext<AssetsContextType>({
  assets: [],
});

export default AssetsContext;
