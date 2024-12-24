import { createContext } from 'react';
import { DropdownItemProps } from 'semantic-ui-react';
import { ChatGPTType } from 'types';

type ChatGPTContextType = {
  chatGPTInfos?: ChatGPTType;
  models?: DropdownItemProps[];
  updateApiKey: (apiKey: string) => void;
  updateModel: (model: string) => void;
  updateextraPrompt: (extraPrompt: string) => void;
};

const ChatGPTContext = createContext<ChatGPTContextType>({
  updateApiKey: () => {},
  updateModel: () => {},
  updateextraPrompt: () => {},
});

export default ChatGPTContext;
