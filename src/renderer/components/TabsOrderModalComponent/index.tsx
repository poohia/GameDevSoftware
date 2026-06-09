import { useEffect, useState } from 'react';
import { Header, Icon } from 'semantic-ui-react';
import { Table } from 'renderer/semantic-ui';
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
  const [draggedTabId, setDraggedTabId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    id: number;
    position: 'before' | 'after';
  } | null>(null);

  useEffect(() => {
    if (open) {
      setDraftTabs(tabs);
      setDraggedTabId(null);
      setDropTarget(null);
    }
  }, [open, tabs]);

  const reorderTabs = (targetId: number, position: 'before' | 'after') => {
    setDraftTabs((currentTabs) => {
      if (draggedTabId === null || draggedTabId === 0 || draggedTabId === targetId) {
        return currentTabs;
      }

      const draggedIndex = currentTabs.findIndex((tab) => tab.id === draggedTabId);
      const targetIndex = currentTabs.findIndex((tab) => tab.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) {
        return currentTabs;
      }

      const draggedTab = currentTabs[draggedIndex];
      const nextTabs = currentTabs.filter((tab) => tab.id !== draggedTabId);
      const nextTargetIndex = nextTabs.findIndex((tab) => tab.id === targetId);

      if (nextTargetIndex === -1) {
        return currentTabs;
      }

      let insertionIndex = nextTargetIndex;
      if (position === 'after') {
        insertionIndex += 1;
      }

      insertionIndex = Math.max(1, Math.min(insertionIndex, nextTabs.length));
      nextTabs.splice(insertionIndex, 0, draggedTab);
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
                defaultValue="Move"
              />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {draftTabs.map((tab) => {
            const isHome = tab.menuItemKey === 'home';
            const isDragged = draggedTabId === tab.id;
            const isDropTarget = dropTarget?.id === tab.id;
            const borderStyle =
              isDropTarget && dropTarget
                ? dropTarget.position === 'before'
                  ? 'inset 0 3px 0 #2185d0'
                  : 'inset 0 -3px 0 #2185d0'
                : undefined;

            return (
              <Table.Row
                key={`tabs-order-row-${tab.id}`}
                active={tab.isActive}
                draggable={!isHome}
                onDragStart={(event) => {
                  if (isHome) return;
                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData('text/plain', tab.id.toString());
                  setDraggedTabId(tab.id);
                }}
                onDragOver={(event) => {
                  if (draggedTabId === null || draggedTabId === tab.id) return;
                  event.preventDefault();
                  const { top, height } = event.currentTarget.getBoundingClientRect();
                  const position =
                    event.clientY < top + height / 2 ? 'before' : 'after';
                  setDropTarget({
                    id: tab.id,
                    position: isHome ? 'after' : position,
                  });
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (draggedTabId === null || draggedTabId === tab.id) return;
                  const { top, height } =
                    event.currentTarget.getBoundingClientRect();
                  const position =
                    event.clientY < top + height / 2 ? 'before' : 'after';
                  reorderTabs(tab.id, isHome ? 'after' : position);
                  setDraggedTabId(null);
                  setDropTarget(null);
                }}
                onDragEnd={() => {
                  setDraggedTabId(null);
                  setDropTarget(null);
                }}
                style={{
                  cursor: isHome ? 'default' : 'grab',
                  opacity: isDragged ? 0.5 : 1,
                  boxShadow: borderStyle,
                }}
              >
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
                <Table.Cell textAlign="center">
                  <Icon
                    name={isHome ? 'lock' : 'bars'}
                    style={{ cursor: isHome ? 'default' : 'grab' }}
                  />
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
