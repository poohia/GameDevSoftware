import { ipcMain } from 'electron';
import pathModule from 'path';
import FileService from '../services/FileService';
import { ElectronIpcMainEvent } from 'types';
import FolderPlugin from './FolderPlugin';
import LogService from '../services/LogService';

export default class ThemePlugin {
  loadTheme = (event: ElectronIpcMainEvent) => {
    const { path } = global;
    LogService.Log(pathModule.join(path, FolderPlugin.themeFile));
    FileService.readJsonFile(
      pathModule.join(path, FolderPlugin.themeFile)
    ).then((data) => {
      event.reply('load-theme', data);
    });
  };

  setTheme = (event: ElectronIpcMainEvent, args: any) => {
    const { path } = global;
    FileService.writeJsonFile(
      pathModule.join(path, FolderPlugin.themeFile),
      args
    ).then(() => {
      this.loadTheme(event);
    });
  };

  init = () => {
    ipcMain.on('load-theme', (event: Electron.IpcMainEvent) => {
      this.loadTheme(event as ElectronIpcMainEvent);
    });
    ipcMain.on('set-theme', (event: Electron.IpcMainEvent, args: any) => {
      this.setTheme(event as ElectronIpcMainEvent, args);
    });
  };
}
