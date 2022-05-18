import { ipcMain } from 'electron';
import fs from 'fs';
import async from 'async';
import FileService from '../services/FileService';
import { ElectronIpcMainEvent, SceneObject, SceneTypeJSON } from 'types';
import FolderPlugin from './FolderPlugin';

export default class ScenePlugin {
  constructor() {}

  static readIndexFile = (): Promise<SceneTypeJSON[]> =>
    new Promise((resolve) => {
      // @ts-ignore
      const { path } = global;
      FileService.readJsonFile<SceneTypeJSON[]>(
        `${path}${FolderPlugin.sceneFile}`
      ).then((data) => {
        resolve(data);
      });
    });

  static writeIndexFile = (data: SceneTypeJSON[]): Promise<SceneTypeJSON[]> =>
    new Promise((resolve) => {
      // @ts-ignore
      const { path } = global;
      FileService.writeJsonFile<SceneTypeJSON[]>(
        `${path}${FolderPlugin.sceneFile}`,
        data
      ).then(() => {
        resolve(data);
      });
    });

  loadScenes = (event: ElectronIpcMainEvent, sceneType?: string) => {
    //@ts-ignore
    const { path } = global;
    ScenePlugin.readIndexFile().then((data) => {
      const sceneValue: SceneObject[] = [];
      async
        .each(
          data.filter((sceneTypeFile) =>
            sceneType ? sceneTypeFile.type === sceneType : true
          ),
          (sceneTypeFile: SceneTypeJSON, callback: () => void) => {
            FileService.readJsonFile(
              `${path}${FolderPlugin.sceneDirectory}/${sceneTypeFile.file}`
            ).then((dataFile) => {
              sceneValue.push(dataFile);
              callback();
            });
          }
        )
        .then(() => {
          if (sceneType) {
            // @ts-ignore
            event.reply(`load-scene-${sceneType}`, sceneValue);
          } else {
            event.reply(`load-scene`, sceneValue);
          }
        });
    });
  };

  loadSceneTypes = (event: ElectronIpcMainEvent) => {
    //@ts-ignore
    const { path } = global;
    const scenes: any[] = [];
    FileService.readdir(
      `${path}${FolderPlugin.modulesDirectory}`,
      'directory'
    ).then((names) => {
      async
        .each(names, (name: string, callback: () => void) => {
          const moduleDirectory = `${path}${FolderPlugin.modulesDirectory}/${name}${FolderPlugin.sceneTypesDirectory}`;
          FileService.readdir(moduleDirectory, 'file').then((filesName) => {
            async
              .each(filesName, (fileName: string, callbackFile: () => void) => {
                scenes.push(fileName.replace('.json', ''));
                callbackFile();
              })
              .then(() => callback());
          });
        })
        .then(() => {
          event.reply('load-scene-types', scenes);
        });
    });
  };

  removeScene = (
    event: ElectronIpcMainEvent,
    { id, sceneType }: { id: string; sceneType: string }
  ) => {
    // @ts-ignore
    const { path } = global;
    ScenePlugin.readIndexFile().then((data) => {
      ScenePlugin.writeIndexFile(
        data.filter((d) => d.file !== `${id}.json`)
      ).then(() => {
        fs.unlink(
          `${path}/${FolderPlugin.sceneDirectory}/${id}.json`,
          (err) => {
            if (err) {
              console.error(err);
              throw new Error(err.message);
            }
            this.loadScenes(event, sceneType);
            this.loadScenes(event);
          }
        );
      });
    });
  };

  getFormulaireScene = (event: ElectronIpcMainEvent, sType: string) => {
    //@ts-ignore
    const { path } = global;
    let sceneType: string = '';
    FileService.readdir(
      `${path}${FolderPlugin.modulesDirectory}`,
      'directory'
    ).then((names) => {
      async
        .each(names, (name: string, callback: () => void) => {
          const moduleDirectory = `${path}${FolderPlugin.modulesDirectory}/${name}${FolderPlugin.sceneTypesDirectory}`;
          FileService.readdir(moduleDirectory, 'file').then((filesName) => {
            async
              .each(filesName, (fileName: string, callbackFile: () => void) => {
                if (fileName.includes(sType)) {
                  sceneType = `${moduleDirectory}/${fileName}`;
                }
                callbackFile();
              })
              .then(() => callback());
          });
        })
        .then(() => {
          FileService.readJsonFile(sceneType).then((data) => {
            event.reply(`get-formulaire-scene-${sType}`, data);
          });
        });
    });
  };

  createScene = (event: ElectronIpcMainEvent, args: SceneObject) => {
    //@ts-ignore
    const { path } = global;
    ScenePlugin.readIndexFile().then((data) => {
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
              : ScenePlugin.writeIndexFile(data).then(() => callback(null)),
          (callback) => {
            if (args._actions === undefined) {
              args._actions = [];
            }
            FileService.writeJsonFile(
              `${path}/${FolderPlugin.sceneDirectory}/${_id}.json`,
              { ...args, _id }
            ).then(() => callback(null));
          },
        ],
        () => {
          this.loadScenes(event, args._type);
          this.loadScenes(event);
        }
      );
    });
  };

  getSceneValue = (
    event: ElectronIpcMainEvent,
    args: { id: string; sceneType: string }
  ) => {
    //@ts-ignore
    const { path } = global;
    const { id, sceneType } = args;
    FileService.readJsonFile(
      `${path}/${FolderPlugin.sceneDirectory}/${id}.json`
    ).then((data) => {
      // @ts-ignore
      event.reply(`get-scene-value-${sceneType}`, data);
    });
  };

  init = () => {
    ipcMain.on('load-scene-types', (event: Electron.IpcMainEvent) =>
      this.loadSceneTypes(event as ElectronIpcMainEvent)
    );
    ipcMain.on('load-scenes', (event: Electron.IpcMainEvent, args) =>
      this.loadScenes(event as ElectronIpcMainEvent, args)
    );
    ipcMain.on('remove-scene', (event, args) => {
      this.removeScene(event as ElectronIpcMainEvent, args);
    });
    ipcMain.on('get-formulaire-scene', (event, args) => {
      this.getFormulaireScene(event as ElectronIpcMainEvent, args);
    });
    ipcMain.on('create-scene', (event, args) => {
      this.createScene(event as ElectronIpcMainEvent, args);
    });
    ipcMain.on('get-scene-value', (event, args) => {
      this.getSceneValue(event as ElectronIpcMainEvent, args);
    });
    ipcMain.on('load-all-scene', (event) => {
      this.loadScenes(event as ElectronIpcMainEvent);
    });
  };
}
