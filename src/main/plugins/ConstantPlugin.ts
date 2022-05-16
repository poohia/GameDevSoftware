import { ipcMain } from 'electron';
import fs from 'fs';
import async from 'async';
import { ConstantObject, ElectronIpcMainEvent, ModuleArgs } from 'types';
import FolderPlugin from './FolderPlugin';
import FileService from '../services/FileService';
import GameModulesPlugin from './GameModulesPlugin';

export default class ConstantPlugin {
  constructor() {}

  loadConstants = (event: ElectronIpcMainEvent) => {
    // @ts-ignore
    const { path } = global;
    FileService.readJsonFile(`${path}${FolderPlugin.constantFile}`).then(
      (data) => {
        event.reply('load-constants', data);
      }
    );
    // @ts-ignore
  };

  saveConstants = (event: ElectronIpcMainEvent, args: ConstantObject[]) => {
    // @ts-ignore
    const { path } = global;
    fs.writeFileSync(
      `${path}${FolderPlugin.constantFile}`,
      JSON.stringify(args)
    );
    this.loadConstants(event);
    this.loadAllConstants(event);
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
    args: ModuleArgs<ConstantObject[]>
  ) => {
    // @ts-ignore
    const { path } = global;
    const { data, module } = args;
    fs.writeFileSync(
      `${path}${FolderPlugin.modulesDirectory}/${module}/constants.json`,
      JSON.stringify(data)
    );
    this.loadConstantsModule(event, module);
    this.loadAllConstants(event);
  };

  loadAllConstants = (event: ElectronIpcMainEvent) => {
    // @ts-ignore
    const { path } = global;
    let finalData: any = [];
    GameModulesPlugin.loadDynamicModulesName().then((modules) => {
      async
        .each(modules, (module, callback) => {
          FileService.readJsonFile(
            `${path}${FolderPlugin.modulesDirectory}/${module}/constants.json`
          ).then((data: any) => {
            finalData = finalData.concat([...data]);
            callback();
          });
        })
        .then(() => {
          FileService.readJsonFile(`${path}${FolderPlugin.constantFile}`).then(
            (data) => {
              event.reply('load-all-constants', finalData.concat([...data]));
            }
          );
        });
    });
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
    ipcMain.on('load-all-constants', (event) => {
      this.loadAllConstants(event as ElectronIpcMainEvent);
    });
  };
}
