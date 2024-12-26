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

  const updateChatGPTInfos = useCallback(
    (chatGPTInfos: Partial<ChatGPTType>) => {
      sendMessage('save-chatgpt-infos', chatGPTInfos);
    },
    []
  );

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
    updateChatGPTInfos,
  };
};

export default useChatGPT;
