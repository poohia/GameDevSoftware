import { useTabs } from 'renderer/hooks';
import { Tab } from 'semantic-ui-react';
import useApp from 'renderer/useApp';
import { DefaultPage } from './pages';

export default function App() {
  const { path } = useApp();
  const { tabs, tabActive, onTabChange } = useTabs();

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
          console.log(data);
          const { activeIndex, panes } = data;

          onTabChange(
            activeIndex as number,
            // @ts-ignore
            panes?.find((_, i) => i === activeIndex)?.id || 0
          );
        }}
        activeIndex={tabActive.index}
      />
    </main>
  );
}
