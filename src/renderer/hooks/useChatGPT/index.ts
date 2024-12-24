import { useCallback, useEffect, useState } from 'react';
import { ChatGPTType } from 'types';
import { DropdownItemProps } from 'semantic-ui-react';
import useEvents from '../useEvents';

const useChatGPT = () => {
  const [chatGPTInfos, setChatGPTInfos] = useState<
    Partial<ChatGPTType> | undefined
  >();
  const [models, setModels] = useState<DropdownItemProps[]>([]);
  const { requestMessage, sendMessage } = useEvents();

  const updateApiKey = useCallback((apiKey: string) => {
    sendMessage('save-chatgpt-infos', {
      apiKey,
    });
  }, []);

  const updateModel = useCallback((model: string) => {
    sendMessage('save-chatgpt-infos', {
      model,
    });
  }, []);

  const updateextraPrompt = useCallback((extraPrompt: string) => {
    sendMessage('save-chatgpt-infos', {
      extraPrompt,
    });
  }, []);

  useEffect(() => {
    requestMessage('load-chatgpt-infos', (args) => {
      setChatGPTInfos(args);
    });
    requestMessage('load-chatgpt-models', (args) => {
      setModels(args);
    });
  }, []);

  return {
    chatGPTInfos,
    models,
    updateApiKey,
    updateModel,
    updateextraPrompt,
  };
};

export default useChatGPT;
