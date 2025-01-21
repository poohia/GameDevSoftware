import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { useEvents } from 'renderer/hooks';
import { ConstantObject, ConstantValue } from 'types';
import { FormReducer, defaultStateFormReducer } from 'renderer/reducers';
import GameModuleContext from 'renderer/contexts/GameModuleContext';

const useConstant = () => {
  const { module } = useContext(GameModuleContext);
  const isModuleView = useMemo(() => !!module, [module]);
  /** */
  const [constants, setConstants] = useState<ConstantObject[]>([]);
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
    (constant: ConstantObject) => {
      const { key, value, valueMobile, description, editable, deletable } =
        constant;
      console.log('🚀 ~ useConstant ~ valueMobile:', valueMobile);

      setConstants((_constants) => {
        const constant = _constants.find((c) => c.key === key);
        if (constant) {
          constant.value = value;
          constant.valueMobile = valueMobile;
          constant.description = description;
          constant.editable = editable;
          constant.deletable = deletable;
        } else {
          _constants = _constants.concat({
            key,
            value,
            valueMobile,
            description,
            editable,
            deletable,
          });
        }

        sendMessage('save-constants', _constants);
        return JSON.parse(JSON.stringify(_constants));
      });
      // dispatch({
      //   type: 'hide-form',
      // });
    },
    [constants]
  );

  const updateConstant = useCallback(
    (key: string) => {
      const constant = constants.find((c) => {
        return c.key === key;
      });
      console.log('🚀 ~ constant ~ constants:', constants);

      dispatch({
        type: 'show-update-form',
        data: {
          key,
          value: {
            value: constant ? constant.value : '',
            valueMobile: constant?.valueMobile
              ? constant.valueMobile
              : undefined,
            description: constant?.description || '',
            editable: constant ? constant.editable : true,
            deletable: constant ? constant.deletable : true,
            module,
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
    module,
    stateForm,
    isModuleView,
    createConstant,
    sendCreateConstant,
    updateConstant,
    deleteConstant,
  };
};
export default useConstant;
