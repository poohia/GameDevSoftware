import { ipcMain } from 'electron';
import pathModule from 'path';
import FileService from '../services/FileService';
import { CacheItem, ElectronIpcMainEvent } from 'types';
import FolderPlugin from './FolderPlugin';

export default class CachePlugin {
  loadCache = (event: ElectronIpcMainEvent) => {
    const { path } = global;
    const cacheFilePath = pathModule.join(path, FolderPlugin.cacheFile);

    FileService.createFileIfNotExist(cacheFilePath, '[]')
      .then(() => FileService.readJsonFile<CacheItem[]>(cacheFilePath))
      .then((data) => {
        event.reply('load-cache', Array.isArray(data) ? data : []);
      });
  };

  setCache = (event: ElectronIpcMainEvent, args: CacheItem[]) => {
    const { path } = global;
    FileService.writeJsonFile(
      pathModule.join(path, FolderPlugin.cacheFile),
      args
    ).then(() => {
      this.loadCache(event);
    });
  };

  init = () => {
    ipcMain.on('load-cache', (event: Electron.IpcMainEvent) => {
      this.loadCache(event as ElectronIpcMainEvent);
    });

    ipcMain.on(
      'set-cache',
      (event: Electron.IpcMainEvent, args: CacheItem[]) => {
        this.setCache(event as ElectronIpcMainEvent, args);
      }
    );
  };
}
