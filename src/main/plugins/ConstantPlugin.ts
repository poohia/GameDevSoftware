import { ipcMain } from 'electron';
import fs from 'fs';
import { ConstantObject, ElectronIpcMainEvent } from 'types';
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

  saveConstants = (event: ElectronIpcMainEvent, args: ConstantObject) => {
    // @ts-ignore
    const { path } = global;
    fs.writeFileSync(
      `${path}${FolderPlugin.constantFile}`,
      JSON.stringify(args)
    );
    this.loadConstants(event);
  };

  init = () => {
    ipcMain.on('load-constants', (event: Electron.IpcMainEvent) =>
      this.loadConstants(event as ElectronIpcMainEvent)
    );
    ipcMain.on('save-constants', (event: Electron.IpcMainEvent, args) =>
      this.saveConstants(event as ElectronIpcMainEvent, args)
    );
  };
}
