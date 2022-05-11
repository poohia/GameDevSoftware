import { ipcMain } from 'electron';
import fs from 'fs';
import each from 'async/each';
import FileService from '../services/FileService';
import { ElectronIpcMainEvent, GameObject, ObjectGameTypeJSON } from 'types';
import FolderPlugin from './FolderPlugin';

export default class GameObjectPlugin {
  constructor() {}

  static readIndexFile = (): Promise<ObjectGameTypeJSON[]> =>
    new Promise((resolve) => {
      // @ts-ignore
      const { path } = global;
      FileService.readJsonFile<ObjectGameTypeJSON[]>(
        `${path}${FolderPlugin.gameObjectFile}`
      ).then((data) => {
        resolve(data);
      });
    });

  static writeIndexFile = (
    data: ObjectGameTypeJSON[]
  ): Promise<ObjectGameTypeJSON[]> =>
    new Promise((resolve) => {
      // @ts-ignore
      const { path } = global;
      FileService.writeJsonFile<ObjectGameTypeJSON[]>(
        `${path}${FolderPlugin.gameObjectFile}`,
        data
      ).then(() => {
        resolve(data);
      });
    });

  loadGameObjects = (event: ElectronIpcMainEvent, objectType: string) => {
    //@ts-ignore
    const { path } = global;
    GameObjectPlugin.readIndexFile().then((data) => {
      const gameObjectsValue: GameObject[] = [];
      each(
        data.filter((objectTypeFile) => objectTypeFile.type === objectType),
        (objectTypeFile: ObjectGameTypeJSON, callback: () => void) => {
          FileService.readJsonFile(
            `${path}${FolderPlugin.gameObjectDirectory}/${objectTypeFile.file}`
          ).then((dataFile) => {
            gameObjectsValue.push(dataFile);
            callback();
          });
        }
      ).then(() =>
        event.reply(`load-game-objects-${objectType}`, gameObjectsValue)
      );
    });
  };

  loadGameObjectTypes = (event: ElectronIpcMainEvent) => {
    //@ts-ignore
    const { path } = global;
    const gameObjects: any[] = [];
    FileService.readdir(
      `${path}${FolderPlugin.modulesDirectory}`,
      'directory'
    ).then((names) => {
      each(names, (name: string, callback: () => void) => {
        const moduleDirectory = `${path}${FolderPlugin.modulesDirectory}/${name}${FolderPlugin.gameObjectTypesDirectory}`;
        FileService.readdir(moduleDirectory, 'file').then((filesName) => {
          each(filesName, (fileName: string, callbackFile: () => void) => {
            gameObjects.push(fileName.replace('.json', ''));
            callbackFile();
          }).then(() => callback());
        });
      }).then(() => {
        event.reply('load-game-object-types', gameObjects);
      });
    });
  };

  removeObject = (
    event: ElectronIpcMainEvent,
    { id, objectType }: { id: string; objectType: string }
  ) => {
    // @ts-ignore
    const { path } = global;
    GameObjectPlugin.readIndexFile().then((data) => {
      GameObjectPlugin.writeIndexFile(
        data.filter((d) => d.file !== `${id}.json`)
      ).then(() => {
        fs.unlink(
          `${path}/${FolderPlugin.gameObjectDirectory}/${id}.json`,
          (err) => {
            if (err) {
              console.error(err);
              throw new Error(err.message);
            }
            this.loadGameObjects(event, objectType);
          }
        );
      });
    });
  };

  getFormulaireGameObject = (
    event: ElectronIpcMainEvent,
    objectType: string
  ) => {
    //@ts-ignore
    const { path } = global;
    let gameObjectType: string = '';
    FileService.readdir(
      `${path}${FolderPlugin.modulesDirectory}`,
      'directory'
    ).then((names) => {
      each(names, (name: string, callback: () => void) => {
        const moduleDirectory = `${path}${FolderPlugin.modulesDirectory}/${name}${FolderPlugin.gameObjectTypesDirectory}`;
        FileService.readdir(moduleDirectory, 'file').then((filesName) => {
          each(filesName, (fileName: string, callbackFile: () => void) => {
            if (fileName.includes(objectType)) {
              gameObjectType = `${moduleDirectory}/${fileName}`;
            }
            callbackFile();
          }).then(() => callback());
        });
      }).then(() => {
        FileService.readJsonFile(gameObjectType).then((data) => {
          event.reply(`get-formulaire-game-object-${objectType}`, data);
        });
      });
    });
  };

  init = () => {
    ipcMain.on('load-game-object-types', (event: Electron.IpcMainEvent) =>
      this.loadGameObjectTypes(event as ElectronIpcMainEvent)
    );
    ipcMain.on('load-game-objects', (event: Electron.IpcMainEvent, args) =>
      this.loadGameObjects(event as ElectronIpcMainEvent, args)
    );
    ipcMain.on('remove-game-object', (event, args) => {
      this.removeObject(event as ElectronIpcMainEvent, args);
    });
    ipcMain.on('get-formulaire-game-object', (event, args) => {
      this.getFormulaireGameObject(event as ElectronIpcMainEvent, args);
    });
  };
}
