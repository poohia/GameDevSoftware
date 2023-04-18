import pathModule from 'path';
import { app, shell } from 'electron';
// import { execFile } from 'node:child_process';
// import pngquant from 'pngquant-bin';
// import async from 'async';

import { AssetType, ElectronIpcMainEvent } from 'types';
import FolderPlugin from '../FolderPlugin';
import FileService from '../../services/FileService';

export default class OptimizeAssetsPlugin {
  private assets: AssetType[] = [];
  private pathTemp = pathModule.normalize(
    `${app.getPath('temp')}/GameDevSoftware`
  );
  private pathTempFolderOptimize = `${this.pathTemp}/optimize`;
  private pathTempImagesFolderOptimize = `${this.pathTempFolderOptimize}/images`;

  constructor() {}

  optimizePNGImages = () =>
    new Promise<void>((resolve) => {
      // @ts-ignore
      const { path } = global;
      // compress_images(
      //   `${path}${FolderPlugin.directoryImages}/*.{jpg,JPG,jpeg,JPEG,png,svg,gif}`.replaceAll(
      //     '\\',
      //     '/'
      //   ),
      //   `${this.pathTempFolderOptimize}/images/`.replaceAll('\\', '/'),
      //   { compress_force: false, statistic: true, autoupdate: true },
      //   false,
      //   { jpg: { engine: 'mozjpeg', command: ['-quality', '90'] } },
      //   {
      //     png: {
      //       engine: 'pngquant',
      //       command: ['--quality=90-100', '-o'],
      //     },
      //   },
      //   { svg: { engine: 'svgo', command: '--multipass' } },
      //   {
      //     gif: {
      //       engine: 'gifsicle',
      //       command: ['--colors', '64', '--use-col=web'],
      //     },
      //   },
      //   function () {
      //     resolve();
      //   }
      // );
      // async.each(
      //   this.assets.filter(
      //     (asset) =>
      //       asset.type === 'image' && asset.name.toLowerCase().includes('png')
      //   ),
      //   (asset: AssetType, callback) => {
      //     execFile(
      //       pngquant,
      //       [
      //         '--quality=90-100',
      //         '-o',
      //         pathModule.normalize(
      //           `${this.pathTempImagesFolderOptimize}/${asset.name}`
      //         ),
      //         `${path}${FolderPlugin.directoryImages}/${asset.name}`,
      //       ],
      //       () => {
      //         callback();
      //       }
      //     );
      //   },
      //   () => {
      //     resolve();
      //   }
      // );
    });

  optimize = (event: ElectronIpcMainEvent) => {
    FileService.accessOrCreateFolder(this.pathTemp)
      .then(() => {
        return FileService.accessOrCreateFolder(this.pathTempFolderOptimize);
      })
      .then(() => {
        return FileService.accessOrCreateFolder(
          this.pathTempImagesFolderOptimize
        );
      })
      .then(() => {
        return new Promise<void>((resolve, reject) => {
          // @ts-ignore
          const { path } = global;
          FileService.readJsonFile<AssetType[]>(
            `${path}${FolderPlugin.assetFile}`
          )
            .then((data) => {
              this.assets = data;
              resolve();
            })
            .catch(reject);
        });
      })
      .then(() => {
        Promise.all([this.optimizePNGImages()]).then(() => {
          shell.openPath(pathModule.normalize(this.pathTempFolderOptimize));
          event.reply('optimize-assets');
        });
      });
  };
}
