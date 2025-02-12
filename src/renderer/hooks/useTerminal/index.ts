import { useCallback, useEffect, useState } from 'react';
import stripAnsi from 'strip-ansi';
import useEvents from '../useEvents';

const useTerminal = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [openTerminal, setOpenTerminal] = useState<boolean>(false);
  const { requestMessage, on } = useEvents();

  const formatMessage = (message: string) => {
    const cleaned = stripAnsi(message);

    // On remplace les retours chariot par des sauts de ligne
    const withNewlines = cleaned.replace(/\r/g, '\n');
    return withNewlines;
  };

  const appendMessage = useCallback((message: string) => {
    message = formatMessage(message);
    setMessages((_messages) => {
      if (_messages.length >= 30) {
        return [message];
      } else {
        return _messages.concat(message);
      }
    });
  }, []);

  const clearMessages = useCallback(() => setMessages([]), []);

  useEffect(() => {
    requestMessage('send-terminal', (message) => appendMessage(message));
  }, []);

  useEffect(() => {
    on('open-terminal', () => {
      setOpenTerminal((o) => {
        if (!o) return true;
        return o;
      });
    });
  }, []);

  return {
    messages,
    openTerminal,
    setOpenTerminal,
    clearMessages,
  };
};

export default useTerminal;
