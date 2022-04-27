import { useCallback } from 'react';
import { Chanels, EventCallback } from 'types';

const useEvents = () => {
  const sendMessage = useCallback((chanels: Chanels, args?: any) => {
    window.electron.ipcRenderer.sendMessage(chanels, args);
  }, []);

  const on = useCallback((events: Chanels, callback: EventCallback) => {
    window.electron.ipcRenderer.on(events, callback);
  }, []);

  const once = useCallback((events: Chanels, callback: EventCallback) => {
    window.electron.ipcRenderer.once(events, callback);
  }, []);

  return {
    sendMessage,
    on,
    once,
  };
};

export default useEvents;
