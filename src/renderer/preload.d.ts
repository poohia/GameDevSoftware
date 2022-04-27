import { Chanels } from 'types';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        sendMessage: (chanel: Chanels, args?: any) => void;
        on(
          channel: Chanels,
          func: (...args: any) => void
        ): (() => void) | undefined;
        once(channel: Chanels, func: (...args: any) => void): void;
      };
    };
  }
}

export {};
