import { useMemo } from 'react';
import { useTabs } from 'renderer/hooks';
import { UseTabsProps } from 'renderer/hooks/useTabs';
import { Container, Tab } from 'semantic-ui-react';
import { SceneHomeContainer } from './components';

const ScenePage = () => {
  const tabOptions: UseTabsProps = useMemo(() => {
    return {
      tableTabs: `tabs-scene`,
      tableActiveTab: `tab-active-scene`,
      HomeComponent: SceneHomeContainer,
    };
  }, []);
  const { tabs, tabActive, onTabChange } = useTabs(tabOptions);

  return (
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
  );
};

export default ScenePage;
