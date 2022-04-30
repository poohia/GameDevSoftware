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
  | 'load-constants'
  | 'save-constants'
  | 'load-assets';
export type Tables = 'locale' | 'tabs' | 'tab-active';
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
export type ConstantValue = string | number | string[] | number[];
export type ConstantType = 'string' | 'number' | 'string[]' | 'number[]';
export type ConstantObject = {
  [key: string]: ConstantValue;
};
export type TabType = {
  id: number;
  index: number;
  menuItemKey: string;
  menuItem: any;
  render?: () => React.ReactNode;
};
export type TabActiveType = {
  index: number;
  id: number;
};
export type TabDatabaseType = {
  menuItem: string;
  component: string;
};
export type AssertAcceptedType = 'image' | 'sound';
export type AssetType = {
  type: AssertAcceptedType;
  name: string;
};
