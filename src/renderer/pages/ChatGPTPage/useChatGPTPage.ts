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
  const [temperatureState, setTemperatureState] = useState<string>(
    typeof chatGPTInfos?.temperature === 'number'
      ? String(chatGPTInfos.temperature)
      : '1'
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
    setTemperatureState(
      typeof chatGPTInfos?.temperature === 'undefined'
        ? temperatureState
        : String(chatGPTInfos.temperature)
    );
  }, [chatGPTInfos]);

  return {
    ...chatGPTInfos,
    models,
    apiKeyState,
    extraPromptState,
    temperatureState,
    setApiKeyState,
    setExtraPromptState,
    setTemperatureState,
    updateChatGPTInfos,
  };
};

export default useChatGPTPage;
