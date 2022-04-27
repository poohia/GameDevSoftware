import { useTabs } from 'renderer/hooks';
import { Tab } from 'semantic-ui-react';
import useApp from 'renderer/useApp';

export default function App() {
  const { path } = useApp();
  const { tabs, tabActive, onTabChange } = useTabs();

  if (path === undefined) {
    return <div>Loading....</div>;
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
        activeIndex={tabActive.index}
      />
    </main>
  );
}
