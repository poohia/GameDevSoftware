import { FC, useCallback, useEffect } from 'react';
import { Tab } from 'semantic-ui-react';
import { ModuleComponentProps } from 'types';

const ModuleComponent: FC<
  Pick<ModuleComponentProps, 'indexActive' | 'removeCurrentTab'>
> = ({ children, indexActive, removeCurrentTab }) => {
  const listenerChangeTab = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();
      if ((e.metaKey || e.ctrlKey) && e.code === 'KeyZ' && indexActive !== 0) {
        removeCurrentTab();
      }
    },
    [indexActive]
  );
  console.log(indexActive);
  useEffect(() => {
    // document.addEventListener('keydown', listenerChangeTab);
  }, [indexActive]);
  return <Tab.Pane>{children}</Tab.Pane>;
};

export default ModuleComponent;
