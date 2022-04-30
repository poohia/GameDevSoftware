import { useCallback, useEffect, useReducer, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { ConstantObject, ConstantValue } from 'types';
import ConstantFormReducer, { defaultState } from './ConstantFormReducer';

const useConstant = () => {
  const [constants, setConstants] = useState<ConstantObject>({});
  const [stateForm, dispatch] = useReducer(ConstantFormReducer, defaultState);
  const { requestMessage, sendMessage } = useEvents();

  const createConstant = useCallback(() => {
    dispatch({
      type: 'show-create-form',
      data: defaultState,
    });
  }, []);

  const sendCreateConstant = useCallback(
    (key: string, value: ConstantValue) => {
      setConstants((_constants) => {
        _constants[key] = value;
        sendMessage('save-constants', _constants);
        return JSON.parse(JSON.stringify(_constants));
      });
      dispatch({
        type: 'hide-form',
      });
    },
    [constants]
  );

  const updateConstant = useCallback(
    (key: string) => {
      dispatch({
        type: 'show-update-form',
        data: {
          key,
          value: constants[key],
        },
      });
    },
    [constants]
  );

  const deleteConstant = useCallback(
    (key: string) => {
      setConstants((_constants) => {
        delete _constants[key];
        sendMessage('save-constants', _constants);
        return JSON.parse(JSON.stringify(_constants));
      });
      dispatch({
        type: 'hide-form',
      });
    },
    [constants]
  );

  useEffect(() => {
    requestMessage('load-constants', (args) => {
      setConstants(args);
    });
  }, []);

  return {
    constants,
    stateForm,
    createConstant,
    sendCreateConstant,
    updateConstant,
    deleteConstant,
  };
};
export default useConstant;
