import pathModule from 'path';
import FileService from '../services/FileService';
import FolderPlugin from './FolderPlugin';
import {
  ElectronIpcMainEvent,
  ShortcutsFolder,
  ShortcutsFolderTargetType,
} from 'types';
import { ipcMain } from 'electron';

export default class ShortcutsFoldersPlugin {
  static readFile() {
    const { path } = global;

    return FileService.readJsonFile<ShortcutsFolder[]>(
      pathModule.join(path, FolderPlugin.shortcutsFolderFile)
    );
  }

  static writeFile(data: ShortcutsFolder[]) {
    const { path } = global;

    return FileService.writeJsonFile<ShortcutsFolder[]>(
      pathModule.join(path, FolderPlugin.shortcutsFolderFile),
      data
    );
  }

  static syncSceneShortcutFolder = async (
    sceneId: number,
    folderName: string
  ): Promise<void> => {
    const shortcutsFolders = await ShortcutsFoldersPlugin.readFile();
    const normalizedFolderName = folderName.trim();

    if (
      normalizedFolderName.length === 0 ||
      shortcutsFolders.some(
        (folder) => folder.folderName.trim() === normalizedFolderName
      )
    ) {
      return;
    }

    const nextId =
      shortcutsFolders.reduce(
        (max, item) => (item.id > max.id ? item : max),
        shortcutsFolders[0]
      )?.id || 0;

    await ShortcutsFoldersPlugin.writeFile(
      shortcutsFolders.concat({
        id: nextId + 1,
        folderName: normalizedFolderName,
        scenes: [sceneId],
        editable: true,
        deletable: true,
      })
    );
  };

  static removeSceneShortcutFolder = async (
    sceneId: number,
    folderName: string
  ): Promise<void> => {
    const shortcutsFolders = await ShortcutsFoldersPlugin.readFile();
    const normalizedFolderName = folderName.trim();

    await ShortcutsFoldersPlugin.writeFile(
      shortcutsFolders.filter(
        (folder) =>
          !(
            folder.folderName.trim() === normalizedFolderName ||
            folder.scenes?.includes(sceneId)
          )
      )
    );
  };

  private writeFile(data: ShortcutsFolder[]) {
    return ShortcutsFoldersPlugin.writeFile(data);
  }

  private openFile() {
    return ShortcutsFoldersPlugin.readFile();
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

  updateShortCutsFolder = (
    event: ElectronIpcMainEvent,
    data: ShortcutsFolder
  ) => {
    this.openFile().then((results) => {
      const folder = results.find((f) => f.id === data.id);
      if (!folder) {
        this.loadShortcutsFolders(event);
      } else {
        const protectedFolder = folder.cantDeleted === true;

        Object.assign(folder, data, {
          id: folder.id,
          folderName: protectedFolder ? folder.folderName : data.folderName,
          deletable: protectedFolder ? false : data.deletable,
          cantDeleted: folder.cantDeleted,
        });
        this.setShortcutsFolders(event, results);
      }
    });
  };

  removeShortCutsFolder = (event: ElectronIpcMainEvent, id: number) => {
    this.openFile().then((results) => {
      this.setShortcutsFolders(
        event,
        results.filter(
          (folder) => folder.id !== id || folder.cantDeleted === true
        )
      );
    });
  };

  loadShortcutsFolders = (event: ElectronIpcMainEvent) => {
    this.openFile().then((data) => {
      event.reply('load-shortcutsfolder', data);
    });
  };

  addTypeTargetShortcutsFolders = (
    event: ElectronIpcMainEvent,
    args: ShortcutsFolderTargetType & { values: number[] }
  ) => {
    this.openFile().then((data) => {
      data.forEach((folder) => {
        if (args.values.includes(folder.id)) {
          switch (args.typeTarget) {
            case 'translations':
              if (folder.translations === undefined) {
                folder.translations = [args.id];
              } else {
                folder.translations = folder
                  .translations!.filter((value) => value !== args.id)
                  .concat(args.id);
              }

              break;
            case 'constants':
              if (folder.constants === undefined) {
                folder.constants = [args.id];
              } else {
                folder.constants = folder
                  .constants!.filter((value) => value !== args.id)
                  .concat(args.id);
              }
              break;
            case 'assets':
              if (folder.assets === undefined) {
                folder.assets = [args.id];
              } else {
                folder.assets = folder
                  .assets!.filter((value) => value !== args.id)
                  .concat(args.id);
              }
              break;
            case 'gameObjects':
              if (folder.gameObjects === undefined) {
                folder.gameObjects = [args.id];
              } else {
                folder.gameObjects = folder
                  .gameObjects!.filter((value) => value !== args.id)
                  .concat(args.id);
              }
              break;
            case 'scenes':
              if (folder.scenes === undefined) {
                folder.scenes = [args.id];
              } else {
                folder.scenes = folder
                  .scenes!.filter((value) => value !== args.id)
                  .concat(args.id);
              }
              break;
          }
        } else {
          switch (args.typeTarget) {
            case 'translations':
              folder.translations = folder.translations?.filter(
                (value) => value !== args.id
              );
              break;
            case 'constants':
              folder.constants = folder.constants?.filter(
                (value) => value !== args.id
              );
              break;
            case 'assets':
              folder.assets = folder.assets?.filter(
                (value) => value !== args.id
              );
              break;
            case 'gameObjects':
              folder.gameObjects = folder.gameObjects?.filter(
                (value) => value !== args.id
              );
              break;
            case 'scenes':
              folder.scenes = folder.scenes?.filter(
                (value) => value !== args.id
              );
              break;
          }
        }
      });
      this.setShortcutsFolders(event, data);
    });
  };

  getShortcutsFoldersTypeTarget = (
    event: ElectronIpcMainEvent,
    args: ShortcutsFolderTargetType
  ) => {
    this.openFile().then((data) => {
      switch (args.typeTarget) {
        case 'translations':
          event.reply(
            'get-shortcutsfolder-typetarget',
            data.filter((folder) =>
              folder.translations?.find((value) => value === args.id)
            )
          );
          break;
        case 'constants':
          event.reply(
            'get-shortcutsfolder-typetarget',
            data.filter((folder) =>
              folder.constants?.find((value) => value === args.id)
            )
          );
          break;
        case 'assets':
          event.reply(
            'get-shortcutsfolder-typetarget',
            data.filter((folder) =>
              folder.assets?.find((value) => value === args.id)
            )
          );
          break;
        case 'gameObjects':
          event.reply(
            'get-shortcutsfolder-typetarget',
            data.filter((folder) =>
              folder.gameObjects?.find((value) => value === args.id)
            )
          );
          break;
        case 'scenes':
          event.reply(
            'get-shortcutsfolder-typetarget',
            data.filter((folder) =>
              folder.scenes?.find((value) => value === args.id)
            )
          );
          break;
      }
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
      this.updateShortCutsFolder(event as ElectronIpcMainEvent, args)
    );
    ipcMain.on('remove-shortcutsfolder', (event: Electron.IpcMainEvent, args) =>
      this.removeShortCutsFolder(event as ElectronIpcMainEvent, args)
    );
    ipcMain.on(
      'get-shortcutsfolder-typetarget',
      (event: Electron.IpcMainEvent, args) =>
        this.getShortcutsFoldersTypeTarget(event as ElectronIpcMainEvent, args)
    );
    ipcMain.on(
      'add-typetarget-shortcutsfolder',
      (event: Electron.IpcMainEvent, args) =>
        this.addTypeTargetShortcutsFolders(event as ElectronIpcMainEvent, args)
    );
  };
}
