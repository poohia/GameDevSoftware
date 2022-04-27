import React, { useCallback, useEffect, useState } from 'react';
import HomePage from 'renderer/pages/HomePage';
import { Icon, Menu, Tab } from 'semantic-ui-react';
import i18n from '../../../translations/i18n';

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
      menuItem: { key: 'home', content: i18n.t('home') },
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
    setTabs((_tabs) => {
      setTabActive((_tabActive) => {
        if (id !== _tabActive.id) {
          return _tabActive;
        }
        const index = _tabs.map((tab) => tab.id).indexOf(id) - 1;
        const { id: idTab } = _tabs[index];
        return { index: index, id: idTab };
      });
      return Array.from(_tabs.filter((tab) => tab.id !== id));
    });
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
    [removeTab]
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
