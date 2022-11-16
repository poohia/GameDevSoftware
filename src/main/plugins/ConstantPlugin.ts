import { ipcMain } from 'electron';
import fs from 'fs';
import async from 'async';
import { ConstantObject, ElectronIpcMainEvent, ModuleArgs } from 'types';
import FolderPlugin from './FolderPlugin';
import FileService from '../services/FileService';
import GameModulesPlugin from './GameModulesPlugin';

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

  loadConstantsModule = (event: ElectronIpcMainEvent, arg: string) => {
    const data = this.loadConstantsFile();

    event.reply(
      // @ts-ignore
      `load-constants-module-${arg}`,
      data.filter((d) => d.module && d.module === arg)
    );
  };

  saveConstantsModule = (
    event: ElectronIpcMainEvent,
    args: ModuleArgs<ConstantObject[]>
  ) => {
    // @ts-ignore
    const { path } = global;
    const { data } = args;
    this.saveConstants(event, data);
  };

  init = () => {
    ipcMain.on('load-constants', (event: Electron.IpcMainEvent) =>
      this.loadConstants(event as ElectronIpcMainEvent)
    );
    ipcMain.on('save-constants', (event: Electron.IpcMainEvent, args) =>
      this.saveConstants(event as ElectronIpcMainEvent, args)
    );
    ipcMain.on('load-constants-module', (event: Electron.IpcMainEvent, args) =>
      this.loadConstantsModule(event as ElectronIpcMainEvent, args)
    );
    ipcMain.on('save-constants-module', (event: Electron.IpcMainEvent, args) =>
      this.saveConstantsModule(event as ElectronIpcMainEvent, args)
    );
  };
}
