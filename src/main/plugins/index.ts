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
  | 'envPlugin';

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
