import { useCallback, useMemo, useState } from 'react';
import ModalComponent from 'renderer/components/ModalComponent';
import { useDatabase } from 'renderer/hooks';
import { Button } from 'renderer/semantic-ui';
import { Dropdown, DropdownItemProps, Form, Icon } from 'semantic-ui-react';
import i18n from 'translations/i18n';

type DropdownSavesProps = {
  refIframe: HTMLIFrameElement;
  onLoadSave: () => void;
};

const DropdownSaves: React.FC<DropdownSavesProps> = ({
  refIframe,
  onLoadSave,
}) => {
  /** */
  const { getItem, setItem } = useDatabase();
  /** */
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [saveSelected, setSaveSelected] = useState<string | null>(null);
  const [saves, setSaves] = useState<{ title: string; data: any }[]>(
    getItem('view-saves') || []
  );
  const [loading, setLoading] = useState<boolean>(false);
  /** */
  const options: DropdownItemProps[] = useMemo(
    () =>
      saves.map((save) => ({
        text: save.title,
        value: save.title.toLowerCase(),
        key: save.title.toLowerCase(),
      })),
    [saves]
  );

  const sendMessage = useCallback(
    (title: 'getSaveData' | 'setSaveData', data?: any) => {
      refIframe.contentWindow?.postMessage(
        {
          title,
          data,
        },
        '*'
      );
    },
    []
  );

  const loadSaves = useCallback(() => {
    setSaves(getItem('view-saves') || []);
  }, []);

  const handleSubmit = useCallback(() => {
    if (title === '') {
      return;
    }
    const receiveMessage = (env: MessageEvent<any>) => {
      window.removeEventListener('message', receiveMessage, false);
      if (env.data.message.title === 'getSaveData') {
        setItem('view-saves', saves.concat({ title, data: env.data.data }));
      }
      setTitle('');
      setOpenModal(false);
      loadSaves();
    };
    window.addEventListener('message', receiveMessage, false);
    sendMessage('getSaveData');
  }, [title]);

  const removeSave = useCallback(
    (title: string) => {
      if (loading) return;
      const futurSaves = saves.filter(
        (save) => save.title.toLowerCase() !== title
      );
      setItem('view-saves', futurSaves);
      setSaves(futurSaves);
      setSaveSelected(null);
    },
    [loading, saves]
  );

  const loadSave = useCallback(
    (title: string) => {
      if (loading) return;
      const save = saves.find((save) => {
        return save.title.toLowerCase() === title;
      });

      if (save) {
        setLoading(true);
        sendMessage('setSaveData', save.data);
        setTimeout(() => {
          onLoadSave();
          setLoading(false);
        }, 500);
      }
    },
    [loading, saves]
  );

  return (
    <>
      <div>
        <Dropdown
          selection
          options={options}
          placeholder={i18n.t('module_view_save_input_placeholder')}
          clearable
          search
          value={saveSelected || undefined}
          onChange={(_e, data) => {
            const save = saves.find(
              (save) => save.title.toLowerCase() === data.value
            );
            if (!save) {
              setSaveSelected(null);
            } else {
              setSaveSelected(save.title.toLowerCase());
            }
          }}
        />
        {saveSelected === null && (
          <Button
            icon
            color="green"
            onClick={() => {
              setOpenModal(true);
            }}
          >
            <Icon name="add" />
          </Button>
        )}
        {saveSelected !== null && (
          <>
            <Button
              icon
              secondary
              onClick={() => {
                loadSave(saveSelected);
              }}
              loading={loading}
            >
              <Icon name="save" />
            </Button>
            <Button
              icon
              color="red"
              onClick={() => {
                removeSave(saveSelected);
              }}
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
            />
          </Form.Field>
        </Form>
      </ModalComponent>
    </>
  );
};

export default DropdownSaves;
