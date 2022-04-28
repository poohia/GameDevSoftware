import { ipcMain } from 'electron';
import fs from 'fs';
import { ElectronIpcMainEvent } from 'types';
import FolderPlugin from './FolderPlugin';

export default class ConstantPlugin {
  constructor() {}

  loadConstants = (event: ElectronIpcMainEvent) => {
    // @ts-ignore
    const { path } = global;
    const data = fs.readFileSync(`${path}${FolderPlugin.constantFile}`);
    // @ts-ignore
    event.reply('load-constants', JSON.parse(data));
  };

  init = () => {
    ipcMain.on('load-constants', (event: Electron.IpcMainEvent) =>
      this.loadConstants(event as ElectronIpcMainEvent)
    );
  };
}
