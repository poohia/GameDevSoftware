export interface ElectronIpcMainEvent extends Electron.IpcMainEvent {
  reply: (chanel: Channels, args?: any) => void;
}
export type Channels =
  // | string
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
  | 'prepare-platform'
  | 'build-platform'
  | 'emulate-platform'
  | 'load-game-modules'
  | 'load-constants'
  | 'load-translations'
  | 'set-game-locale'
  | 'load-game-locale'
  | 'load-assets'
  | 'load-game-object-types'
  | 'load-game-objects'
  | 'load-game-objects-all'
  | 'remove-game-object'
  | 'generate-tree-game-objects'
  | 'get-formulaire-game-object'
  | 'get-formulaire-game-object-all'
  | 'create-game-object'
  | 'get-game-object-value'
  | 'load-all-assets'
  | 'load-asset-base64'
  | 'load-all-game-objects'
  | 'load-scenes-types'
  | 'remove-scene'
  | 'get-formulaire-scene'
  | 'get-formulaire-scene-all'
  | 'create-scene'
  | 'get-scene-value'
  | 'load-scenes'
  | 'switch-theme'
  | 'load-first-scene'
  | 'set-first-scene'
  | 'load-env-development-vars'
  | 'write-env-development-vars'
  | 'load-env-production-vars'
  | 'write-env-production-vars'
  | 'set-env-default-values'
  | 'load-menus-views'
  | 'set-menu-view'
  | 'optimize-assets'
  | 'load-splashscreen-informations'
  | 'splashscreen-modify-slogan'
  | 'splashscreen-replace-brand-image'
  | 'splashscreen-replace-promotion-video'
  | 'load-fonts'
  | 'load-fonts-data'
  | 'append-fonts'
  | 'remove-font'
  | 'load-current-orientation'
  | 'set-current-orientation'
  | 'load-fontFamily'
  | 'set-fontFamily'
  | 'load-background'
  | 'set-background'
  | 'open-assets-folder'
  | 'open-scene-file'
  | 'open-gameobject-file'
  | 'load-chatgpt-infos'
  | 'save-chatgpt-infos'
  | 'load-chatgpt-models'
  | 'chatgpt-auto-translate'
  | 'chatgpt-translate-file'
  | 'chatgpt-generate-types'
  | 'send-log'
  | 'send-notification'
  | 'open-terminal'
  | 'send-terminal'
  | 'load-shortcutsfolder'
  | 'add-shortcutsfolder'
  | 'get-shortcutsfolder-typetarget'
  | 'add-typetarget-shortcutsfolder'
  | 'update-shortcutsfolder'
  | 'remove-shortcutsfolder'
  | 'set-saves'
  | 'load-saves'
  | 'open-cypress'
  | 'open-cypress-screenshots'
  | 'cypress-clear-screenshots';
