import { ipcMain } from 'electron';
import { ElectronIpcMainEvent, EnvObject } from 'types';
import FileService from '../services/FileService';
import FolderPlugin from './FolderPlugin';

export default class EnvPlugin {
  loadEnvDevelopmentVars = (event: ElectronIpcMainEvent) => {
    // @ts-ignore
    const { path } = global;
    FileService.readJsonFile(
      `${path}${FolderPlugin.envFolder}${FolderPlugin.envFiles[0]}`
    ).then((envs) => {
      event.reply('load-env-development-vars', {
        ENV: 'development',
        ...envs,
      });
    });
  };

  writeEnvDevelopmentVars = (
    event: ElectronIpcMainEvent,
    envs: EnvObject[]
  ) => {
    // @ts-ignore
    const { path } = global;
    FileService.writeJsonFile(
      `${path}${FolderPlugin.envFolder}${FolderPlugin.envFiles[0]}`,
      envs
    ).then(() => {
      this.loadEnvDevelopmentVars(event);
    });
  };

  loadEnvProductionVars = (event: ElectronIpcMainEvent) => {
    // @ts-ignore
    const { path } = global;
    FileService.readJsonFile(
      `${path}${FolderPlugin.envFolder}${FolderPlugin.envFiles[1]}`
    ).then((envs) => {
      event.reply('load-env-production-vars', {
        ENV: 'production',
        ...envs,
      });
    });
  };

  writeEnvProductionVars = (event: ElectronIpcMainEvent, envs: EnvObject[]) => {
    // @ts-ignore
    const { path } = global;
    FileService.writeJsonFile(
      `${path}${FolderPlugin.envFolder}${FolderPlugin.envFiles[1]}`,
      envs
    ).then(() => {
      this.loadEnvProductionVars(event);
    });
  };

  setDefaultValues = (event: ElectronIpcMainEvent) => {
    // @ts-ignore
    const { path } = global;
    FileService.readJsonFile(
      `${path}${FolderPlugin.envFolder}${FolderPlugin.envFiles[2]}`
    ).then((envs) => {
      this.writeEnvProductionVars(event, envs);
      this.writeEnvDevelopmentVars(event, envs);
    });
  };

  init = () => {
    ipcMain.on('load-env-development-vars', (event: Electron.IpcMainEvent) =>
      this.loadEnvDevelopmentVars(event as ElectronIpcMainEvent)
    );
    ipcMain.on(
      'write-env-development-vars',
      (event: Electron.IpcMainEvent, args: any[]) =>
        this.writeEnvDevelopmentVars(event as ElectronIpcMainEvent, args)
    );
    ipcMain.on('load-env-production-vars', (event: Electron.IpcMainEvent) =>
      this.loadEnvProductionVars(event as ElectronIpcMainEvent)
    );
    ipcMain.on(
      'write-env-production-vars',
      (event: Electron.IpcMainEvent, args: any[]) =>
        this.writeEnvProductionVars(event as ElectronIpcMainEvent, args)
    );
    ipcMain.on('set-env-default-values', (event: Electron.IpcMainEvent) =>
      this.setDefaultValues(event as ElectronIpcMainEvent)
    );
  };
}
