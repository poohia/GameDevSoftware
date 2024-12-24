import { useContext, useEffect, useState } from 'react';
import ChatGPTContext from 'renderer/contexts/ChatGPTContext';

const useChatGPTPage = () => {
  const { chatGPTInfos, models, updateApiKey, updateModel, updateextraPrompt } =
    useContext(ChatGPTContext);
  const [apiKeyState, setApiKeyState] = useState<string>(
    chatGPTInfos?.apiKey || ''
  );
  const [extraPromptState, setextraPromptState] = useState<string>(
    chatGPTInfos?.extraPrompt || ''
  );

  useEffect(() => {
    setApiKeyState(
      typeof chatGPTInfos?.apiKey === 'undefined'
        ? apiKeyState
        : chatGPTInfos.apiKey
    );
    setextraPromptState(
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
    setextraPromptState,
    updateApiKey,
    updateModel,
    updateextraPrompt,
  };
};

export default useChatGPTPage;
