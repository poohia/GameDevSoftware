import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { Channels } from '../types';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage(chanel: Channels, args?: any[]) {
      ipcRenderer.send(chanel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      // const validChannels = ['ipc-example', 'directory'];
      // if (validChannels.includes(channel)) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
      // }

      // return undefined;
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      // const validChannels = ['ipc-example', 'directory'];
      // if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
      // }
    },
  },
});

process.once('loaded', () => {
  window.addEventListener('message', (evt) => {
    if (evt.data.type === 'select-dirs') {
      ipcRenderer.send('select-dirs');
    }
  });
});
