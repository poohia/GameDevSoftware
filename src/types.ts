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
export type ModuleComponentProps = {
  id: number;
  indexActive: number;
  appendTab: (
    menuItem: string,
    Component: React.FunctionComponent<ModuleComponentProps>
  ) => void;
  removeTab: (id: number) => void;
  removeCurrentTab: () => void;
};