export type Tables =
  | 'locale'
  | 'tabs'
  | 'tab-active'
  | 'last-path'
  | 'game-locale'
  | 'dark-mode'
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
  key: string;
  text: string;
  textComputer?: string;
  textMobile?: string;
  editable: boolean;
  deletable: boolean;
  module?: string;
};
export type TranslationObject = {
  [key: string]: Translation[];
};
export type ConstantValue = string | number | string[] | number[];
export type ConstantType = 'string' | 'number' | 'string[]' | 'number[]';
export type ConstantObject = {
  key: string;
  value: ConstantValue;
  valueMobile?: ConstantValue | null;
  description?: string;
  editable?: boolean;
  deletable?: boolean;
  module?: string;
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
export const MIME_TYPE_MAP: Record<string, string> = {
  // Images
  png: 'image/png',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml', // SVG ajouté !
  webp: 'image/webp',

  // Sons
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',

  // Vidéos
  mp4: 'video/mp4',
  webm: 'video/webm',
};
export type AssertFileValueType = {
  fileName: string;
  fileType: AssertAcceptedType;
  fileAlt?: string;
  content: any | string;
  editable: boolean;
  deletable: boolean;
  module?: string;
};
export type AssetType = {
  type: AssertAcceptedType;
  name: string;
  module?: string;
  alt?: string;
  editable: boolean;
  deletable: boolean;
};
export type AssetHeaderComponentProps = {
  onClickAdd: () => void;
};
export type ApplicationConfigJson = {
  name: string;
  build: {
    version: string;
    id: string;
    description?: string;
    ios: {
      CFBundleVersion: string;
    };
    android: {
      versionCode: string;
    };
  };
  author?: {
    email: string;
    link: string;
    name: string;
  };
  fullscreen?: boolean;
  statusbar?: {
    show?: boolean;
    overlaysWebView?: boolean;
    backgroundColor?: string;
    contentStyle?: 'default' | 'lightContent';
  };
  screenOrientation?:
    | 'any'
    | 'landscape'
    | 'landscape-primary'
    | 'landscape-secondary'
    | 'portrait'
    | 'portrait-primary'
    | 'portrait-secondary';
  splashscreen?: {
    splashscreenDelay?: number;
    fadeSplashscreen?: boolean;
    fadeSplashscreenDuration?: number;
  };
  description?: string;
  playStore: string;
  appStore: string;
  webStore: string;
  background?: string;
  fontFamily?: string;
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
  playStore: string;
  appStore: string;
  webStore: string;
};
export type ApplicationImageParams = {
  favicon: string;
  icon: string;
  iconForegroundAndroid: string;
  iconBackgroundAndroid: string;
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
  capacitor: string | null;
  yarn: string | null;
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
export type SceneObjectForm = GameObjectForm & {
  module: string;
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
  parent?: string | any;
};
export type CustomInputProps = {
  name: string;
  defaultValue?: any;
  type?: string | number;
  required?: boolean;
  multiple?: boolean;
  optional?: boolean;
  clearable?: boolean;
  onChange: (value: any) => void;
  onBlur?: () => void;
};
export type FieldMultipleComponentProps = Pick<
  CustomInputProps,
  'defaultValue' | 'required'
> & {
  keyValue: string;
  core: any;
  generateField: (field: FormField) => any;
};

export type SceneTypeJSON = ObjectGameTypeJSON & {
  module: string;
  firstScene?: boolean;
};
export type ActionOfScene = {
  [key: string]: any;
  _title: string;
  _scene: string;
};
export type SceneObject = {
  [key: string]: any;
  _id: number;
  _type: string;
  _title: string;
  _module: string;
  _actions: ActionOfScene[];
};
export type EnvObject = {
  [key: string]: string;
};
export type MenusViewsType = { module: string; path: string; used: boolean };

export type SplashscreenType = {
  brandImage: string;
  gamePromotionVideo: string;
  brandSlogan: string;
};

export type FontObject = {
  key: string;
  file: string;
  format: string;
};
export type FontDataObject = FontObject & {
  data: string;
};

export type typeAssetToOpen = 'root' | 'image' | 'video' | 'sound' | 'json';

export type ChatGPTType = {
  apiKey: string;
  model: string;
  extraPrompt?: string;
  translation?: {
    languageFileSplit?: number;
  };
};

export interface ShortcutsFolder {
  folderName: string;
  translations?: string[];
  assets?: string[];
  constants?: string[];
  gameObjects?: number[];
  scenes?: number[];
  editable?: boolean;
  deletable?: boolean;
}

export interface ShortcutsFolder {
  id: number;
}
export interface ShortcutsFolderTargetType {
  id: any;
  typeTarget:
    | 'translations'
    | 'constants'
    | 'assets'
    | 'gameObjects'
    | 'scenes';
}
export type GameDatabase = {
  currentScene: number;
  history: number[];
  [key: string]: any;
};
export type GameDatabaseSave = {
  title?: string;
  date: string;
  game: GameDatabase;
  id: number;
  isPreset?: boolean;
};
