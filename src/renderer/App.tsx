import { Tab } from 'semantic-ui-react';
import useApp from 'renderer/useApp';
import {
  ApplicationPage,
  ViewPage,
  AssetPage,
  ConstantPage,
  HomePage,
  TranslationPage,
  GameModulePage,
  GameobjectPage,
  ScenePage,
  EnvPage,
} from 'renderer/pages';
import { GameobjectContainerComponent } from './pages/GameobjectPage/components';
import { SceneContainerComponent } from './pages/ScenePage/components';
import GameDevSoftwareProvider from './contexts';

export const modulesComponent: any = [];
modulesComponent['HomePage'] = HomePage;
modulesComponent['ApplicationPage'] = ApplicationPage;
modulesComponent['ViewPage'] = ViewPage;
modulesComponent['TranslationPage'] = TranslationPage;
modulesComponent['ConstantPage'] = ConstantPage;
modulesComponent['AssetPage'] = AssetPage;
modulesComponent['EnvPage'] = EnvPage;
modulesComponent['GameModulePage'] = GameModulePage;
modulesComponent['GameobjectPage'] = GameobjectPage;
modulesComponent['GameobjectContainerComponent'] = GameobjectContainerComponent;
modulesComponent['ScenePage'] = ScenePage;
modulesComponent['SceneContainerComponent'] = SceneContainerComponent;

export default function App() {
  const { path, tabs, tabActive, onTabChange } = useApp();

  if (path === undefined) {
    return <div>Loading....</div>;
  }

  if (path === null) {
    return <div />;
  }

  return (
    <GameDevSoftwareProvider>
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
    </GameDevSoftwareProvider>
  );
}
