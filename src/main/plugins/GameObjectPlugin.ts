import { ipcMain, shell } from 'electron';
import fs from 'fs';
import async from 'async';
import pathModule from 'path';
import FileService from '../services/FileService';
import UtilsService from '../services/UtilsService';
import {
  ElectronIpcMainEvent,
  GameObject,
  GameObjectForm,
  ObjectGameTypeJSON,
} from 'types';
import FolderPlugin from './FolderPlugin';
import LogService from '../services/LogService';

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

  loadGameObjects = (event: ElectronIpcMainEvent, objectType?: string) => {
    //@ts-ignore
    const { path } = global;
    GameObjectPlugin.readIndexFile().then((data) => {
      const gameObjectsValue: GameObject[] = [];
      async
        .each(
          data.filter((objectTypeFile) =>
            objectType && objectType !== 'all'
              ? objectTypeFile.type === objectType
              : true
          ),
          (objectTypeFile: ObjectGameTypeJSON, callback: () => void) => {
            FileService.readJsonFile(
              `${path}${FolderPlugin.gameObjectDirectory}/${objectTypeFile.file}`
            ).then((dataFile) => {
              gameObjectsValue.push(dataFile);
              callback();
            });
          }
        )
        .then(() => {
          if (objectType) {
            // @ts-ignore
            event.reply(`load-game-objects-${objectType}`, gameObjectsValue);
          } else {
            event.reply(`load-game-objects`, gameObjectsValue);
          }
        });
    });
  };

  loadGameObjectTypes = (event: ElectronIpcMainEvent) => {
    //@ts-ignore
    const { path } = global;
    const gameObjects: (GameObjectForm & { typeId: string })[] = [];
    FileService.readdir(
      `${path}${FolderPlugin.modulesDirectory}`,
      'directory'
    ).then((names) => {
      async
        .each(names, (name: string, callback: () => void) => {
          const moduleDirectory = pathModule.join(
            path,
            FolderPlugin.modulesDirectory,
            name,
            FolderPlugin.gameObjectTypesDirectory
          );
          FileService.readdir(moduleDirectory, 'file').then((filesName) => {
            async
              .each(filesName, (fileName: string, callbackFile: () => void) => {
                FileService.readJsonFile(
                  pathModule.join(
                    path,
                    FolderPlugin.modulesDirectory,
                    name,
                    FolderPlugin.gameObjectTypesDirectory,
                    fileName
                  )
                ).then((data) => {
                  gameObjects.push({
                    ...data,
                    typeId: fileName.replace('.json', ''),
                  });
                  callbackFile();
                });
              })
              .then(() => callback());
          });
        })
        .then(() => {
          LogService.Log(
            gameObjects.sort((a, b) => a.typeId.localeCompare(b.typeId))
          );

          event.reply(
            'load-game-object-types',
            gameObjects
              .sort((a, b) => a.typeId.localeCompare(b.typeId))
              .map((gameObject) => ({
                ...gameObject,
                // default value
                core: {
                  _title: 'string',
                  ...gameObject.core,
                },
              }))
          );
        });
    });
  };

  removeObject = (
    event: ElectronIpcMainEvent,
    { id, objectType }: { id: string; objectType: string }
  ) => {
    const { path } = global;
    GameObjectPlugin.readIndexFile().then((data) => {
      GameObjectPlugin.writeIndexFile(
        data.filter((d) => d.file !== `${id}.json`)
      ).then(async () => {
        let originalObjectType = null;
        if (objectType === 'all') {
          const dataFile = await FileService.readJsonFile(
            `${path}/${FolderPlugin.gameObjectDirectory}/${id}.json`
          );
          originalObjectType = dataFile?._type ?? null;
        }
        fs.unlink(
          `${path}/${FolderPlugin.gameObjectDirectory}/${id}.json`,
          (err) => {
            if (err) {
              console.error(err);
              throw new Error(err.message);
            }
            this.loadGameObjects(event, objectType);
            this.loadGameObjects(event);
            if (originalObjectType) {
              this.loadGameObjects(event, originalObjectType);
            }
          }
        );
      });
    });
  };

  private getFormulaireGameObjectType = (objectType: string) => {
    //@ts-ignore
    const { path } = global;
    let gameObjectType: string = '';
    return FileService.readdir(
      `${path}${FolderPlugin.modulesDirectory}`,
      'directory'
    )
      .then((names) => {
        return async.each(names, (name: string, callback: () => void) => {
          const moduleDirectory = `${path}${FolderPlugin.modulesDirectory}/${name}${FolderPlugin.gameObjectTypesDirectory}`;
          FileService.readdir(moduleDirectory, 'file').then((filesName) => {
            async
              .each(filesName, (fileName: string, callbackFile: () => void) => {
                if (fileName.includes(objectType)) {
                  gameObjectType = `${moduleDirectory}/${fileName}`;
                }
                callbackFile();
              })
              .then(() => callback());
          });
        });
      })
      .then(() => FileService.readJsonFile(gameObjectType))
      .then((data) => ({ ...data, core: { _title: 'string', ...data.core } }));
  };

  getFormulaireGameObject = (
    event: ElectronIpcMainEvent,
    objectType: string
  ) => {
    this.getFormulaireGameObjectType(objectType).then((data) => {
      LogService.Log(data);
      // @ts-ignore
      event.reply(`get-formulaire-game-object-${objectType}`, data);
    });
  };

  getFormulaireGameObjectFromAll = (
    event: ElectronIpcMainEvent,
    objectType: string
  ) => {
    this.getFormulaireGameObjectType(objectType).then((data) => {
      event.reply('get-formulaire-game-object-all', data);
    });
  };

  createGameObject = (event: ElectronIpcMainEvent, args: GameObject) => {
    //@ts-ignore
    const { path } = global;
    GameObjectPlugin.readIndexFile().then((data) => {
      const ids = data.map((d) => Number(d.file.replace('.json', '')));
      let _id = 1;
      if (args._id) {
        _id = args._id;
      } else if (ids.length > 0) {
        _id = ids[ids.length - 1] + 1;
      }
      data.push({ file: `${_id}.json`, type: args._type });
      async.parallel(
        [
          (callback) =>
            args._id
              ? callback(null)
              : GameObjectPlugin.writeIndexFile(data).then(() =>
                  callback(null)
                ),
          (callback) =>
            FileService.writeJsonFile(
              `${path}/${FolderPlugin.gameObjectDirectory}/${_id}.json`,
              { ...args, _id }
            ).then(() => callback(null)),
        ],
        () => {
          this.loadGameObjects(event, args._type);
          this.loadGameObjects(event);
        }
      );
    });
  };

  getGameObjectValue = (
    event: ElectronIpcMainEvent,
    args: { id: string; gameObjectType: string }
  ) => {
    //@ts-ignore
    const { path } = global;
    const { id, gameObjectType } = args;
    FileService.readJsonFile(
      `${path}/${FolderPlugin.gameObjectDirectory}/${id}.json`
    ).then((data) => {
      // @ts-ignore
      event.reply(`get-game-object-value-${gameObjectType}`, data);
    });
  };

  openGameObjectFile = (_event: ElectronIpcMainEvent, arg: string) => {
    const { path } = global;
    shell.openPath(
      pathModule.normalize(
        `${path}${FolderPlugin.gameObjectDirectory}/${arg}.json`
      )
    );
  };

  generateTree = (event: ElectronIpcMainEvent, arg: number) => {
    LogService.Log(arg);
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
    ipcMain.on('get-formulaire-game-object-all', (event, args) => {
      this.getFormulaireGameObjectFromAll(event as ElectronIpcMainEvent, args);
    });
    ipcMain.on('create-game-object', (event, args) => {
      this.createGameObject(event as ElectronIpcMainEvent, args);
    });
    ipcMain.on('get-game-object-value', (event, args) => {
      this.getGameObjectValue(event as ElectronIpcMainEvent, args);
    });
    ipcMain.on('load-all-game-objects', (event) => {
      this.loadGameObjectTypes(event as ElectronIpcMainEvent);
    });
    ipcMain.on('open-gameobject-file', (event, args) => {
      this.openGameObjectFile(event as ElectronIpcMainEvent, args);
    });
    ipcMain.on('generate-tree-game-objects', (event, args) => {
      this.generateTree(event as ElectronIpcMainEvent, args);
    });
  };
}
