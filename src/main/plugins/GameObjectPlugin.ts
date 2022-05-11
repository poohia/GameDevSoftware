import { ipcMain } from 'electron';
import fs from 'fs';
import { ElectronIpcMainEvent } from 'types';
import FolderPlugin from './FolderPlugin';

export default class GameObjectPlugin {
  constructor() {}

  loadGameObjectTypes = (event: ElectronIpcMainEvent) => {
    // @ts-ignore
    const { path } = global;
    const data = fs.readFileSync(`${path}${FolderPlugin.constantFile}`);
    // @ts-ignore
    event.reply('load-game-object-types', JSON.parse(data));
  };

  init = () => {
    ipcMain.on('load-game-object-types', (event: Electron.IpcMainEvent) =>
      this.loadGameObjectTypes(event as ElectronIpcMainEvent)
    );
  };
}
