import { ipcMain } from 'electron';
import pathModule from 'path';
import FileService from '../services/FileService';
import { ElectronIpcMainEvent, GameDatabaseSave } from 'types';
import FolderPlugin from './FolderPlugin';

export default class SavesPlugin {
  loadSaves = (event: ElectronIpcMainEvent) => {
    const { path } = global;
    FileService.readJsonFile(
      pathModule.join(path, FolderPlugin.savesFile)
    ).then((data) => {
      event.reply('load-saves', data);
    });
  };

  setSaves = (event: ElectronIpcMainEvent, args: GameDatabaseSave[]) => {
    const { path } = global;
    FileService.writeJsonFile(
      pathModule.join(path, FolderPlugin.savesFile),
      args
    ).then(() => {
      this.loadSaves(event);
    });
  };

  init = () => {
    ipcMain.on('load-saves', (event: Electron.IpcMainEvent) => {
      this.loadSaves(event as ElectronIpcMainEvent);
    });
    ipcMain.on(
      'set-saves',
      (event: Electron.IpcMainEvent, args: GameDatabaseSave[]) => {
        this.setSaves(event as ElectronIpcMainEvent, args);
      }
    );
  };
}
