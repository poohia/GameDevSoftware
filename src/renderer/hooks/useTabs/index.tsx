import React, { useCallback, useEffect, useState } from 'react';
import HomePage from 'renderer/pages/HomePage';
import { Icon, Menu, Tab } from 'semantic-ui-react';

const useTabs = () => {
  const [tabs, setTabs] = useState<
    {
      id: number;
      menuItem: any;
      render?: () => React.ReactNode;
    }[]
  >([
    {
      id: 0,
      menuItem: { key: 'home', icon: 'users', content: 'Home' },
      render: () => (
        <Tab.Pane className="game-dev-software-body-tab-content">
          <HomePage appendTab={appendTab} id={0} />
        </Tab.Pane>
      ),
    },
  ]);

  const [tabActive, setTabActive] = useState<{
    index: number;
    id: number;
  }>({
    index: 0,
    id: 0,
  });

  const removeTab = useCallback((id: number) => {
    setTabs((t) => Array.from(t?.filter((tab) => tab.id !== id)));
    setTabActive({ index: 0, id: 0 });
  }, []);

  const appendTab = useCallback(
    (menuItem: string, Component: React.FunctionComponent<any>) => {
      setTabs((t) => {
        const id = t[t.length - 1].id + 1;
        return Array.from(
          t.concat({
            id,
            menuItem: (
              <Menu.Item
                key={`${menuItem.toLocaleLowerCase().replace(' ', '-')}-${id}`}
              >
                {menuItem}
                <Icon
                  name="close"
                  onClick={(event: Event) => {
                    event.stopPropagation();
                    removeTab(id);
                  }}
                />
              </Menu.Item>
            ),
            render: () => (
              <Tab.Pane>
                <Component appendTab={appendTab} id={tabActive.id} />
              </Tab.Pane>
            ),
          })
        );
      });
    },
    []
  );

  const listenerChangeTab = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();
      const { id } = tabActive;
      if ((e.metaKey || e.ctrlKey) && e.code === 'KeyZ' && id !== 0) {
        removeTab(id);
      }
    },
    [tabActive]
  );

  const onTabChange = (index: number, id: number) => {
    document.removeEventListener('keydown', listenerChangeTab);
    setTabActive({ index, id });
  };

  useEffect(() => {
    window.addEventListener('keydown', listenerChangeTab);
    return () => {
      window.removeEventListener('keydown', listenerChangeTab);
    };
  }, [listenerChangeTab]);

  return {
    tabs,
    tabActive,
    appendTab,
    onTabChange,
  };
};

export default useTabs;
