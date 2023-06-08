import { ipcMain, dialog, BrowserWindow, shell } from 'electron';
import fs from 'fs';
import async from 'async';
import {
  AssertAcceptedType,
  AssertFileValueType,
  AssetType,
  ElectronIpcMainEvent,
  typeAssetToOpen,
} from 'types';
import pathModule from 'path';
import FileService from '../services/FileService';
import UtilsService from '../services/UtilsService';
import FolderPlugin from './FolderPlugin';
import { OptimizeAssetsPlugin } from './subPlugins';

export default class AssetPlugin {
  private _optimizeAssetsPlugin;
  constructor(private mainWindow: BrowserWindow) {
    this._optimizeAssetsPlugin = new OptimizeAssetsPlugin();
  }

  private typeFromExtension = (ext: string): AssertAcceptedType => {
    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      return 'image';
    }
    if (ext === '.mp3') {
      return 'sound';
    }
    if (ext === '.mp4' || ext === '.mkv') {
      return 'video';
    }
    if (ext === '.json') {
      return 'json';
    }
    throw new Error('extension error');
  };

  private directoryFromFileType = (fileType: AssertAcceptedType) => {
    // @ts-ignore
    const { path } = global;
    switch (fileType) {
      case 'image':
        return `${path}${FolderPlugin.directoryImages}/`;
      case 'video':
        return `${path}${FolderPlugin.directoryVideos}/`;
      case 'sound':
        return `${path}${FolderPlugin.directorySounds}/`;
      case 'json':
        return `${path}${FolderPlugin.directoryJson}/`;
    }
  };

  private readAssetFile = (): AssetType[] => {
    // @ts-ignore
    const { path } = global;
    // @ts-ignore
    return JSON.parse(fs.readFileSync(`${path}${FolderPlugin.assetFile}`));
  };

  private writeAssetFile = (data: AssetType[], callback: () => void) => {
    // @ts-ignore
    const { path } = global;
    fs.writeFile(
      `${path}${FolderPlugin.assetFile}`,
      JSON.stringify(data),
      (err) => {
        if (err) return;
        callback();
      }
    );
  };

  loadAssets = (event: ElectronIpcMainEvent) => {
    const data = this.readAssetFile();
    UtilsService.SortAssets(data);
    event.reply('load-assets', data);
  };

  saveAsset = (event: ElectronIpcMainEvent, arg: AssertFileValueType) => {
    const { fileName, fileType, content, ...rest } = arg;
    const assets = this.readAssetFile();
    this.writeAssetFile(
      assets
        .filter((asset) => asset.name !== fileName)
        .concat({ type: fileType, name: fileName, ...rest }),
      () => {
        const destinationPath = `${this.directoryFromFileType(
          fileType
        )}${fileName}`;
        if (fileType === 'json') {
          fs.writeFile(
            destinationPath,
            JSON.stringify(JSON.parse(content)),
            (err) => {
              if (err) return;
              this.loadAssets(event);
            }
          );
        } else {
          FileService.saveFileFromBase64(content, destinationPath, () =>
            this.loadAssets(event)
          );
        }
      }
    );
  };

  deleteAsset = (event: ElectronIpcMainEvent, arg: string) => {
    const assets = this.readAssetFile();
    this.writeAssetFile(
      assets.filter((a) => a.name !== arg),
      () => {
        const asset = assets.find((a) => a.name === arg);
        if (!asset) return;
        const destinationPath = `${this.directoryFromFileType(asset.type)}${
          asset.name
        }`;
        fs.unlink(destinationPath, (err) => {
          if (err) return;
          this.loadAssets(event);
        });
      }
    );
  };

  getAssetInformation = (event: ElectronIpcMainEvent, arg: AssetType) => {
    const { name, type } = arg;
    const pathDirectory = this.directoryFromFileType(type);
    const path = `${pathDirectory}${name}`;
    if (type === 'json') {
      fs.readFile(path, (err, data) => {
        if (err) {
          console.log(err);
          throw new Error(err.message);
        }
        event.reply(
          'get-asset-information',
          // @ts-ignore
          JSON.stringify(JSON.parse(data))
        );
      });
    } else {
      FileService.getFileBase64(path, (base64) => {
        event.reply('get-asset-information', base64);
      });
    }
  };

  getAssetBase64FromAssets = (event: ElectronIpcMainEvent, arg: string) => {
    const data = this.readAssetFile();
    const assetFind = data.find((d) => d.name === arg);
    if (assetFind) this.getAssetInformation(event, assetFind);
  };

  selectMultipleFiles = (event: ElectronIpcMainEvent) => {
    dialog
      .showOpenDialog(this.mainWindow, {
        properties: ['openFile', 'multiSelections'],
        filters: [
          {
            extensions: ['jpg', 'jpeg', 'png', 'mp3', 'mp4', 'mkv', 'json'],
            name: 'All',
          },
          { extensions: ['jpg', 'jpeg', 'png'], name: 'Image' },
          { extensions: ['mp3'], name: 'Sound' },
          { extensions: ['mp4', 'mkv'], name: 'Video' },
          { extensions: ['json'], name: 'Json' },
        ],
      })
      .then((result) => {
        const assets = this.readAssetFile();
        async.each(
          result.filePaths,
          (filePath, callback) => {
            const type = this.typeFromExtension(pathModule.extname(filePath));
            const name = pathModule.basename(filePath);
            assets.push({ type, name, deletable: true, editable: true });
            const destinationPath = `${this.directoryFromFileType(
              type
            )}${name}`;
            fs.copyFile(filePath, destinationPath, (err) => {
              if (err) {
                callback(err);
                return;
              }
              callback();
            });
          },
          () => {
            this.writeAssetFile(assets, () => {
              this.loadAssets(event);
            });
          }
        );
      });
  };

  loadAllAssets = (event: ElectronIpcMainEvent) => {
    // @ts-ignore
    const { path } = global;
    FileService.readJsonFile(`${path}${FolderPlugin.assetFile}`).then(
      (data) => {
        event.reply('load-all-assets', data);
      }
    );
  };

  openAssetsFolder = (
    _event: ElectronIpcMainEvent,
    arg: {
      type: typeAssetToOpen;
      fileName?: string;
    }
  ) => {
    // @ts-ignore
    const { path } = global;
    let finalPath = '';
    switch (arg.type) {
      case 'image':
        finalPath = `${path}${FolderPlugin.directoryImages}/${arg.fileName}`;
        break;
      case 'video':
        finalPath = `${path}${FolderPlugin.directoryVideos}/${arg.fileName}`;
        break;
      case 'sound':
        finalPath = `${path}${FolderPlugin.directorySounds}/${arg.fileName}`;
        break;
      case 'json':
        finalPath = `${path}${FolderPlugin.directoryJson}/${arg.fileName}`;
        break;
      case 'root':
      default:
        finalPath = `${path}${FolderPlugin.assetsDirectory}`;
    }
    shell.openPath(pathModule.normalize(finalPath));
  };

  init = () => {
    ipcMain.on('load-assets', (event: Electron.IpcMainEvent) =>
      this.loadAssets(event as ElectronIpcMainEvent)
    );
    ipcMain.on('upload-file', (event, args) => {
      this.saveAsset(event as ElectronIpcMainEvent, args);
    });
    ipcMain.on('delete-file', (event, args) => {
      this.deleteAsset(event as ElectronIpcMainEvent, args);
    });
    ipcMain.on('get-asset-information', (event, args) => {
      this.getAssetInformation(event as ElectronIpcMainEvent, args);
    });
    ipcMain.on('select-multiple-files', (event) => {
      this.selectMultipleFiles(event as ElectronIpcMainEvent);
    });

    ipcMain.on('load-all-assets', (event) =>
      this.loadAllAssets(event as ElectronIpcMainEvent)
    );
    ipcMain.on('load-asset-base64', (event: Electron.IpcMainEvent, arg) =>
      this.getAssetBase64FromAssets(event as ElectronIpcMainEvent, arg)
    );
    ipcMain.on('optimize-assets', (event: Electron.IpcMainEvent) => {
      this._optimizeAssetsPlugin.optimize(event as ElectronIpcMainEvent);
    });
    ipcMain.on('open-assets-folder', (event, arg) =>
      this.openAssetsFolder(event as ElectronIpcMainEvent, arg)
    );
  };
}
