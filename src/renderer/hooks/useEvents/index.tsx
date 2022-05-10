import { useCallback, useContext } from 'react';
import { GameModuleContext } from 'renderer/pages/GameModulePage';
import { Channels, EventCallback } from 'types';

const useEvents = () => {
  const { module } = useContext(GameModuleContext);

  const requestMessage = useCallback(
    (chanel: Channels, callback: EventCallback) => {
      if (module) {
        console.log(`${chanel}-module`);
        window.electron.ipcRenderer.sendMessage(`${chanel}-module`, module);
        return on(`${chanel}-module-${module}`, callback);
      }
      sendMessage(chanel);
      return on(chanel, callback);
    },
    []
  );

  const sendMessage = useCallback((chanel: Channels, args?: any) => {
    if (module) {
      console.log(`${chanel}-module`);
      window.electron.ipcRenderer.sendMessage(`${chanel}-module`, {
        data: args,
        module,
      });
      return;
    }
    window.electron.ipcRenderer.sendMessage(chanel, args);
  }, []);

  const on = useCallback((chanel: Channels, callback: EventCallback) => {
    return window.electron.ipcRenderer.on(chanel, callback);
  }, []);

  const once = useCallback((chanel: Channels, callback: EventCallback) => {
    window.electron.ipcRenderer.once(chanel, callback);
  }, []);

  return {
    requestMessage,
    sendMessage,
    on,
    once,
  };
};

export default useEvents;
