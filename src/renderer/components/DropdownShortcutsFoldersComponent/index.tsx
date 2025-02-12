import { useContext, useEffect, useMemo, useState } from 'react';
import ShortcutsFoldersContext from 'renderer/contexts/ShortcutsFoldersContext';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import i18n from 'translations/i18n';
import { ShortcutsFolder } from 'types';

type DropdownShortcutsFoldersComponentProps = Omit<DropdownProps, 'options'> & {
  onChange: (folder: ShortcutsFolder | null) => void;
};

const DropdownShortcutsFoldersComponent: React.FC<
  DropdownShortcutsFoldersComponentProps
> = (props) => {
  const { onChange, ...rest } = props;
  const {
    shortcutsFolders,
    currentShortcutsFolder,
    currentShortcutsFolderID,
    setCurrentShortcutsFolderID,
  } = useContext(ShortcutsFoldersContext);
  const [shortcutsFoldersDropdown, setShortcutsFoldersDropdown] = useState<
    DropdownItemProps[]
  >([]);

  const value = useMemo(
    () => currentShortcutsFolderID,
    [currentShortcutsFolderID]
  );

  useEffect(() => {
    setShortcutsFoldersDropdown(
      shortcutsFolders.map((folder) => ({
        text: folder.folderName,
        value: folder.id,
      }))
    );
  }, [shortcutsFolders]);

  useEffect(() => {
    onChange(currentShortcutsFolder);
  }, [currentShortcutsFolder]);

  return (
    <Dropdown
      fluid
      selection
      clearable
      search={shortcutsFolders.length > 10}
      value={value}
      options={shortcutsFoldersDropdown}
      onChange={(_, data) => {
        if (data.value) {
          setCurrentShortcutsFolderID(Number(data.value));
        } else {
          setCurrentShortcutsFolderID(null);
        }
      }}
      placeholder={i18n.t('module_shortcutsfolders_form_name')}
      {...rest}
    />
  );
};

export default DropdownShortcutsFoldersComponent;
