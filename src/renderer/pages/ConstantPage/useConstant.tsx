import { useCallback, useEffect, useReducer, useState } from 'react';
import { useEvents } from 'renderer/hooks';
import { ConstantObject, ConstantValue } from 'types';
import { FormReducer, defaultStateFormReducer } from 'renderer/reducers';

const useConstant = () => {
  const [constants, setConstants] = useState<ConstantObject>([]);
  const [stateForm, dispatch] = useReducer(
    FormReducer,
    defaultStateFormReducer
  );
  const { requestMessage, sendMessage } = useEvents();

  const createConstant = useCallback(() => {
    dispatch({
      type: 'show-create-form',
      data: defaultStateFormReducer,
    });
  }, []);

  const sendCreateConstant = useCallback(
    (key: string, value: ConstantValue, description?: string) => {
      setConstants((_constants) => {
        const constant = _constants.find((c) => c.key === key);
        if (constant) {
          (constant.value = value), (constant.description = description);
        } else {
          _constants = _constants.concat({ key, value, description });
        }

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
      const constant = constants.find((c) => c.key === key);
      dispatch({
        type: 'show-update-form',
        data: {
          key,
          value: {
            value: constant?.value || '',
            description: constant?.description || '',
          },
        },
      });
    },
    [constants]
  );

  const deleteConstant = useCallback(
    (key: string) => {
      setConstants((_constants) => {
        _constants = _constants.filter((c) => c.key !== key);
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
    const unSub = requestMessage('load-constants', (args) => {
      setConstants(args);
    });
    return () => {
      unSub();
    };
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
