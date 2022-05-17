import { ReactNode } from 'react';
import { useTranslations, useConstants } from 'renderer/hooks';
import TranslationsContext from './TranslationsContext';
import ConstantsContext from './ConstantsContext';
import useAssets from 'renderer/hooks/useAssets';
import AssetsContext from './AssetsContext';
import GameObjectContext from './GameObjectContext';
import useGameObjects from 'renderer/hooks/useGameObjects';

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
  const { gameObjects, findGameObjectsByType } = useGameObjects();
  return (
    <TranslationsContext.Provider value={{ ...translationsHook }}>
      <ConstantsContext.Provider value={{ constants }}>
        <AssetsContext.Provider value={{ assets }}>
          <GameObjectContext.Provider
            value={{ gameObjects, findGameObjectsByType }}
          >
            {children}
          </GameObjectContext.Provider>
        </AssetsContext.Provider>
      </ConstantsContext.Provider>
    </TranslationsContext.Provider>
  );
};

export default GameDevSoftwareProvider;
