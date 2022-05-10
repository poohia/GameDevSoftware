import { ipcMain } from 'electron';
import fs from 'fs';
import { ConstantObject, ElectronIpcMainEvent, ModuleArgs } from 'types';
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

  loadConstantsModule = (event: ElectronIpcMainEvent, arg: string) => {
    // @ts-ignore
    const { path } = global;
    const data = fs.readFileSync(
      `${path}${FolderPlugin.modulesDirectory}/${arg}/constants.json`
    );
    // @ts-ignore
    event.reply(`load-constants-module-${arg}`, JSON.parse(data));
  };

  saveConstantsModule = (
    event: ElectronIpcMainEvent,
    args: ModuleArgs<ConstantObject>
  ) => {
    // @ts-ignore
    const { path } = global;
    const { data, module } = args;
    fs.writeFileSync(
      `${path}${FolderPlugin.modulesDirectory}/${module}/constants.json`,
      JSON.stringify(data)
    );
    this.loadConstantsModule(event, module);
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
