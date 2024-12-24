import { useContext, useEffect, useState } from 'react';
import ChatGPTContext from 'renderer/contexts/ChatGPTContext';

const useChatGPTPage = () => {
  const {
    chatGPTInfos,
    models,
    updateApiKey,
    updateModel,
    updateExtratPrompt,
  } = useContext(ChatGPTContext);
  const [apiKeyState, setApiKeyState] = useState<string>(
    chatGPTInfos?.apiKey || ''
  );
  const [extratPromptState, setExtratPromptState] = useState<string>(
    chatGPTInfos?.extratPrompt || ''
  );

  useEffect(() => {
    setApiKeyState(
      typeof chatGPTInfos?.apiKey === 'undefined'
        ? apiKeyState
        : chatGPTInfos.apiKey
    );
    setExtratPromptState(
      typeof chatGPTInfos?.extratPrompt === 'undefined'
        ? extratPromptState
        : chatGPTInfos.extratPrompt
    );
  }, [chatGPTInfos]);

  return {
    ...chatGPTInfos,
    models,
    apiKeyState,
    extratPromptState,
    setApiKeyState,
    setExtratPromptState,
    updateApiKey,
    updateModel,
    updateExtratPrompt,
  };
};

export default useChatGPTPage;
