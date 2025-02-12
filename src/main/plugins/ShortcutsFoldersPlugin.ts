import pathModule from 'path';
import FileService from '../services/FileService';
import FolderPlugin from './FolderPlugin';
import { ElectronIpcMainEvent, ShortcutsFolder } from 'types';
import { ipcMain } from 'electron';

export default class ShortcutsFoldersPlugin {
  private writeFile(data: ShortcutsFolder[]) {
    // @ts-ignore
    const { path } = global;

    return FileService.writeJsonFile<ShortcutsFolder[]>(
      pathModule.join(path, FolderPlugin.shortcutsFolderFile),
      data
    );
  }

  private openFile() {
    // @ts-ignore
    const { path } = global;

    return FileService.readJsonFile<ShortcutsFolder[]>(
      pathModule.join(path, FolderPlugin.shortcutsFolderFile)
    );
  }

  private setShortcutsFolders = (
    event: ElectronIpcMainEvent,
    data: ShortcutsFolder[]
  ) => {
    this.writeFile(data).then(() => {
      this.loadShortcutsFolders(event);
    });
  };

  addShortCutsFolder = (
    event: ElectronIpcMainEvent,
    data: Omit<ShortcutsFolder, 'id'>
  ) => {
    this.openFile().then((results) => {
      const nextId =
        results.reduce(
          (max, item) => (item.id > max.id ? item : max),
          results[0]
        )?.id || 0;
      this.setShortcutsFolders(
        event,
        results.concat({
          ...data,
          id: nextId + 1,
        })
      );
    });
  };

  updateShortCutsFOlder = (
    event: ElectronIpcMainEvent,
    data: ShortcutsFolder
  ) => {
    this.openFile().then((results) => {
      const folder = results.find((f) => f.id === data.id);
      if (!folder) {
        this.loadShortcutsFolders(event);
      } else {
        Object.assign(folder, data, { id: folder.id });
        this.setShortcutsFolders(event, results);
      }
    });
  };

  removeShortCutsFolder = (event: ElectronIpcMainEvent, id: number) => {
    this.openFile().then((results) => {
      this.setShortcutsFolders(
        event,
        results.filter((folder) => folder.id !== id)
      );
    });
  };

  loadShortcutsFolders = (event: ElectronIpcMainEvent) => {
    this.openFile().then((data) => {
      event.reply('load-shortcutsfolder', data);
    });
  };

  init = () => {
    ipcMain.on('load-shortcutsfolder', (event: Electron.IpcMainEvent) =>
      this.loadShortcutsFolders(event as ElectronIpcMainEvent)
    );
    ipcMain.on('add-shortcutsfolder', (event: Electron.IpcMainEvent, args) =>
      this.addShortCutsFolder(event as ElectronIpcMainEvent, args)
    );
    ipcMain.on('update-shortcutsfolder', (event: Electron.IpcMainEvent, args) =>
      this.updateShortCutsFOlder(event as ElectronIpcMainEvent, args)
    );
    ipcMain.on('remove-shortcutsfolder', (event: Electron.IpcMainEvent, args) =>
      this.removeShortCutsFolder(event as ElectronIpcMainEvent, args)
    );
  };
}
