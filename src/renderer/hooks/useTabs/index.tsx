import React, { useCallback, useEffect, useState } from 'react';
import HomePage from 'renderer/pages/HomePage';
import { Icon, Menu, Tab } from 'semantic-ui-react';
import i18n from '../../../translations/i18n';

const useTabs = () => {
  const [tabs, setTabs] = useState<
    {
      id: number;
      index: number;
      menuItem: any;
      render?: () => React.ReactNode;
    }[]
  >([
    {
      id: 0,
      index: 0,
      menuItem: { key: 'home', content: i18n.t('home') },
      render: () => (
        <Tab.Pane className="game-dev-software-body-tab-content">
          <HomePage appendTab={appendTab} />
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

  const nextTab = useCallback((id: number) => {
    setTabs((_tabs) => {
      setTabActive((_tabActive) => {
        const index = _tabs.map((tab) => tab.id).indexOf(id) + 1;
        if (_tabs[index] === undefined) {
          return { index: 0, id: 0 };
        }
        const { id: idTab } = _tabs[index];
        return { index: index, id: idTab };
      });
      return _tabs;
    });
  }, []);

  const prevTab = useCallback((id: number) => {
    setTabs((_tabs) => {
      setTabActive((_tabActive) => {
        const index = _tabs.map((tab) => tab.id).indexOf(id) + -1;
        if (_tabs[index] === undefined) {
          const lastTab = _tabs[_tabs.length - 1];
          return { index: _tabs.length - 1, id: lastTab.id };
        }
        const { id: idTab } = _tabs[index];
        return { index: index, id: idTab };
      });
      return _tabs;
    });
  }, []);

  const appendTab = useCallback(
    (menuItem: string, Component: React.FunctionComponent<any>) => {
      setTabs((_tabs) => {
        const id = _tabs[_tabs.length - 1].id + 1;
        const key = `${menuItem.toLocaleLowerCase().replace(' ', '-')}`;
        const tabFind = _tabs.find((tab) => tab.menuItem.key === key);
        const index = _tabs.length;
        if (tabFind) {
          setTabActive({ index: tabFind.index, id: tabFind.id });
          return _tabs;
        }
        setTabActive({ index, id });
        return Array.from(
          _tabs.concat({
            id,
            index,
            menuItem: (
              <Menu.Item key={key}>
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
      const { metaKey, ctrlKey, code, shiftKey } = e;
      const { id } = tabActive;
      if ((metaKey || ctrlKey) && code === 'KeyZ' && id !== 0) {
        e.preventDefault();
        removeTab(id);
        return;
      }
      if (ctrlKey && shiftKey && code === 'Tab') {
        prevTab(id);
        return;
      }
      if (ctrlKey && code === 'Tab') {
        nextTab(id);
        return;
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
