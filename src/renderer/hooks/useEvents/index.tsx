import { useCallback, useContext } from 'react';
import GameModuleContext from 'renderer/contexts/GameModuleContext';
import { Channels, EventCallback } from 'types';

const useEvents = () => {
  const { module } = useContext(GameModuleContext);

  const requestMessage = useCallback(
    (chanel: Channels, callback: EventCallback) => {
      if (module) {
        console.log(`${chanel}-module`);
        //@ts-ignore
        window.electron.ipcRenderer.sendMessage(`${chanel}-module`, module);
        //@ts-ignore
        return on(`${chanel}-module-${module}`, callback);
      }
      console.log(chanel);
      sendMessage(chanel);
      return on(chanel, callback);
    },
    []
  );

  const sendMessage = useCallback((chanel: Channels, args?: any) => {
    if (module) {
      console.log(`${chanel}-module`, args);
      //@ts-ignore
      window.electron.ipcRenderer.sendMessage(`${chanel}-module`, {
        data: args,
        module,
      });
      return;
    }
    console.log(chanel, args);
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
