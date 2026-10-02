import { useEffect, useState } from 'react';
import { Header, Icon } from 'semantic-ui-react';
import { Table } from 'renderer/semantic-ui';
import ModalComponent from 'renderer/components/ModalComponent';
import { TransComponent } from 'renderer/components';
import { GameDatabaseSave } from 'types';

type SavesOrderModalComponentProps = {
  open: boolean;
  saves: GameDatabaseSave[];
  onClose: () => void;
  onAccepted: (orderedIds: number[]) => void;
};

const SavesOrderModalComponent: React.FC<SavesOrderModalComponentProps> = ({
  open,
  saves,
  onClose,
  onAccepted,
}) => {
  const [draftSaves, setDraftSaves] = useState<GameDatabaseSave[]>(saves);
  const [draggedSaveId, setDraggedSaveId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    id: number;
    position: 'before' | 'after';
  } | null>(null);

  useEffect(() => {
    if (open) {
      setDraftSaves(saves);
      setDraggedSaveId(null);
      setDropTarget(null);
    }
  }, [open, saves]);

  const reorderSaves = (targetId: number, position: 'before' | 'after') => {
    setDraftSaves((currentSaves) => {
      if (draggedSaveId === null || draggedSaveId === targetId) {
        return currentSaves;
      }

      const draggedSave = currentSaves.find(
        (save) => save.id === draggedSaveId
      );
      if (!draggedSave) {
        return currentSaves;
      }

      const nextSaves = currentSaves.filter(
        (save) => save.id !== draggedSaveId
      );
      const targetIndex = nextSaves.findIndex((save) => save.id === targetId);
      if (targetIndex === -1) {
        return currentSaves;
      }

      nextSaves.splice(
        position === 'after' ? targetIndex + 1 : targetIndex,
        0,
        draggedSave
      );
      return nextSaves;
    });
  };

  return (
    <ModalComponent
      open={open}
      onClose={onClose}
      onAccepted={() => onAccepted(draftSaves.map((save) => save.id))}
      title={
        <TransComponent
          id="module_view_save_order_modal_title"
          defaultValue="Reorder saves"
        />
      }
    >
      <Table celled selectable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              <TransComponent
                id="module_view_save_order_modal_table_save"
                defaultValue="Save"
              />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <TransComponent
                id="module_view_save_order_modal_table_actions"
                defaultValue="Move"
              />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {draftSaves.map((save) => {
            const isDragged = draggedSaveId === save.id;
            const isDropTarget = dropTarget?.id === save.id;
            const borderStyle =
              isDropTarget && dropTarget
                ? dropTarget.position === 'before'
                  ? 'inset 0 3px 0 #2185d0'
                  : 'inset 0 -3px 0 #2185d0'
                : undefined;

            return (
              <Table.Row
                key={`saves-order-row-${save.id}`}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData('text/plain', save.id.toString());
                  setDraggedSaveId(save.id);
                }}
                onDragOver={(event) => {
                  if (draggedSaveId === null || draggedSaveId === save.id)
                    return;
                  event.preventDefault();
                  const { top, height } =
                    event.currentTarget.getBoundingClientRect();
                  setDropTarget({
                    id: save.id,
                    position:
                      event.clientY < top + height / 2 ? 'before' : 'after',
                  });
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (draggedSaveId === null || draggedSaveId === save.id)
                    return;
                  const { top, height } =
                    event.currentTarget.getBoundingClientRect();
                  reorderSaves(
                    save.id,
                    event.clientY < top + height / 2 ? 'before' : 'after'
                  );
                  setDraggedSaveId(null);
                  setDropTarget(null);
                }}
                onDragEnd={() => {
                  setDraggedSaveId(null);
                  setDropTarget(null);
                }}
                style={{
                  cursor: 'grab',
                  opacity: isDragged ? 0.5 : 1,
                  boxShadow: borderStyle,
                }}
              >
                <Table.Cell>
                  <Header as="h4">{save.title}</Header>
                </Table.Cell>
                <Table.Cell textAlign="center" collapsing>
                  <Icon name="bars" style={{ cursor: 'grab' }} />
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </ModalComponent>
  );
};

export default SavesOrderModalComponent;
