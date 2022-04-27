export interface ElectronIpcMainEvent extends Electron.IpcMainEvent {
  reply: (chanel: Chanels, args?: any) => void;
}
export type Chanels =
  | 'set-path'
  | 'select-path'
  | 'last-path'
  | 'ipc-example'
  | 'path-is-correct'
  | 'languages-authorized'
  | 'load-translations'
  | 'save-translations';
export type EventCallback = (...args: any) => void;
export type PageProps = {
  appendTab?: (
    menuItem: string,
    Component: React.FunctionComponent<PageProps>
  ) => void;
};
