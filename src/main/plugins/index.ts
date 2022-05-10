import { BrowserWindow } from 'electron';
import ApplicationPlugin from './ApplicationPlugin';
import AssetPlugin from './AssetPlugin';
import ConstantPlugin from './ConstantPlugin';
import FolderPlugin from './FolderPlugin';
import GameModulesPlugin from './GameModulesPlugin';
import TranslationPlugin from './TranslationPlugin';

type Plugins =
  | 'folderPlugin'
  | 'applicationPlugin'
  | 'translationPlugin'
  | 'constantPlugin'
  | 'assetPlugin'
  | 'gameModulePlugin';

export default class PluginsContainer {
  private _folderPlugin;
  private _applicationPlugin;
  private _translationPlugin;
  private _constantPlugin;
  private _assetPlugin;
  private _gameModulePlugin;

  constructor(mainWindow: BrowserWindow) {
    this._folderPlugin = new FolderPlugin(mainWindow);
    this._applicationPlugin = new ApplicationPlugin(mainWindow);
    this._translationPlugin = new TranslationPlugin();
    this._constantPlugin = new ConstantPlugin();
    this._assetPlugin = new AssetPlugin(mainWindow);
    this._gameModulePlugin = new GameModulesPlugin();
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
