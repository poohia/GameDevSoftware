import { dialog, BrowserWindow } from 'electron';
import { ApplicationImageParams, ElectronIpcMainEvent } from 'types';
import each from 'async/each';
import fs from 'fs';

import FolderPlugin from '../FolderPlugin';
import { FileService } from '../../services';
import { formatBase64 } from '../../../utils';

export default class ApplicationImagesPlugin {
  constructor(private mainWindow: BrowserWindow) {}
  loadParamsImage = (event: ElectronIpcMainEvent) => {
    // @ts-ignore
    const { path } = global;
    const imageParams: ApplicationImageParams = {
      favicon: '',
      icon: '',
      splashscreen: '',
    };
    each(
      FolderPlugin.appImages,
      (image: string, callback: () => void) => {
        FileService.getFileBase64(`${path}${image}`, (base64) => {
          base64 = formatBase64('image', base64);
          if (image.endsWith('favicon.png')) {
            imageParams.favicon = base64;
          } else if (image.endsWith('icon.png')) {
            imageParams.icon = base64;
          } else if (image.endsWith('splash.png')) {
            imageParams.splashscreen = base64;
          }
          callback();
        });
      },
      () => {
        event.reply('load-params-image', imageParams);
      }
    );
  };

  replaceParamsImage = (
    event: ElectronIpcMainEvent,
    arg: keyof ApplicationImageParams
  ) => {
    dialog
      .showOpenDialog(this.mainWindow, {
        properties: ['openFile'],
        filters: [{ extensions: ['.png'], name: 'Image' }],
      })
      .then((result) => {
        // @ts-ignore
        let targetPath = String(global.path);
        switch (arg) {
          case 'favicon':
            targetPath = `${targetPath}${FolderPlugin.appImages[0]}`;
            break;
          case 'icon':
            targetPath = `${targetPath}${FolderPlugin.appImages[1]}`;
            break;
          case 'splashscreen':
            targetPath = `${targetPath}${FolderPlugin.appImages[2]}`;
            break;
        }
        fs.copyFile(result.filePaths[0], targetPath, (err) => {
          if (err) {
            console.error(err);
            throw new Error(err.message);
          }
          this.loadParamsImage(event);
        });
      });
  };
}
