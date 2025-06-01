import { ipcMain, shell } from 'electron';
import pathModule from 'path';
import { ElectronIpcMainEvent } from 'types';
import { exec } from '../util';
import FolderPlugin from './FolderPlugin';
import FileService from '../services/FileService';

export default class CypressPlugin {
  openCypress = (_event: ElectronIpcMainEvent) => {
    // @ts-ignore
    const path = global.path;
    exec(
      `npx cypress open`,
      { cwd: pathModule.join(path, FolderPlugin.cypressDirectory) },
      (error) => {}
    );
  };

  openCypressScreenshots = (_event: ElectronIpcMainEvent) => {
    // @ts-ignore
    const path = global.path;
    const pathScreenshots = pathModule.join(
      path,
      FolderPlugin.cypressScreenshotsDirectory
    );
    shell.openPath(pathScreenshots);
  };

  clearScreenshots = (event: ElectronIpcMainEvent) => {
    // @ts-ignore
    const path = global.path;
    const pathScreenshots = pathModule.join(
      path,
      FolderPlugin.cypressScreenshotsDirectory
    );
    FileService.clearDirectory(pathScreenshots).finally(() => {
      event.reply('cypress-clear-screenshots');
    });
  };

  init = () => {
    ipcMain.on('open-cypress', (event: Electron.IpcMainEvent) => {
      this.openCypress(event as ElectronIpcMainEvent);
    });
    ipcMain.on('open-cypress-screenshots', (event: Electron.IpcMainEvent) => {
      this.openCypressScreenshots(event as ElectronIpcMainEvent);
    });
    ipcMain.on('cypress-clear-screenshots', (event: Electron.IpcMainEvent) => {
      this.clearScreenshots(event as ElectronIpcMainEvent);
    });
  };
}
