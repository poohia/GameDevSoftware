import React, { useCallback, useEffect, useState } from 'react';
import { Icon, Menu, Tab } from 'semantic-ui-react';
import i18n from 'translations/i18n';

import { HomePage } from 'renderer/pages';
import useDatabase from 'renderer/hooks/useDatabase';
import { PageProps, TabActiveType, TabDatabaseType, Tables } from 'types';
import TransComponent from 'renderer/components/TransComponent';
import { modulesComponent } from 'renderer/App';
import { titleCase } from 'title-case';

export type UseTabsProps = {
  tableTabs: Tables;
  tableActiveTab: Tables;
  HomeComponent?: React.FunctionComponent<any>;
  activeKeyboardControl?: boolean;
};

const useTabs = (props: UseTabsProps) => {
  const {
    tableTabs,
    tableActiveTab,
    HomeComponent = HomePage,
    activeKeyboardControl,
  } = props;
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
      Component: React.FunctionComponent<PageProps>,
      _saveTabs = true,
      componentName = `${titleCase(menuItem.replace('module_', ''))}Page`
    ) => {
      setTabs((_tabs) => {
        const id = _tabs[_tabs.length - 1].id + 1;
        const key = menuItem;
        const tabFind = _tabs.find((tab) => tab.menuItem.key === key);
        const index = _tabs.length;
        if (tabFind) {
          setTabActive({ index: tabFind.index, id: tabFind.id });
          return _tabs;
        }
        if (_saveTabs) {
          setTabActive({ index, id });
          saveDatabaseTabActive({ index, id });
          saveDatabaseTabs(menuItem, componentName);
        }

        return Array.from(
          _tabs.concat({
            id,
            index,
            menuItemKey: menuItem,
            menuItem: (
              <Menu.Item key={key}>
                <TransComponent id={menuItem} defaultValue={menuItem} />
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
                <Component
                  appendTab={appendTab}
                  id={tabActive.id}
                  title={menuItem}
                />
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
        appendTab(menuItem, modulesComponent[component], false);
      });
    }
    const tabActiveLocalStorage = getItem<TabActiveType>(tableActiveTab);
    if (tabActiveLocalStorage) {
      setTabActive(tabActiveLocalStorage);
    }
  }, [tableTabs, tableActiveTab]);

  useEffect(() => {
    if (!activeKeyboardControl) return;
    window.addEventListener('keydown', listenerChangeTab);
    return () => {
      window.removeEventListener('keydown', listenerChangeTab);
    };
  }, [listenerChangeTab, activeKeyboardControl]);

  const [tabs, setTabs] = useState<any[]>([
    {
      id: 0,
      index: 0,
      menuItemKey: 'home',
      menuItem: i18n.t('home'),
      pane: (
        <Tab.Pane key="home" className="game-dev-software-body-tab-content">
          <HomeComponent appendTab={appendTab} id={0} title="home" />
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
