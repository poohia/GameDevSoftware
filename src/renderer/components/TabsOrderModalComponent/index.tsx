import { useEffect, useState } from 'react';
import { Header, Icon } from 'semantic-ui-react';
import { Button, Table } from 'renderer/semantic-ui';
import ModalComponent from '../ModalComponent';
import TransComponent from '../TransComponent';

type TabsOrderItem = {
  id: number;
  menuItemKey: string;
  isActive: boolean;
};

type TabsOrderModalComponentProps = {
  open: boolean;
  tabs: TabsOrderItem[];
  onClose: () => void;
  onAccepted: (orderedIds: number[]) => void;
};

const TabsOrderModalComponent: React.FC<TabsOrderModalComponentProps> = ({
  open,
  tabs,
  onClose,
  onAccepted,
}) => {
  const [draftTabs, setDraftTabs] = useState<TabsOrderItem[]>(tabs);

  useEffect(() => {
    if (open) {
      setDraftTabs(tabs);
    }
  }, [open, tabs]);

  const moveTab = (index: number, direction: -1 | 1) => {
    setDraftTabs((currentTabs) => {
      const targetIndex = index + direction;
      const currentTab = currentTabs[index];
      const targetTab = currentTabs[targetIndex];

      if (
        !currentTab ||
        currentTab.menuItemKey === 'home' ||
        !targetTab ||
        targetTab.menuItemKey === 'home'
      ) {
        return currentTabs;
      }

      const nextTabs = Array.from(currentTabs);
      nextTabs[index] = targetTab;
      nextTabs[targetIndex] = currentTab;
      return nextTabs;
    });
  };

  return (
    <ModalComponent
      open={open}
      onClose={onClose}
      onAccepted={() => onAccepted(draftTabs.map((tab) => tab.id))}
      title={
        <TransComponent
          id="tabs_order_modal_title"
          defaultValue="Reorder open tabs"
        />
      }
    >
      <Table celled selectable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              <TransComponent
                id="tabs_order_modal_table_tab"
                defaultValue="Tab"
              />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <TransComponent
                id="tabs_order_modal_table_status"
                defaultValue="Status"
              />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <TransComponent
                id="tabs_order_modal_table_actions"
                defaultValue="Actions"
              />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {draftTabs.map((tab, index) => {
            const isHome = tab.menuItemKey === 'home';
            const disableUp = isHome || index <= 1;
            const disableDown = isHome || index >= draftTabs.length - 1;

            return (
              <Table.Row key={`tabs-order-row-${tab.id}`} active={tab.isActive}>
                <Table.Cell>
                  <Header as="h4">
                    <TransComponent
                      id={tab.menuItemKey}
                      defaultValue={tab.menuItemKey}
                    />
                  </Header>
                </Table.Cell>
                <Table.Cell>
                  {tab.isActive && (
                    <TransComponent
                      id="tabs_order_modal_status_active"
                      defaultValue="Active"
                    />
                  )}
                  {!tab.isActive && isHome && (
                    <TransComponent
                      id="tabs_order_modal_status_fixed"
                      defaultValue="Fixed"
                    />
                  )}
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Button
                    basic
                    icon
                    onClick={() => moveTab(index, -1)}
                    disabled={disableUp}
                  >
                    <Icon name="arrow up" />
                  </Button>
                  <Button
                    basic
                    icon
                    onClick={() => moveTab(index, 1)}
                    disabled={disableDown}
                  >
                    <Icon name="arrow down" />
                  </Button>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </ModalComponent>
  );
};

export default TabsOrderModalComponent;
