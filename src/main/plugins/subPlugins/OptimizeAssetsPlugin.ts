import compress_images from 'compress-images';
import pathModule from 'path';
import { app, shell } from 'electron';

import { ElectronIpcMainEvent } from 'types';
import FolderPlugin from '../FolderPlugin';

export default class OptimizeAssetsPlugin {
  private pathTempFolderOptimize = `${app.getPath(
    'temp'
  )}/GameDevSoftware/optimize`;
  optimizeImages = () =>
    new Promise<void>((resolve) => {
      // @ts-ignore
      const { path } = global;

      compress_images(
        `${path}${FolderPlugin.directoryImages}/*.{jpg,JPG,jpeg,JPEG,png,svg,gif}`.replaceAll(
          '\\',
          '/'
        ),
        `${this.pathTempFolderOptimize}/images/`.replaceAll('\\', '/'),
        { compress_force: false, statistic: true, autoupdate: true },
        false,
        { jpg: { engine: 'mozjpeg', command: ['-quality', '90'] } },
        {
          png: {
            engine: 'pngquant',
            command: ['--quality=90-100', '-o'],
          },
        },
        { svg: { engine: 'svgo', command: '--multipass' } },
        {
          gif: {
            engine: 'gifsicle',
            command: ['--colors', '64', '--use-col=web'],
          },
        },
        function () {
          resolve();
        }
      );
    });

  optimize = (event: ElectronIpcMainEvent) => {
    Promise.all([this.optimizeImages()]).then(() => {
      shell.openExternal(pathModule.normalize(this.pathTempFolderOptimize));
      event.reply('optimize-assets');
    });
  };
}
