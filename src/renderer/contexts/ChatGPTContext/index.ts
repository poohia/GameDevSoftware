import { createContext } from 'react';
import { DropdownItemProps } from 'semantic-ui-react';
import { ChatGPTType } from 'types';

type ChatGPTContextType = {
  chatGPTInfos?: Partial<ChatGPTType>;
  models?: DropdownItemProps[];
  updateChatGPTInfos: (chatGPTInfos: Partial<ChatGPTType>) => void;
};

const ChatGPTContext = createContext<ChatGPTContextType>({
  updateChatGPTInfos: () => {},
});

export default ChatGPTContext;
