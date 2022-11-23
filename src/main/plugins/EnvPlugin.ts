import { ipcMain } from 'electron';
import { ElectronIpcMainEvent, EnvObject } from 'types';
import FileService from '../services/FileService';
import FolderPlugin from './FolderPlugin';

export default class EnvPlugin {
  loadEnvDevelopmentVars = (event: ElectronIpcMainEvent) => {
    // @ts-ignore
    const { path } = global;
    FileService.readFile(`${path}${FolderPlugin.envFiles[0]}`).then((envs) => {
      event.reply('load-env-development-vars', this.deserializeEnvs(envs));
    });
  };

  writeEnvDevelopmentVars = (
    event: ElectronIpcMainEvent,
    envs: EnvObject[]
  ) => {
    // @ts-ignore
    const { path } = global;
    FileService.writeFile(
      `${path}${FolderPlugin.envFiles[0]}`,
      this.serializeEnvs(envs)
    ).then(() => {
      event.reply('load-env-development-vars', envs);
    });
  };

  loadEnvProductionVars = (event: ElectronIpcMainEvent) => {
    // @ts-ignore
    const { path } = global;
    FileService.readFile(`${path}${FolderPlugin.envFiles[1]}`).then((envs) => {
      event.reply('load-env-production-vars', this.deserializeEnvs(envs));
    });
  };

  writeEnvProductionVars = (event: ElectronIpcMainEvent, envs: EnvObject[]) => {
    // @ts-ignore
    const { path } = global;
    FileService.writeFile(
      `${path}${FolderPlugin.envFiles[1]}`,
      this.serializeEnvs(envs)
    ).then(() => {
      event.reply('load-env-production-vars', envs);
    });
  };

  private deserializeEnvs = (envs: string): EnvObject[] => {
    const finalEnvs: EnvObject[] = [];
    const envsSplit = envs.split('\n');
    envsSplit.forEach((env) => {
      const envSplit = env.split('=');
      finalEnvs.push({
        key: envSplit[0].replace('REACT_APP_', ''),
        value: envSplit[1],
      });
    });
    return finalEnvs;
  };

  private serializeEnvs = (envs: EnvObject[]): string => {
    let finalEnvs = '';
    envs.forEach((env, i) => {
      if (i === envs.length - 1) {
        finalEnvs += `REACT_APP_${env.key}=${env.value}`;
      } else {
        finalEnvs += `REACT_APP_${env.key}=${env.value}\n`;
      }
    });
    return finalEnvs;
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
  };
}
