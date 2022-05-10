import { useTabs } from 'renderer/hooks';
import { Tab } from 'semantic-ui-react';
import useApp from 'renderer/useApp';
import { useMemo } from 'react';
import {
  ApplicationPage,
  AssetPage,
  ConstantPage,
  HomePage,
  TranslationPage,
  GameModulePage,
} from 'renderer/pages';
import { UseTabsProps } from 'renderer/hooks/useTabs';

export const modulesComponent: any = [];
modulesComponent['HomePage'] = HomePage;
modulesComponent['ApplicationPage'] = ApplicationPage;
modulesComponent['TranslationPage'] = TranslationPage;
modulesComponent['ConstantPage'] = ConstantPage;
modulesComponent['AssetPage'] = AssetPage;
modulesComponent['GameModulePage'] = GameModulePage;

export default function App() {
  const { path } = useApp();
  const tabOptions: UseTabsProps = useMemo(() => {
    return {
      modules: modulesComponent,
      tableTabs: 'tabs',
      tableActiveTab: 'tab-active',
      activeKeyboardControl: true,
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
