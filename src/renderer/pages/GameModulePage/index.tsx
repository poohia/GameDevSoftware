import { useMemo } from 'react';
import { GameModuleContext } from 'renderer/contexts';
import useTabs, { UseTabsProps } from 'renderer/hooks/useTabs';
import { Container, Tab } from 'semantic-ui-react';
import { PageProps } from 'types';
import { GameModuleHomePage } from './components';

const GameModulePage = (props: PageProps) => {
  const { title } = props;
  const module = useMemo(() => {
    return title.replace(' Module', '');
  }, [title]);

  const tabOptions: UseTabsProps = useMemo(() => {
    return {
      tableTabs: `tabs-${module}`,
      tableActiveTab: `tab-active-${module}`,
      HomeComponent: GameModuleHomePage,
    };
  }, [module]);
  const { tabs, tabActive, onTabChange } = useTabs(tabOptions);
  return (
    <GameModuleContext.Provider value={{ module }}>
      <Container fluid>
        <Tab
          panes={tabs}
          onTabChange={(_, data) => {
            const { activeIndex, panes } = data;
            onTabChange(
              activeIndex as number,
              // @ts-ignore
              panes?.find((_, i) => i === activeIndex)?.id || 0
            );
          }}
          renderActiveOnly={false}
          activeIndex={tabActive.index}
        />
      </Container>
    </GameModuleContext.Provider>
  );
};

export default GameModulePage;
