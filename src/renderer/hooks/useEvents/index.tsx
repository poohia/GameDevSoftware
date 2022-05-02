import { useCallback } from 'react';
import { Channels, EventCallback } from 'types';

const useEvents = () => {
  const requestMessage = useCallback(
    (events: Channels, callback: EventCallback) => {
      return window.electron.ipcRenderer.requestMessage(events, callback);
    },
    []
  );

  const sendMessage = useCallback((chanels: Channels, args?: any) => {
    window.electron.ipcRenderer.sendMessage(chanels, args);
  }, []);

  const on = useCallback((events: Channels, callback: EventCallback) => {
    return window.electron.ipcRenderer.on(events, callback);
  }, []);

  const once = useCallback((events: Channels, callback: EventCallback) => {
    window.electron.ipcRenderer.once(events, callback);
  }, []);

  return {
    requestMessage,
    sendMessage,
    on,
    once,
  };
};

export default useEvents;
