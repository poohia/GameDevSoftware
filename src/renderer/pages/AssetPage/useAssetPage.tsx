import { useContext, useEffect, useMemo, useReducer, useState } from 'react';
import GameModuleContext from 'renderer/contexts/GameModuleContext';
import { useEvents } from 'renderer/hooks';
import { defaultStateFormReducer, FormReducer } from 'renderer/reducers';
import { AssertFileValueType, AssetType } from 'types';

const useAssetPage = () => {
  const { module } = useContext(GameModuleContext);
  const isModuleView = useMemo(() => !!module, [module]);
  const { requestMessage, sendMessage } = useEvents();
  const [stateForm, dispatch] = useReducer(
    FormReducer,
    defaultStateFormReducer
  );
  const [assets, setAssets] = useState<AssetType[]>([]);
  const saveFile = (file: AssertFileValueType) => {
    dispatch({
      type: 'hide-form',
    });
    sendMessage('upload-file', file);
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
  useEffect(() => {
    const unSub = requestMessage('load-assets', (args) => {
      setAssets(args);
    });
    return () => {
      unSub();
    };
  }, []);
  return {
    assets,
    stateForm,
    isModuleView,
    dispatch,
    saveFile,
    deleteFile,
    sendMultipleUploads,
  };
};

export default useAssetPage;
