import React, { useCallback, useEffect, useState } from 'react';
import { Icon, Menu, Tab } from 'semantic-ui-react';
import i18n from 'translations/i18n';

import { HomePage } from 'renderer/pages';
import useDatabase from 'renderer/hooks/useDatabase';
import { TabActiveType, TabDatabaseType, Tables } from 'types';

export type UseTabsProps = {
  modules: any[];
  tableTabs: Tables;
  tableActiveTab: Tables;
};

const useTabs = ({ modules, tableTabs, tableActiveTab }: UseTabsProps) => {
  const { setItem, getItem } = useDatabase();

  const [tabActive, setTabActive] = useState<TabActiveType>({
    index: 0,
    id: 0,
  });

  const removeTab = useCallback((id: number) => {
    setTabs((_tabs) => {
      setTabActive((_tabActive) => {
        if (id !== _tabActive.id) {
          saveDatabaseTabActive(_tabActive);
          return _tabActive;
        }
        const index = _tabs.map((tab) => tab.id).indexOf(id) - 1;
        const { id: idTab } = _tabs[index];
        _tabActive = { index: index, id: idTab };
        saveDatabaseTabActive(_tabActive);
        return _tabActive;
      });
      const tab = _tabs.find((tab) => tab.id === id);
      tab && removeDatabaseTabs(tab.menuItemKey);
      return Array.from(_tabs.filter((tab) => tab.id !== id));
    });
  }, []);

  const nextTab = useCallback((id: number) => {
    setTabs((_tabs) => {
      setTabActive((_tabActive) => {
        const index = _tabs.map((tab) => tab.id).indexOf(id) + 1;
        if (_tabs[index] === undefined) {
          _tabActive = { index: 0, id: 0 };
          saveDatabaseTabActive(_tabActive);
          return _tabActive;
        }
        const { id: idTab } = _tabs[index];
        _tabActive = { index: index, id: idTab };
        saveDatabaseTabActive(_tabActive);
        return _tabActive;
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
          _tabActive = { index: _tabs.length - 1, id: lastTab.id };
          saveDatabaseTabActive(_tabActive);
          return _tabActive;
        }
        const { id: idTab } = _tabs[index];
        _tabActive = { index: index, id: idTab };
        saveDatabaseTabActive(_tabActive);
        return _tabActive;
      });
      return _tabs;
    });
  }, []);

  const saveDatabaseTabs = (menuItem: string, component: string) => {
    let tabsLocalStorage = getItem<TabDatabaseType[]>(tableTabs);
    if (!tabsLocalStorage) {
      tabsLocalStorage = [];
    }
    setItem(tableTabs, tabsLocalStorage.concat({ menuItem, component }));
  };

  const saveDatabaseTabActive = (tabActive: { index: number; id: number }) => {
    setItem<TabActiveType>(tableActiveTab, tabActive);
  };

  const removeDatabaseTabs = (menuItem: string) => {
    let tabsLocalStorage = getItem<TabDatabaseType[]>(tableTabs);
    if (!tabsLocalStorage) {
      return;
    }
    setItem(
      tableTabs,
      tabsLocalStorage.filter((tab) => tab.menuItem !== menuItem)
    );
  };

  const appendTab = useCallback(
    (
      menuItem: string,
      Component: React.FunctionComponent<any>,
      _saveTabs = true
    ) => {
      setTabs((_tabs) => {
        const id = _tabs[_tabs.length - 1].id + 1;
        const menuItemTranslate = i18n.t(menuItem);
        const key = menuItem;
        const tabFind = _tabs.find((tab) => tab.menuItem.key === key);
        const index = _tabs.length;
        if (tabFind) {
          setTabActive({ index: tabFind.index, id: tabFind.id });
          return _tabs;
        }
        if (_saveTabs) {
          setTabActive({ index, id });
          saveDatabaseTabs(menuItem, Component.name);
        }

        return Array.from(
          _tabs.concat({
            id,
            index,
            menuItemKey: menuItem,
            menuItem: (
              <Menu.Item key={key}>
                {menuItemTranslate}
                <Icon
                  name="close"
                  onClick={(event: Event) => {
                    event.stopPropagation();
                    removeTab(id);
                  }}
                />
              </Menu.Item>
            ),
            pane: (
              <Tab.Pane key={key}>
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
    const _tabActive = { index, id };
    saveDatabaseTabActive(_tabActive);
    setTabActive(_tabActive);
  };

  useEffect(() => {
    const tabsLocalStorage = getItem<TabDatabaseType[]>(tableTabs);

    if (tabsLocalStorage) {
      tabsLocalStorage.forEach((tab) => {
        const { menuItem, component } = tab;

        appendTab(menuItem, modules[component], false);
      });
    }

    const tabActiveLocalStorage = getItem<TabActiveType>(tableActiveTab);
    if (tabActiveLocalStorage) {
      setTabActive(tabActiveLocalStorage);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', listenerChangeTab);
    return () => {
      window.removeEventListener('keydown', listenerChangeTab);
    };
  }, [listenerChangeTab]);

  const [tabs, setTabs] = useState<any[]>([
    {
      id: 0,
      index: 0,
      menuItemKey: 'home',
      menuItem: i18n.t('home'),
      pane: (
        <Tab.Pane key="home" className="game-dev-software-body-tab-content">
          <HomePage appendTab={appendTab} />
        </Tab.Pane>
      ),
    },
  ]);

  return {
    tabs,
    tabActive,
    appendTab,
    onTabChange,
  };
};

export default useTabs;
