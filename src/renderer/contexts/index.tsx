import { ReactNode } from 'react';
import { useTranslations, useConstants } from 'renderer/hooks';
import TranslationsContext from './TranslationsContext';
import ConstantsContext from './ConstantsContext';
import useAssets from 'renderer/hooks/useAssets';
import AssetsContext from './AssetsContext';

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
  return (
    <TranslationsContext.Provider value={{ ...translationsHook }}>
      <ConstantsContext.Provider value={{ constants }}>
        <AssetsContext.Provider value={{ assets }}>
          {children}
        </AssetsContext.Provider>
      </ConstantsContext.Provider>
    </TranslationsContext.Provider>
  );
};

export default GameDevSoftwareProvider;
