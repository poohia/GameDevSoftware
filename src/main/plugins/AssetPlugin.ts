import { ipcMain } from 'electron';
import fs from 'fs';
import {
  AssertAcceptedType,
  AssertFileValueType,
  AssetType,
  ConstantObject,
  ElectronIpcMainEvent,
} from 'types';
import FolderPlugin from './FolderPlugin';

export default class AssetPlugin {
  constructor() {}

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
    // @ts-ignore
    event.reply('load-assets', data);
  };

  saveAsset = (event: ElectronIpcMainEvent, arg: AssertFileValueType) => {
    const { fileName, fileType, content } = arg;
    const assets = this.readAssetFile();
    // @ts-ignore
    const assetsJSON: AssetType[] = JSON.parse(assets);
    this.writeAssetFile(
      assetsJSON.concat({ type: fileType, name: fileName }),
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
          // const binaryData = Buffer.from(arg.content, 'base64');
          const binaryData = Buffer.from(
            content.replace(/^data:([A-Za-z-+/]+);base64,/, ''),
            'base64'
          );
          fs.writeFile(destinationPath, binaryData, (err) => {
            if (err) return;
            this.loadAssets(event);
          });
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
  };
}
