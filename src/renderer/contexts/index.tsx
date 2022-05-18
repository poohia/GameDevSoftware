import { ReactNode } from 'react';
import {
  useTranslations,
  useConstants,
  useAssets,
  useGameObjects,
  useScenes,
} from 'renderer/hooks';
import TranslationsContext from './TranslationsContext';
import ConstantsContext from './ConstantsContext';
import AssetsContext from './AssetsContext';
import GameObjectContext from './GameObjectContext';
import ScenesContext from './ScenesContext';

type GameDevSoftwareProviderProps = {
  children: ReactNode;
};

const GameDevSoftwareProvider: React.FunctionComponent<
  GameDevSoftwareProviderProps
> = (props) => {
  const { children } = props;
  const translationsHook = useTranslations();
  const constants = useConstants();
  const assets = useAssets();
  const scenes = useScenes();
  const { gameObjects, findGameObjectsByType } = useGameObjects();
  return (
    <TranslationsContext.Provider value={{ ...translationsHook }}>
      <ConstantsContext.Provider value={{ constants }}>
        <AssetsContext.Provider value={{ assets }}>
          <GameObjectContext.Provider
            value={{ gameObjects, findGameObjectsByType }}
          >
            <ScenesContext.Provider value={{ scenes }}>
              {children}
            </ScenesContext.Provider>
          </GameObjectContext.Provider>
        </AssetsContext.Provider>
      </ConstantsContext.Provider>
    </TranslationsContext.Provider>
  );
};

export default GameDevSoftwareProvider;
