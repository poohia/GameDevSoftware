import { ipcMain } from 'electron';
import { ElectronIpcMainEvent } from 'types';
import FolderPlugin from './FolderPlugin';
import FileService from '../services/FileService';

export default class GameModulesPlugin {
  constructor() {}

  loadDynamicModules = (event: ElectronIpcMainEvent) => {
    // @ts-ignore
    const path = global.path;
    FileService.readdir(
      `${path}${FolderPlugin.modulesDirectory}`,
      'directory',
      (folders) => {
        event.reply(
          'load-game-modules',
          folders.map((folder) => `${folder}`)
        );
      }
    );
  };

  init = () => {
    ipcMain.on('load-game-modules', (event: Electron.IpcMainEvent) =>
      this.loadDynamicModules(event as ElectronIpcMainEvent)
    );
  };
}
