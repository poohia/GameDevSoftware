import { ipcMain } from 'electron';
import fs from 'fs';
import { ConstantObject, ElectronIpcMainEvent } from 'types';
import FolderPlugin from './FolderPlugin';

export default class AssetPlugin {
  constructor() {}

  loadAssets = (event: ElectronIpcMainEvent) => {
    // @ts-ignore
    const { path } = global;
    const data = fs.readFileSync(`${path}${FolderPlugin.assetFile}`);
    // @ts-ignore
    event.reply('load-assets', JSON.parse(data));
  };

  init = () => {
    ipcMain.on('load-assets', (event: Electron.IpcMainEvent) =>
      this.loadAssets(event as ElectronIpcMainEvent)
    );
  };
}
