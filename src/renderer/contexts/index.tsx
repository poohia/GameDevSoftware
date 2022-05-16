import { ReactNode } from 'react';
import { useTranslations, useConstants } from 'renderer/hooks';
import TranslationsContext from './TranslationsContext';
import ConstantsContext from './ConstantsContext';

type GameDevSoftwareProviderProps = {
  children: ReactNode;
};

const GameDevSoftwareProvider: React.FunctionComponent<
  GameDevSoftwareProviderProps
> = (props) => {
  const { children } = props;
  const translationsHook = useTranslations();
  const constants = useConstants();
  return (
    <TranslationsContext.Provider value={{ ...translationsHook }}>
      <ConstantsContext.Provider value={{ constants }}>
        {children}
      </ConstantsContext.Provider>
    </TranslationsContext.Provider>
  );
};

export default GameDevSoftwareProvider;
