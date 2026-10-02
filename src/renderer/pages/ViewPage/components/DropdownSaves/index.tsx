import { useCallback, useContext, useMemo, useState } from 'react';
import ModalComponent from 'renderer/components/ModalComponent';
import { Button } from 'renderer/semantic-ui';
import { Dropdown, DropdownItemProps, Form, Icon } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import useMessages, { useMessagesProps } from '../../useMessages';
import SavesOrderModalComponent from '../SavesOrderModalComponent';
import SavesContext from 'renderer/contexts/SavesContext';
import { GameDatabaseSave } from 'types';

type DropdownSavesProps = useMessagesProps & {
  onLoadSave: () => void;
};

const DropdownSaves: React.FC<DropdownSavesProps> = ({
  refIframe,
  onLoadSave,
}) => {
  const { saves, addSave, eraseSave, removeSave, reorderSaves } =
    useContext(SavesContext);
  const { sendMessage } = useMessages(refIframe);

  /** */
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openOrderModal, setOpenOrderModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [saveSelected, setSaveSelected] = useState<GameDatabaseSave | null>(
    null
  );

  const [loading, setLoading] = useState<boolean>(false);
  /** */
  // the dropdown lists the saves from the last to the first of saves.json
  const savesDisplayed = useMemo(() => [...saves].reverse(), [saves]);
  const options: DropdownItemProps[] = useMemo(
    () =>
      savesDisplayed.map((save) => ({
        text: save.title,
        value: save.id,
      })),
    [savesDisplayed]
  );

  const handleSubmit = useCallback(() => {
    if (title === '') {
      return;
    }
    sendMessage('getSaveData', null, (data) => {
      addSave(data.data, title);
      setTitle('');
      setOpenModal(false);
    });
  }, [title]);

  const eraseSaveAction = useCallback(() => {
    if (loading || !saveSelected) return;
    setLoading(true);

    sendMessage('getSaveData', null, (data) => {
      saveSelected.game = data.data.game;
      eraseSave(saveSelected);
      setTimeout(() => {
        onLoadSave();
        setLoading(false);
      }, 500);
    });
  }, [saveSelected]);

  const removeCurrentSave = useCallback(() => {
    if (loading) return;

    if (saveSelected) {
      removeSave(saveSelected.id);
      setSaveSelected(null);
    }
  }, [loading, saveSelected]);

  const loadSave = useCallback(() => {
    if (loading) return;

    if (saveSelected) {
      setLoading(true);
      sendMessage('setSaveData', saveSelected);
      setTimeout(() => {
        onLoadSave();
        setLoading(false);
      }, 500);
    }
  }, [loading, saveSelected]);

  return (
    <>
      <div>
        <Dropdown
          selection
          options={options}
          placeholder={i18n.t('module_view_save_input_placeholder')}
          clearable
          search
          value={saveSelected?.id || undefined}
          onChange={(_e, data) => {
            setSaveSelected(
              saves.find((save) => save.id === data.value) || null
            );
          }}
        />
        {saveSelected === null && (
          <>
            <Button
              icon
              color="green"
              onClick={() => {
                setOpenModal(true);
              }}
            >
              <Icon name="add" />
            </Button>
            <Button
              icon
              color="blue"
              disabled={saves.length < 2}
              onClick={() => {
                setOpenOrderModal(true);
              }}
            >
              <Icon name="sort" />
            </Button>
          </>
        )}
        {saveSelected !== null && (
          <>
            <Button
              icon
              secondary
              onClick={() => {
                loadSave();
              }}
              loading={loading}
            >
              <Icon name="save" />
            </Button>
            <Button
              icon
              color="purple"
              onClick={eraseSaveAction}
              loading={loading}
            >
              <Icon name="erase" />
            </Button>
            <Button
              icon
              color="red"
              onClick={removeCurrentSave}
              loading={loading}
            >
              <Icon name="trash" />
            </Button>
          </>
        )}
      </div>
      <ModalComponent
        title={i18n.t('module_view_save_modal_title')}
        onAccepted={handleSubmit}
        onClose={() => setOpenModal(false)}
        open={openModal}
      >
        <Form>
          <Form.Field>
            <label>{i18n.t('module_view_save_modal_input_label')}</label>
            <Form.Input
              value={title}
              onChange={(_e, data) => {
                setTitle(data.value);
              }}
              focus
              autoFocus
            />
          </Form.Field>
        </Form>
      </ModalComponent>
      <SavesOrderModalComponent
        open={openOrderModal}
        saves={savesDisplayed}
        onClose={() => setOpenOrderModal(false)}
        onAccepted={(orderedIds) => {
          reorderSaves([...orderedIds].reverse());
          setOpenOrderModal(false);
        }}
      />
    </>
  );
};

export default DropdownSaves;
