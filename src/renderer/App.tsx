import { Tab } from 'semantic-ui-react';
import useApp from 'renderer/useApp';
import {
  ApplicationPage,
  AssetPage,
  ConstantPage,
  HomePage,
  TranslationPage,
  GameModulePage,
  GameobjectPage,
} from 'renderer/pages';
import { GameobjectContainerComponent } from './pages/GameobjectPage/components';
import TranslationsContext from './contexts/TranslationsContext';

export const modulesComponent: any = [];
modulesComponent['HomePage'] = HomePage;
modulesComponent['ApplicationPage'] = ApplicationPage;
modulesComponent['TranslationPage'] = TranslationPage;
modulesComponent['ConstantPage'] = ConstantPage;
modulesComponent['AssetPage'] = AssetPage;
modulesComponent['GameModulePage'] = GameModulePage;
modulesComponent['GameobjectPage'] = GameobjectPage;
modulesComponent['GameobjectContainerComponent'] = GameobjectContainerComponent;

export default function App() {
  const { path, translationsHook, tabs, tabActive, onTabChange } = useApp();

  if (path === undefined) {
    return <div>Loading....</div>;
  }

  if (path === null) {
    return <div />;
  }

  return (
    <TranslationsContext.Provider value={{ ...translationsHook }}>
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
    </TranslationsContext.Provider>
  );
}
