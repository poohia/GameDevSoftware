import { createContext } from 'react';
import { ConstantObject } from 'types';

type ConstantsContextType = {
  constants: ConstantObject[];
};

const ConstantsContext = createContext<ConstantsContextType>({
  constants: [],
});

export default ConstantsContext;
