import { Channels } from 'types';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        requestMessage: (
          channel: Channels,
          func: (...args: any) => void
        ) => void;
        sendMessage: (channel: Channels, args?: any) => void;
        on(channel: Channels, func: (...args: any) => void): () => void;
        once(channel: Channels, func: (...args: any) => void): void;
      };
    };
  }
}

export {};
