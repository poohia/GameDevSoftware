import { ipcMain } from 'electron';
import fs from 'fs';
import { ConstantObject, ElectronIpcMainEvent } from 'types';
import FolderPlugin from './FolderPlugin';

export default class ConstantPlugin {
  constructor() {}

  loadConstantsFile = (): ConstantObject[] => {
    // @ts-ignore
    const { path } = global;
    // @ts-ignore
    return JSON.parse(fs.readFileSync(`${path}${FolderPlugin.constantFile}`));
  };

  loadConstants = (event: ElectronIpcMainEvent) => {
    const data = this.loadConstantsFile();
    event.reply('load-constants', data);
  };

  saveConstants = (event: ElectronIpcMainEvent, args: ConstantObject[]) => {
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
