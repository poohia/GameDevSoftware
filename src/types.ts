export interface ElectronIpcMainEvent extends Electron.IpcMainEvent {
  reply: (chanel: Channels, args?: any) => void;
}
export type Channels =
  | 'set-path'
  | 'select-path'
  | 'last-path'
  | 'ipc-example'
  | 'path-is-correct'
  | 'languages-authorized'
  | 'load-translations'
  | 'save-translations'
  | 'set-languages'
  | 'remove-language'
  | 'load-constants';
export type EventCallback = (...args: any) => void;
export type PageProps = {
  appendTab?: (
    menuItem: string,
    Component: React.FunctionComponent<PageProps>
  ) => void;
};
export type Translation = {
  [key: string]: string;
};
export type TranslationObject = {
  [key: string]: Translation;
};
export type ConstantObject = {};
