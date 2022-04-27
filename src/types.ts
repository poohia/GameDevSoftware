export interface ElectronIpcMainEvent extends Electron.IpcMainEvent {
  reply: (chanel: Chanels, args?: any) => void;
}
export type Chanels =
  | 'set-path'
  | 'select-path'
  | 'last-path'
  | 'ipc-example'
  | 'path-is-correct';
export type EventCallback = (...args: any) => void;
