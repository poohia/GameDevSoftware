import { ipcMain } from 'electron';
import fs from 'fs';
import { ElectronIpcMainEvent } from 'types';
import FolderPlugin from './FolderPlugin';

export default class ApplicationPlugin {
  constructor() {}

  loadParams1 = (event: ElectronIpcMainEvent) => {
    event.reply('load-params-1', 'pong');
  };

  init = () => {
    ipcMain.on('load-params-1', (event: Electron.IpcMainEvent) =>
      this.loadParams1(event as ElectronIpcMainEvent)
    );
  };
}
