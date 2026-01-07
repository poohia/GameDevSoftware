import { ipcMain, shell } from 'electron';
import fs from 'fs';
import async from 'async';
import pathModule from 'path';
import FileService from '../services/FileService';
import UtilsService from '../services/UtilsService';
import {
  ElectronIpcMainEvent,
  SceneObject,
  SceneObjectForm,
  SceneTypeJSON,
} from 'types';
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
            sceneType && sceneType !== 'all'
              ? sceneTypeFile.type === sceneType
              : true
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
          UtilsService.ArrayOrderByObjectID(sceneValue);
          if (sceneType) {
            // @ts-ignore
            event.reply(`load-scenes-${sceneType}`, sceneValue);
          } else {
            event.reply(`load-scenes`, sceneValue);
          }
        });
    });
  };

  loadSceneTypes = (event: ElectronIpcMainEvent) => {
    //@ts-ignore
    const { path } = global;
    const scenes: (SceneObjectForm & { typeId: string })[] = [];
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
            FolderPlugin.sceneTypesDirectory
          );
          FileService.readdir(moduleDirectory, 'file').then((filesName) => {
            async
              .each(filesName, (fileName: string, callbackFile: () => void) => {
                FileService.readJsonFile(
                  pathModule.join(
                    path,
                    FolderPlugin.modulesDirectory,
                    name,
                    FolderPlugin.sceneTypesDirectory,
                    fileName
                  )
                ).then((data) => {
                  scenes.push({
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
          event.reply(
            'load-scenes-types',
            scenes.sort((a, b) => a.typeId.localeCompare(b.typeId))
          );
        });
    });
  };

  removeScene = (
    event: ElectronIpcMainEvent,
    { id, sceneType }: { id: string; sceneType: string }
  ) => {
    const { path } = global;
    ScenePlugin.readIndexFile().then((data) => {
      ScenePlugin.writeIndexFile(
        data.filter((d) => d.file !== `${id}.json`)
      ).then(async () => {
        let originalObjectType = null;
        if (sceneType === 'all') {
          const dataFile = await FileService.readJsonFile(
            `${path}/${FolderPlugin.gameObjectDirectory}/${id}.json`
          );
          originalObjectType = dataFile?._type ?? null;
        }
        fs.unlink(`${path}${FolderPlugin.sceneDirectory}/${id}.json`, (err) => {
          if (err) {
            console.error(err);
            throw new Error(err.message);
          }
          this.loadScenes(event, sceneType);
          this.loadScenes(event);
          if (originalObjectType) {
            this.loadScenes(event, originalObjectType);
          }
        });
      });
    });
  };

  private getFormulaireSceneTypes = (sType: string) => {
    //@ts-ignore
    const { path } = global;
    let sceneType: {
      value: string;
      module: string;
    } = {
      value: '',
      module: '',
    };
    return FileService.readdir(
      `${path}${FolderPlugin.modulesDirectory}`,
      'directory'
    )
      .then((names) => {
        return async.each(names, (name: string, callback: () => void) => {
          const moduleDirectory = `${path}${FolderPlugin.modulesDirectory}/${name}${FolderPlugin.sceneTypesDirectory}`;
          FileService.readdir(moduleDirectory, 'file').then((filesName) => {
            async
              .each(filesName, (fileName: string, callbackFile: () => void) => {
                if (fileName.includes(sType)) {
                  sceneType.value = `${moduleDirectory}/${fileName}`;
                  sceneType.module = name;
                }
                callbackFile();
              })
              .then(() => callback());
          });
        });
      })
      .then(() => {
        return FileService.readJsonFile(sceneType.value);
      })
      .then((data) => ({
        ...data,
        ...sceneType,
        core: {
          _title: {
            label: 'Label of scene',
            core: 'string',
          },
          ...data.core,
          _actions: {
            multiple: true,
            label: 'Actions',
            core: {
              _scene: 'scene',
            },
            optional: true,
          },
        },
      }));
  };

  getFormulaireScene = (event: ElectronIpcMainEvent, sType: string) => {
    this.getFormulaireSceneTypes(sType).then((data) => {
      console.log(
        '🚀 ~ ScenePlugin ~ this.getFormulaireSceneTypes ~ data:',
        data
      );
      // @ts-ignore
      event.reply(`get-formulaire-scene-${sType}`, {
        ...data,
      });
    });
  };

  getFormulaireSceneAll = (event: ElectronIpcMainEvent, sType: string) => {
    this.getFormulaireSceneTypes(sType).then((data) => {
      // @ts-ignore
      event.reply(`get-formulaire-scene-all`, {
        ...data,
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
      data.push({
        file: `${_id}.json`,
        type: args._type,
        module: args._module,
      });

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

  loadFirstScene = (event: ElectronIpcMainEvent) => {
    //@ts-ignore
    const { path } = global;
    ScenePlugin.readIndexFile().then((data) => {
      let firstScene = data.find((scene) => scene.firstScene);
      if (!firstScene) {
        firstScene = data.find((scene) => scene.file === '1.json');
      }
      event.reply('load-first-scene', firstScene);
    });
  };

  setFirstScene = (event: ElectronIpcMainEvent, arg: number) => {
    //@ts-ignore
    const { path } = global;
    ScenePlugin.readIndexFile().then((data) => {
      data.forEach((scene) => {
        if (Number(scene.file.replace('.json', '')) === arg) {
          scene.firstScene = true;
        } else {
          scene.firstScene = false;
        }
      });
      ScenePlugin.writeIndexFile(data).then(() => {
        this.loadFirstScene(event);
      });
    });
  };

  openSceneFile = (_event: ElectronIpcMainEvent, arg: string) => {
    const { path } = global;
    shell.openPath(
      pathModule.normalize(`${path}${FolderPlugin.sceneDirectory}/${arg}.json`)
    );
  };

  init = () => {
    ipcMain.on('load-scenes-types', (event: Electron.IpcMainEvent) =>
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
    ipcMain.on('get-formulaire-scene-all', (event, args) => {
      this.getFormulaireSceneAll(event as ElectronIpcMainEvent, args);
    });
    ipcMain.on('create-scene', (event, args) => {
      this.createScene(event as ElectronIpcMainEvent, args);
    });
    ipcMain.on('get-scene-value', (event, args) => {
      this.getSceneValue(event as ElectronIpcMainEvent, args);
    });
    ipcMain.on('load-first-scene', (event) => {
      this.loadFirstScene(event as ElectronIpcMainEvent);
    });
    ipcMain.on('set-first-scene', (event, args) => {
      this.setFirstScene(event as ElectronIpcMainEvent, args);
    });
    ipcMain.on('open-scene-file', (event, args) => {
      this.openSceneFile(event as ElectronIpcMainEvent, args);
    });
  };
}
