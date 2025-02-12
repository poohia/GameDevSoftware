import {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';
import ShortcutsFoldersContext from 'renderer/contexts/ShortcutsFoldersContext';
import { useEvents } from 'renderer/hooks';
import { defaultStateFormReducer, FormReducer } from 'renderer/reducers';
import { ShortcutsFolder } from 'types';

const useShortcutsFolders = () => {
  const [stateForm, dispatch] = useReducer(
    FormReducer,
    defaultStateFormReducer
  );
  const { shortcutsFolders } = useContext(ShortcutsFoldersContext);
  const { sendMessage } = useEvents();

  const openForm = useCallback(
    (data?: ShortcutsFolder) => {
      if (stateForm.key !== data?.id?.toString()) {
        dispatch({
          type: 'hide-form',
        });
      }

      setTimeout(() => {
        if (!data || data.id === undefined) {
          dispatch({
            type: 'show-create-form',
            data: defaultStateFormReducer,
          });
        } else {
          dispatch({
            type: 'show-update-form',
            data: {
              key: data.id.toString(),
              value: data,
            },
          });
        }
      });
    },
    [stateForm]
  );

  const handleSubmit = useCallback((data: ShortcutsFolder) => {
    if (data.id === undefined) {
      dispatch({
        type: 'hide-form',
      });
      sendMessage('add-shortcutsfolder', data);
    } else {
      sendMessage('update-shortcutsfolder', data);
    }
  }, []);

  const deleteFolder = useCallback(
    (id: number) => {
      if (stateForm.key === id.toString()) {
        dispatch({
          type: 'hide-form',
        });
      }
      sendMessage('remove-shortcutsfolder', id);
    },
    [stateForm]
  );

  return {
    stateForm,
    shortcutsFolders,
    openForm,
    handleSubmit,
    deleteFolder,
  };
};

export default useShortcutsFolders;
