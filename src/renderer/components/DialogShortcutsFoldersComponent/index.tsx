import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dropdown, DropdownItemProps } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import ModalComponent from '../ModalComponent';
import { useEvents, useShortcutsFolders } from 'renderer/hooks';
import { ShortcutsFolder, ShortcutsFolderTargetType } from 'types';

type DialogShortcutsFoldersComponentProps = ShortcutsFolderTargetType & {
  multiple?: boolean;
  onClose: () => void;
};

const DialogShortcutsFoldersComponent: React.FC<
  DialogShortcutsFoldersComponentProps
> = (props) => {
  const { id, multiple = false, typeTarget, onClose, ...rest } = props;

  const { shortcutsFolders } = useShortcutsFolders();
  const { once, sendMessage } = useEvents();

  const [shortcutsFoldersDropdown, setShortcutsFoldersDropdown] = useState<
    DropdownItemProps[]
  >([]);

  const finalShortcutsFoldersDropdown = useMemo(() => {
    return Array.from(shortcutsFoldersDropdown).reverse();
  }, [shortcutsFoldersDropdown]);

  const [values, setValues] = useState<number[]>([]);

  const handleAccepted = useCallback(() => {
    sendMessage('add-typetarget-shortcutsfolder', {
      id,
      typeTarget,
      values,
    });
    onClose();
  }, [values, id, typeTarget]);

  useEffect(() => {
    setShortcutsFoldersDropdown(
      shortcutsFolders.map((folder) => ({
        text: folder.folderName,
        value: folder.id,
      }))
    );
  }, [shortcutsFolders]);

  useEffect(() => {
    once('get-shortcutsfolder-typetarget', (data: ShortcutsFolder[]) => {
      setValues(data.map((folder) => folder.id));
    });
    sendMessage('get-shortcutsfolder-typetarget', { id, typeTarget });
  }, []);

  return (
    <ModalComponent
      open
      onClose={onClose}
      onAccepted={handleAccepted}
      title={id}
      {...rest}
    >
      <Dropdown
        fluid
        selection
        clearable
        value={values}
        multiple={multiple}
        options={finalShortcutsFoldersDropdown}
        onChange={(_, data) => {
          setValues((data.value || []) as number[]);
        }}
        placeholder={i18n.t('module_shortcutsfolders_form_name')}
        {...rest}
      />
    </ModalComponent>
  );
};

export default DialogShortcutsFoldersComponent;
