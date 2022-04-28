import { ipcMain, dialog, BrowserWindow } from 'electron';
import fs from 'fs';
import { ElectronIpcMainEvent } from 'types';

export default class FolderPlugin {
  constructor(private mainWindow: BrowserWindow) {}
  static srcDirectory = '/src';
  static translationDirectory = `${FolderPlugin.srcDirectory}/translations`;
  static gameDevSoftwareDirectory = '/GameDevSoftware';
  static languageFile = `${FolderPlugin.srcDirectory}${FolderPlugin.gameDevSoftwareDirectory}/languages.json`;
  static constantFile = `${FolderPlugin.srcDirectory}${FolderPlugin.gameDevSoftwareDirectory}/constants.json`;

  static validePath(path: string) {
    let isValid = true;
    if (!fs.existsSync(`${path}${FolderPlugin.translationDirectory}`)) {
      isValid = false;
    } else if (!fs.existsSync(`${path}${FolderPlugin.translationDirectory}`)) {
      isValid = false;
    } else if (!fs.existsSync(`${path}${FolderPlugin.constantFile}`)) {
      isValid = false;
    }

    return isValid;
  }

  static saveGlobalPath(path: string) {
    // @ts-ignore
    global.path = path;
  }

  loadLastOpenDirectory = (event: ElectronIpcMainEvent, ...args: any[]) => {
    const path = args[0];
    if (FolderPlugin.validePath(path)) {
      event.reply('path-is-correct', path);
      FolderPlugin.saveGlobalPath(path);
    } else {
      event.reply('path-is-correct', null);
    }
  };

  openDirectory = (event: ElectronIpcMainEvent) => {
    dialog
      .showOpenDialog(this.mainWindow, {
        properties: ['openDirectory'],
      })
      .then((result) => {
        const path = result.filePaths[0];
        if (FolderPlugin.validePath(path)) {
          event.reply('set-path', path);
          event.reply('path-is-correct', path);
          FolderPlugin.saveGlobalPath(path);
        } else {
          event.reply('set-path', null);
        }
      });
  };

  init = () => {
    ipcMain.on('select-path', (event: Electron.IpcMainEvent) =>
      this.openDirectory(event as ElectronIpcMainEvent)
    );
    ipcMain.on('last-path', (event: Electron.IpcMainEvent, args: any[]) =>
      this.loadLastOpenDirectory(event as ElectronIpcMainEvent, args)
    );
  };
}
