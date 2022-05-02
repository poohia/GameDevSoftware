import { useTabs } from 'renderer/hooks';
import { Tab } from 'semantic-ui-react';
import useApp from 'renderer/useApp';
import { useMemo } from 'react';
import {
  AssetPage,
  ConstantPage,
  HomePage,
  TranslationPage,
} from 'renderer/pages';
import { UseTabsProps } from 'renderer/hooks/useTabs';

export default function App() {
  const { path } = useApp();
  const tabOptions: UseTabsProps = useMemo(() => {
    const modules: any = [];
    modules['HomePage'] = HomePage;
    modules['TranslationPage'] = TranslationPage;
    modules['ConstantPage'] = ConstantPage;
    modules['AssetPage'] = AssetPage;
    return {
      modules,
      tableTabs: 'tabs',
      tableActiveTab: 'tab-active',
    };
  }, []);
  const { tabs, tabActive, onTabChange } = useTabs(tabOptions);

  if (path === undefined) {
    return <div>Loading....</div>;
  }

  if (path === null) {
    return <div />;
  }

  return (
    <main className="game-dev-software-body">
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
    </main>
  );
}
