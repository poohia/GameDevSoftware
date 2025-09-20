import { ipcMain } from 'electron';
import fs from 'fs';
import { ConstantObject, ElectronIpcMainEvent } from 'types';
import FolderPlugin from './FolderPlugin';
import FileService from '../services/FileService';

export default class ConstantPlugin {
  constructor() {}

  loadConstantsFile = (): Promise<ConstantObject[]> => {
    const { path } = global;
    return FileService.readJsonFile(`${path}${FolderPlugin.constantFile}`);
  };

  loadConstants = async (event: ElectronIpcMainEvent) => {
    const data = await this.loadConstantsFile();
    event.reply('load-constants', data);
  };

  saveConstants = (event: ElectronIpcMainEvent, args: ConstantObject[]) => {
    const { path } = global;
    fs.writeFileSync(
      `${path}${FolderPlugin.constantFile}`,
      JSON.stringify(args, null, 4)
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
