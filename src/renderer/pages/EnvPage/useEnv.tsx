import { useCallback, useEffect, useReducer, useState } from 'react';
import { defaultStateFormReducer, FormReducer } from 'renderer/reducers';
import { EnvObject } from 'types';
import { useEvents } from 'renderer/hooks';

const useEnv = () => {
  const [stateForm, dispatch] = useReducer(
    FormReducer,
    defaultStateFormReducer
  );
  const [developmentEnvs, setDevelopmentEnvs] = useState<EnvObject>({});
  const [productionEnvs, setProductionEnvs] = useState<EnvObject>({});
  const { requestMessage, sendMessage } = useEvents();

  const createEnv = useCallback(() => {
    dispatch({
      type: 'show-create-form',
      data: defaultStateFormReducer,
    });
  }, []);

  const sendCreateEnv = useCallback(
    (key: string, developmentEnvValue: string, productionEnvValue: string) => {
      setDevelopmentEnvs((_envs) => {
        _envs[key] = developmentEnvValue;
        sendMessage('write-env-development-vars', _envs);
        return _envs;
      });
      setProductionEnvs((_envs) => {
        _envs[key] = productionEnvValue;
        sendMessage('write-env-production-vars', _envs);
        return _envs;
      });
      dispatch({
        type: 'hide-form',
      });
    },
    []
  );

  const updateEnv = useCallback(
    (key: string) => {
      // const envDevelopment = developmentEnvs.find((e) => e.key === key);
      const envDevelopment = developmentEnvs[key];
      const envProduction = productionEnvs[key];

      // const envProduction = productionEnvs.find((e) => e.key === key);
      if (!envDevelopment || !envProduction) return;
      dispatch({
        type: 'show-update-form',
        data: {
          key,
          value: [envDevelopment, envProduction],
          // value: [envDevelopment.value, envProduction.value],
        },
      });
    },
    [productionEnvs, developmentEnvs]
  );

  const deleteEnv = useCallback(
    (key: string) => {
      setDevelopmentEnvs((_envs) => {
        delete _envs[key];
        sendMessage('write-env-development-vars', _envs);
        return JSON.parse(JSON.stringify(_envs));
      });
      setProductionEnvs((_envs) => {
        delete _envs[key];
        sendMessage('write-env-production-vars', _envs);
        return JSON.parse(JSON.stringify(_envs));
      });
      dispatch({
        type: 'hide-form',
      });
    },
    [productionEnvs, developmentEnvs]
  );

  useEffect(() => {
    requestMessage('load-env-development-vars', (envs: EnvObject) => {
      setDevelopmentEnvs(envs);
    });
    requestMessage('load-env-production-vars', (envs: EnvObject) => {
      setProductionEnvs(envs);
    });
  }, []);

  return {
    developmentEnvs,
    productionEnvs,
    stateForm,
    createEnv,
    updateEnv,
    deleteEnv,
    sendCreateEnv,
  };
};

export default useEnv;
