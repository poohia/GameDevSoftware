import { Tab } from 'semantic-ui-react';
import { useEffect } from 'react';
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
  FontPage,
  ChatGPTPage,
  ShortcutsFoldersPage,
  PagesModulePage,
  ThemePage,
  CachePage,
  RulesPage,
} from 'renderer/pages';
import {
  AllGameobjectContainerComponent,
  GameobjectContainerComponent,
} from './pages/GameobjectPage/components';
import {
  AllSceneContainerComponent,
  SceneContainerComponent,
} from './pages/ScenePage/components';
import GameDevSoftwareProvider from './contexts';
import { ToastContainer } from 'react-toastify';
import {
  FindInPageComponent,
  TerminalComponent,
  TabsOrderModalComponent,
} from './components';

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
modulesComponent['AllGameobjectContainerComponent'] =
  AllGameobjectContainerComponent;
modulesComponent['ScenePage'] = ScenePage;
modulesComponent['AllSceneContainerComponent'] = AllSceneContainerComponent;
modulesComponent['SceneContainerComponent'] = SceneContainerComponent;
modulesComponent['FontPage'] = FontPage;
modulesComponent['ChatgptPage'] = ChatGPTPage;
modulesComponent['ShortcutsfoldersPage'] = ShortcutsFoldersPage;
modulesComponent['PagesPage'] = PagesModulePage;
modulesComponent['ThemePage'] = ThemePage;
modulesComponent['CachePage'] = CachePage;
modulesComponent['RulesPage'] = RulesPage;

export default function App() {
  const {
    path,
    tabs,
    tabActive,
    onTabChange,
    tabsOrderItems,
    openTabsOrderModal,
    closeTabsOrderModal,
    saveTabsOrder,
  } = useApp();

  useEffect(() => {
    const isVisible = (element: HTMLElement) => {
      const style = window.getComputedStyle(element);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        element.getClientRects().length > 0
      );
    };

    const saveVisibleForm = () => {
      const focusedForm = document.activeElement?.closest('form');
      const forms = Array.from(document.querySelectorAll('form'));
      const form =
        focusedForm instanceof HTMLFormElement && isVisible(focusedForm)
          ? focusedForm
          : forms.find(isVisible);

      if (!form) return false;

      const submitButton = form.querySelector<HTMLElement>(
        'button[type="submit"]:not(:disabled), input[type="submit"]:not(:disabled)'
      );

      if (submitButton) {
        submitButton.click();
      } else {
        form.requestSubmit();
      }

      return true;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        if (saveVisibleForm()) {
          event.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      <ToastContainer />
      <FindInPageComponent />
      <TerminalComponent />
      <TabsOrderModalComponent
        open={openTabsOrderModal}
        tabs={tabsOrderItems}
        onClose={closeTabsOrderModal}
        onAccepted={saveTabsOrder}
      />
    </GameDevSoftwareProvider>
  );
}
