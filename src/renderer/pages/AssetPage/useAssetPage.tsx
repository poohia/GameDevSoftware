import { useEffect, useReducer, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { defaultStateFormReducer, FormReducer } from 'renderer/reducers';
import { AssertFileValueType, AssetType } from 'types';

const useAssetPage = () => {
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
  useEffect(() => {
    const unSub = requestMessage('load-assets', (args) => {
      setAssets(args);
    });
    return () => {
      unSub();
    };
  }, []);
  return { assets, stateForm, dispatch, saveFile, deleteFile };
};

export default useAssetPage;
