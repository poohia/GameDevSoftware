import { createContext } from 'react';

type TerminalContextType = {
  messages: string[];
  openTerminal: boolean;
  setOpenTerminal: (open: boolean) => void;
  clearMessages: () => void;
};

const TerminalContext = createContext<TerminalContextType>({
  messages: [],
  openTerminal: true,
  setOpenTerminal: () => {},
  clearMessages: () => {},
});

export default TerminalContext;
