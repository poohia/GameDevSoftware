import { ReactNode } from 'react';
import {
  useTranslations,
  useConstants,
  useAssets,
  useGameObjects,
  useScenes,
  useDarkMode,
  useFonts,
  useChatGPT,
} from 'renderer/hooks';
import TranslationsContext from './TranslationsContext';
import ConstantsContext from './ConstantsContext';
import AssetsContext from './AssetsContext';
import GameObjectContext from './GameObjectContext';
import ScenesContext from './ScenesContext';
import DarkModeContext from './DarkModeContext';
import ChatGPTContext from './ChatGPTContext';
import useTerminal from 'renderer/hooks/useTerminal';
import TerminalContext from './TerminalContext';

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
  const chatGPT = useChatGPT();
  const terminal = useTerminal();
  useFonts();
  const { gameObjects, findGameObjectsByType } = useGameObjects();
  const { darkModeActived, toggleDarkMode } = useDarkMode();

  return (
    <DarkModeContext.Provider value={{ darkModeActived, toggleDarkMode }}>
      <TranslationsContext.Provider value={{ ...translationsHook }}>
        <ConstantsContext.Provider value={{ constants }}>
          <AssetsContext.Provider value={{ assets }}>
            <GameObjectContext.Provider
              value={{ gameObjects, findGameObjectsByType }}
            >
              <ScenesContext.Provider value={{ scenes }}>
                <ChatGPTContext.Provider value={{ ...chatGPT }}>
                  <TerminalContext.Provider value={{ ...terminal }}>
                    {children}
                  </TerminalContext.Provider>
                </ChatGPTContext.Provider>
              </ScenesContext.Provider>
            </GameObjectContext.Provider>
          </AssetsContext.Provider>
        </ConstantsContext.Provider>
      </TranslationsContext.Provider>
    </DarkModeContext.Provider>
  );
};

export default GameDevSoftwareProvider;
