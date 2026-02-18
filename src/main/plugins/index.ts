import { BrowserWindow } from 'electron';
import ApplicationPlugin from './ApplicationPlugin';
import AssetPlugin from './AssetPlugin';
import ConstantPlugin from './ConstantPlugin';
import FolderPlugin from './FolderPlugin';
import GameModulesPlugin from './GameModulesPlugin';
import TranslationPlugin from './TranslationPlugin';
import GameObjectPlugin from './GameObjectPlugin';
import DarkModePlugin from './DarkModePlugin';
import ScenePlugin from './ScenePlugin';
import EnvPlugin from './EnvPlugin';
import WatchPlugin from './WatchPlugin';
import FontPlugin from './FontPlugin';
import ChatGPTPlugin from './ChatGPTPlugin';
import ShortcutsFoldersPlugin from './ShortcutsFoldersPlugin';
import SavesPlugin from './SavesPlugin';
import CypressPlugin from './CypressPlugin';
import PagesPlugin from './PagesPlugin';
import ThemePlugin from './ThemePlugin';
import CachePlugin from './CachePlugin';

type Plugins =
  | 'folderPlugin'
  | 'applicationPlugin'
  | 'translationPlugin'
  | 'constantPlugin'
  | 'assetPlugin'
  | 'gameModulePlugin'
  | 'gameObjectPlugin'
  | 'scenePlugin'
  | 'darkModePlugin'
  | 'envPlugin'
  | 'watchPlugin'
  | 'fontPlugin'
  | 'chatgptPlugin'
  | 'shortcutsFoldersPlugin'
  | 'savesPlugin'
  | 'cypressPlugin'
  | 'pagesPlugin'
  | 'themePlugin'
  | 'cachePlugin';

export default class PluginsContainer {
  private _folderPlugin;
  private _applicationPlugin;
  private _translationPlugin;
  private _constantPlugin;
  private _assetPlugin;
  private _gameModulePlugin;
  private _gameObjectPlugin;
  private _scenePlugin;
  private _darkModePlugin;
  private _envPlugin;
  private _watchPlugin;
  private _fontPlugin;
  private _chatgptPlugin;
  private _shortcutsFoldersPlugin;
  private _savesPlugin;
  private _cypressPlugin;
  private _pagesPlugin;
  private _themePlugin;
  private _cachePlugin;

  constructor(mainWindow: BrowserWindow) {
    this._folderPlugin = new FolderPlugin(mainWindow);
    this._applicationPlugin = new ApplicationPlugin(mainWindow);
    this._translationPlugin = new TranslationPlugin();
    this._constantPlugin = new ConstantPlugin();
    this._assetPlugin = new AssetPlugin(mainWindow);
    this._gameModulePlugin = new GameModulesPlugin();
    this._gameObjectPlugin = new GameObjectPlugin();
    this._scenePlugin = new ScenePlugin();
    this._darkModePlugin = new DarkModePlugin();
    this._envPlugin = new EnvPlugin();
    this._watchPlugin = new WatchPlugin(mainWindow);
    this._fontPlugin = new FontPlugin(mainWindow);
    this._chatgptPlugin = new ChatGPTPlugin();
    this._shortcutsFoldersPlugin = new ShortcutsFoldersPlugin();
    this._savesPlugin = new SavesPlugin();
    this._cypressPlugin = new CypressPlugin();
    this._pagesPlugin = new PagesPlugin();
    this._themePlugin = new ThemePlugin();
    this._cachePlugin = new CachePlugin();
  }

  init() {
    Object.keys(this).map((key: string) => {
      if (key.startsWith('_') && key.includes('Plugin')) {
        this[key].init();
      }
    });
  }

  get(plugin: Plugins) {
    return this[`_${plugin}`];
  }
}
