import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

type TabState = {
  id: number;
  index: number;
  menuItemKey: string;
  componentName: string;
};

type RenderedTab = TabState & {
  menuItem: React.ReactNode;
  pane: React.ReactNode;
};

const HOME_TAB: TabState = {
  id: 0,
  index: 0,
  menuItemKey: 'home',
  componentName: 'HomePage',
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
  const [tabsState, setTabsState] = useState<TabState[]>([HOME_TAB]);

  const saveDatabaseTabActive = useCallback(
    (nextTabActive: { index: number; id: number }) => {
      setItem<TabActiveType>(tableActiveTab, nextTabActive);
    },
    [setItem, tableActiveTab]
  );

  const normalizeTabs = useCallback((tabsToNormalize: TabState[]) => {
    return tabsToNormalize.map((tab, index) => ({
      ...tab,
      index,
    }));
  }, []);

  const saveDatabaseTabs = useCallback(
    (tabsToSave: TabState[]) => {
      setItem<TabDatabaseType[]>(
        tableTabs,
        tabsToSave
          .filter((tab) => tab.menuItemKey !== 'home')
          .map((tab) => ({
            id: tab.id,
            menuItem: tab.menuItemKey,
            component: tab.componentName,
          }))
      );
    },
    [setItem, tableTabs]
  );

  const removeTab = useCallback(
    (id: number) => {
      setTabsState((_tabs) => {
        const removedIndex = _tabs.findIndex((tab) => tab.id === id);
        if (removedIndex === -1) {
          return _tabs;
        }

        const nextTabs = normalizeTabs(_tabs.filter((tab) => tab.id !== id));

        setTabActive((_tabActive) => {
          let nextTabActive = _tabActive;

          if (_tabActive.id === id) {
            const fallbackTab =
              nextTabs[Math.max(removedIndex - 1, 0)] || nextTabs[0];
            nextTabActive = fallbackTab
              ? { index: fallbackTab.index, id: fallbackTab.id }
              : { index: 0, id: 0 };
          } else {
            const activeIndex = nextTabs.findIndex(
              (tab) => tab.id === _tabActive.id
            );
            nextTabActive =
              activeIndex === -1
                ? { index: 0, id: 0 }
                : { ..._tabActive, index: activeIndex };
          }

          saveDatabaseTabActive(nextTabActive);
          return nextTabActive;
        });

        saveDatabaseTabs(nextTabs);
        return nextTabs;
      });
    },
    [normalizeTabs, saveDatabaseTabActive, saveDatabaseTabs]
  );

  const nextTab = useCallback(
    (id: number) => {
      setTabsState((_tabs) => {
        setTabActive((_tabActive) => {
          const index = _tabs.map((tab) => tab.id).indexOf(id) + 1;
          if (_tabs[index] === undefined) {
            const nextTabActive = { index: 0, id: 0 };
            saveDatabaseTabActive(nextTabActive);
            return nextTabActive;
          }

          const { id: idTab } = _tabs[index];
          const nextTabActive = { index, id: idTab };
          saveDatabaseTabActive(nextTabActive);
          return nextTabActive;
        });
        return _tabs;
      });
    },
    [saveDatabaseTabActive]
  );

  const prevTab = useCallback(
    (id: number) => {
      setTabsState((_tabs) => {
        setTabActive((_tabActive) => {
          const index = _tabs.map((tab) => tab.id).indexOf(id) - 1;
          if (_tabs[index] === undefined) {
            const lastTab = _tabs[_tabs.length - 1];
            const nextTabActive = { index: _tabs.length - 1, id: lastTab.id };
            saveDatabaseTabActive(nextTabActive);
            return nextTabActive;
          }

          const { id: idTab } = _tabs[index];
          const nextTabActive = { index, id: idTab };
          saveDatabaseTabActive(nextTabActive);
          return nextTabActive;
        });
        return _tabs;
      });
    },
    [saveDatabaseTabActive]
  );

  const appendTab = useCallback(
    (
      menuItem: string,
      _Component: React.FunctionComponent<PageProps>,
      _saveTabs = true,
      componentName = `${titleCase(menuItem.replace('module_', ''))}Page`
    ) => {
      setTabsState((_tabs) => {
        const tabFindIndex = _tabs.findIndex(
          (tab) => tab.menuItemKey === menuItem
        );
        if (tabFindIndex !== -1) {
          const existingTab = _tabs[tabFindIndex];
          const nextTabActive = { index: tabFindIndex, id: existingTab.id };
          setTabActive(nextTabActive);
          saveDatabaseTabActive(nextTabActive);
          return _tabs;
        }

        const id = Math.max(..._tabs.map((tab) => tab.id)) + 1;
        const nextTabs = normalizeTabs(
          _tabs.concat({
            id,
            index: _tabs.length,
            menuItemKey: menuItem,
            componentName,
          })
        );

        if (_saveTabs) {
          const nextTabActive = { index: nextTabs.length - 1, id };
          setTabActive(nextTabActive);
          saveDatabaseTabActive(nextTabActive);
          saveDatabaseTabs(nextTabs);
        }

        return nextTabs;
      });
    },
    [normalizeTabs, saveDatabaseTabActive, saveDatabaseTabs]
  );

  const applyTabsOrder = useCallback(
    (orderedIds: number[]) => {
      setTabsState((_tabs) => {
        if (orderedIds.length !== _tabs.length || orderedIds[0] !== 0) {
          return _tabs;
        }

        const tabsMap = new Map(_tabs.map((tab) => [tab.id, tab]));
        const orderedTabs = orderedIds
          .map((id) => tabsMap.get(id))
          .filter((tab): tab is TabState => !!tab);

        if (orderedTabs.length !== _tabs.length) {
          return _tabs;
        }

        const nextTabs = normalizeTabs(orderedTabs);
        saveDatabaseTabs(nextTabs);

        setTabActive((_tabActive) => {
          const nextIndex = nextTabs.findIndex(
            (tab) => tab.id === _tabActive.id
          );
          const nextTabActive =
            nextIndex === -1
              ? { index: 0, id: 0 }
              : { ..._tabActive, index: nextIndex };
          saveDatabaseTabActive(nextTabActive);
          return nextTabActive;
        });

        return nextTabs;
      });
    },
    [normalizeTabs, saveDatabaseTabActive, saveDatabaseTabs]
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
      }
    },
    [nextTab, prevTab, removeTab, tabActive]
  );

  const onTabChange = useCallback(
    (index: number, id: number) => {
      document.removeEventListener('keydown', listenerChangeTab);
      const nextTabActive = { index, id };
      saveDatabaseTabActive(nextTabActive);
      setTabActive(nextTabActive);
    },
    [listenerChangeTab, saveDatabaseTabActive]
  );

  useEffect(() => {
    const tabsLocalStorage = getItem<TabDatabaseType[]>(tableTabs) || [];
    const restoredTabs = normalizeTabs([
      HOME_TAB,
      ...tabsLocalStorage.map((tab, index) => ({
        id: tab.id ?? index + 1,
        index: index + 1,
        menuItemKey: tab.menuItem,
        componentName: tab.component,
      })),
    ]);
    setTabsState(restoredTabs);

    const tabActiveLocalStorage = getItem<TabActiveType>(tableActiveTab);
    if (tabActiveLocalStorage) {
      const restoredActiveIndex = restoredTabs.findIndex(
        (tab) => tab.id === tabActiveLocalStorage.id
      );
      if (restoredActiveIndex !== -1) {
        setTabActive({
          ...tabActiveLocalStorage,
          index: restoredActiveIndex,
        });
        return;
      }
    }
    setTabActive({ index: 0, id: 0 });
  }, [getItem, normalizeTabs, tableActiveTab, tableTabs]);

  useEffect(() => {
    if (!activeKeyboardControl) return;
    window.addEventListener('keydown', listenerChangeTab);
    return () => {
      window.removeEventListener('keydown', listenerChangeTab);
    };
  }, [activeKeyboardControl, listenerChangeTab]);

  const tabs = useMemo<RenderedTab[]>(() => {
    return tabsState.map((tab) => {
      if (tab.menuItemKey === 'home') {
        return {
          ...tab,
          menuItem: i18n.t('home'),
          pane: (
            <Tab.Pane key="home" className="game-dev-software-body-tab-content">
              <HomeComponent appendTab={appendTab} id={tab.id} title="home" />
            </Tab.Pane>
          ),
        };
      }

      const Component = modulesComponent[tab.componentName];

      return {
        ...tab,
        menuItem: (
          <Menu.Item key={tab.menuItemKey}>
            <TransComponent
              id={tab.menuItemKey}
              defaultValue={tab.menuItemKey}
              onMouseDown={(e) => {
                const { button } = e;
                if (button === 1) {
                  e.stopPropagation();
                  removeTab(tab.id);
                }
              }}
            />
            <Icon
              name="close"
              onClick={(event: Event) => {
                event.stopPropagation();
                removeTab(tab.id);
              }}
            />
          </Menu.Item>
        ),
        pane: (
          <Tab.Pane key={tab.menuItemKey}>
            {Component ? (
              <Component
                appendTab={appendTab}
                id={tab.id}
                title={tab.menuItemKey}
              />
            ) : null}
          </Tab.Pane>
        ),
      };
    });
  }, [HomeComponent, appendTab, removeTab, tabsState]);

  const tabsOrderItems = useMemo(
    () =>
      tabsState.map((tab) => ({
        id: tab.id,
        menuItemKey: tab.menuItemKey,
        isActive: tab.id === tabActive.id,
      })),
    [tabActive.id, tabsState]
  );

  return {
    tabs,
    tabActive,
    appendTab,
    onTabChange,
    tabsOrderItems,
    applyTabsOrder,
  };
};

export default useTabs;
