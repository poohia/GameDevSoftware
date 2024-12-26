import { useContext, useEffect, useState } from 'react';
import ChatGPTContext from 'renderer/contexts/ChatGPTContext';

const useChatGPTPage = () => {
  const { chatGPTInfos, models, updateChatGPTInfos } =
    useContext(ChatGPTContext);
  const [apiKeyState, setApiKeyState] = useState<string>(
    chatGPTInfos?.apiKey || ''
  );
  const [extraPromptState, setExtraPromptState] = useState<string>(
    chatGPTInfos?.extraPrompt || ''
  );

  useEffect(() => {
    setApiKeyState(
      typeof chatGPTInfos?.apiKey === 'undefined'
        ? apiKeyState
        : chatGPTInfos.apiKey
    );
    setExtraPromptState(
      typeof chatGPTInfos?.extraPrompt === 'undefined'
        ? extraPromptState
        : chatGPTInfos.extraPrompt
    );
  }, [chatGPTInfos]);

  return {
    ...chatGPTInfos,
    models,
    apiKeyState,
    extraPromptState,
    setApiKeyState,
    setExtraPromptState,
    updateChatGPTInfos,
  };
};

export default useChatGPTPage;
