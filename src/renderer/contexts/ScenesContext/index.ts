import { SceneObject } from 'types';
import { createContext } from 'react';

type ScenesContextType = {
  scenes: SceneObject[];
};

const ScenesContext = createContext<ScenesContextType>({
  scenes: [],
});

export default ScenesContext;
