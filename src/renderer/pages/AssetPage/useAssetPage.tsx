import { useContext, useMemo, useReducer } from 'react';
import AssetsContext from 'renderer/contexts/AssetsContext';
import GameModuleContext from 'renderer/contexts/GameModuleContext';
import { useEvents } from 'renderer/hooks';
import { defaultStateFormReducer, FormReducer } from 'renderer/reducers';
import { AssertFileValueType } from 'types';

const useAssetPage = () => {
  const { module } = useContext(GameModuleContext);
  const { assets } = useContext(AssetsContext);
  const isModuleView = useMemo(() => !!module, [module]);
  const { sendMessage } = useEvents();
  const [stateForm, dispatch] = useReducer(
    FormReducer,
    defaultStateFormReducer
  );
  const saveFile = (file: AssertFileValueType, shortcutFolderId?: number) => {
    dispatch({
      type: 'hide-form',
    });
    sendMessage('upload-file', file);
    if (shortcutFolderId !== undefined) {
      sendMessage('add-typetarget-shortcutsfolder', {
        id: file.fileName,
        typeTarget: 'assets',
        values: [shortcutFolderId],
      });
    }
  };
  const deleteFile = (fileName: any) => {
    dispatch({
      type: 'hide-form',
    });
    sendMessage('delete-file', fileName);
  };
  const sendMultipleUploads = () => {
    sendMessage('select-multiple-files');
  };

  return {
    assets,
    stateForm,
    isModuleView,
    module,
    dispatch,
    saveFile,
    deleteFile,
    sendMultipleUploads,
  };
};

export default useAssetPage;
