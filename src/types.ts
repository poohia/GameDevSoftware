export interface ElectronIpcMainEvent extends Electron.IpcMainEvent {
  reply: (chanel: Channels, args?: any) => void;
}
export type Channels =
  | string
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
  | 'load-assets'
  | 'upload-file'
  | 'delete-file'
  | 'select-multiple-files'
  | 'get-asset-information'
  | 'load-params-identity'
  | 'set-params-identity'
  | 'load-params-image'
  | 'replace-params-image'
  | 'load-platforms'
  | 'remove-platform'
  | 'add-platform'
  | 'toggle-project'
  | 'projected-started'
  | 'get-softwares-info'
  | 'build-platform'
  | 'emulate-platform'
  | 'load-game-modules'
  | 'load-constants-module'
  | 'load-translations-module'
  | 'load-assets-module'
  | 'load-game-object-types'
  | 'load-game-objects'
  | 'load-all-translations'
  | 'remove-game-object'
  | 'get-formulaire-game-object'
  | 'create-game-object'
  | 'get-game-object-value'
  | 'load-all-constants';
export type Tables =
  | 'locale'
  | 'tabs'
  | 'tab-active'
  | 'last-path'
  | 'game-locale'
  | string;
export type EventCallback = (...args: any) => void;
export type PageProps = {
  id: number;
  title: string;
  appendTab: (
    menuItem: string,
    Component: React.FunctionComponent<PageProps>,
    _saveTabs?: boolean,
    componentName?: string
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
  key: string;
  value: ConstantValue;
  description?: string;
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
  props?: any;
};
export type TabDatabaseType = {
  menuItem: string;
  component: string;
};
export type AssertAcceptedType = 'image' | 'sound' | 'video' | 'json';
export type AssertFileValueType = {
  fileName: string;
  fileType: AssertAcceptedType;
  content: any | string;
};
export type AssetType = {
  type: AssertAcceptedType;
  name: string;
};
export type AssetHeaderComponentProps = {
  onClickAdd: () => void;
};
export type ApplicationIdentityParams = {
  package: string;
  version: string;
  buildVersion: string;
  name: string;
  description?: string;
  authorEmail: string;
  authorName: string;
  authorWebSite: string;
};
export type ApplicationImageParams = {
  favicon: string;
  icon: string;
  splashscreen: string;
};
export type PlatformsParams = {
  android: boolean;
  ios: boolean;
  electron: boolean;
  browser: boolean;
  ['cordova-electron']?: boolean;
};
export type SoftwaresInfo = {
  git: string | null;
  node: string | null;
  npm: string | null;
  cordova: string | null;
  ['cordova-res']: string | null;
};
export type ModuleArgs<T = any> = {
  data: T;
  module: string;
};
export type ObjectGameTypeJSON = {
  file: string;
  type: string;
};
export type GameObject = {
  [key: string]: any;
  _id: number;
  _type: string;
  _title: string;
};
export type GameObjectForm = {
  name: string;
  type: string;
  description: string;
  core: {
    [key: string]: any;
  };
};
export type FormFieldType =
  | 'string'
  | 'number'
  | 'image'
  | 'color'
  | 'translation'
  | string;
export type FormField = {
  key: string;
  core: FormFieldType | Array<FormFieldType> | FormField;
  multiple?: boolean;
  optional?: boolean;
  label?: string;
  description?: string;
  parent?: string;
  onChange?: (core: any, key: string, v: any, parent?: string) => void;
};
export type CustomInputProps = {
  defaultValue?: any;
  type?: string | number;
  onChange: (value: any) => void;
};
