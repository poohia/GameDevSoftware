import { ipcMain } from 'electron';
import { ElectronIpcMainEvent } from 'types';
import FolderPlugin from './FolderPlugin';
import FileService from '../services/FileService';

export default class GameModulesPlugin {
  constructor() {}

  static loadDynamicModulesName = (): Promise<string[]> =>
    new Promise((resolve) => {
      // @ts-ignore
      const path = global.path;
      FileService.readdir(
        `${path}${FolderPlugin.modulesDirectory}`,
        'directory'
      ).then((folders) => {
        resolve(folders);
      });
    });

  loadDynamicModules = (event: ElectronIpcMainEvent) => {
    GameModulesPlugin.loadDynamicModulesName().then((folders) => {
      event.reply('load-game-modules', folders);
    });
  };

  init = () => {
    ipcMain.on('load-game-modules', (event: Electron.IpcMainEvent) =>
      this.loadDynamicModules(event as ElectronIpcMainEvent)
    );
  };
}
