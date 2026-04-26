import { dialog, BrowserWindow } from 'electron';
import { ApplicationImageParams, ElectronIpcMainEvent } from 'types';
import each from 'async/each';
import fs from 'fs';

import FolderPlugin from '../FolderPlugin';
import FileService from '../../services/FileService';
import { formatBase64 } from '../../../utils';

type ApplicationImageTarget =
  | keyof Omit<ApplicationImageParams, 'web2desktop'>
  | `web2desktop.${keyof ApplicationImageParams['web2desktop']}`;

export default class ApplicationImagesPlugin {
  constructor(private mainWindow: BrowserWindow) {}

  private getWeb2DesktopImageKey = (
    imagePath: string
  ): keyof ApplicationImageParams['web2desktop'] | null => {
    if (!imagePath.includes(FolderPlugin.electronDirectory)) return null;
    if (imagePath.endsWith('splash.png')) return 'splash';
    if (imagePath.endsWith('icon.icns')) return 'iconIcns';
    if (imagePath.endsWith('icon.ico')) return 'iconIco';
    if (imagePath.endsWith('icon@2x.png')) return 'icon2x';
    if (imagePath.endsWith('icon@3x.png')) return 'icon3x';
    if (imagePath.endsWith('icon.png')) return 'icon';
    return null;
  };

  private getImageTargetPath = (target: ApplicationImageTarget) => {
    const imagePathByTarget: Record<ApplicationImageTarget, string> = {
      favicon: FolderPlugin.appImages[0],
      icon: FolderPlugin.appImages[1],
      iconBackgroundAndroid: FolderPlugin.appImages[4],
      iconForegroundAndroid: FolderPlugin.appImages[5],
      'web2desktop.splash': FolderPlugin.appImages[6],
      'web2desktop.iconIcns': FolderPlugin.appImages[7],
      'web2desktop.iconIco': FolderPlugin.appImages[8],
      'web2desktop.icon': FolderPlugin.appImages[9],
      'web2desktop.icon2x': FolderPlugin.appImages[10],
      'web2desktop.icon3x': FolderPlugin.appImages[11],
    };
    return imagePathByTarget[target];
  };

  loadParamsImage = (event: ElectronIpcMainEvent) => {
    const { path } = global;
    const imageParams: ApplicationImageParams = {
      favicon: '',
      icon: '',
      iconBackgroundAndroid: '',
      iconForegroundAndroid: '',
      web2desktop: {
        icon: '',
        icon2x: '',
        icon3x: '',
        iconIcns: '',
        iconIco: '',
        splash: '',
      },
    };
    each(
      FolderPlugin.appImages,
      (image: string, callback: () => void) => {
        const imagePath = `${path}${image}`;
        if (!fs.existsSync(imagePath)) {
          callback();
          return;
        }

        FileService.getFileBase64(imagePath, (base64) => {
          base64 = formatBase64('image', base64, image);
          const web2desktopKey = this.getWeb2DesktopImageKey(image);

          if (web2desktopKey) {
            imageParams.web2desktop[web2desktopKey] = base64;
          } else if (image.endsWith('favicon.png')) {
            imageParams.favicon = base64;
          } else if (image.endsWith('icon-background.png')) {
            imageParams.iconBackgroundAndroid = base64;
          } else if (image.endsWith('icon-foreground.png')) {
            imageParams.iconForegroundAndroid = base64;
          } else if (image.endsWith('icon-only.png')) {
            imageParams.icon = base64;
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
    arg: ApplicationImageTarget
  ) => {
    const targetImagePath = this.getImageTargetPath(arg);
    if (!targetImagePath) return;

    dialog
      .showOpenDialog(this.mainWindow, {
        properties: ['openFile'],
        filters: [{ extensions: ['png', 'ico', 'icns'], name: 'Image' }],
      })
      .then((result) => {
        if (result.canceled || result.filePaths.length === 0) return;
        // @ts-ignore
        const targetPath = `${global.path}${targetImagePath}`;
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
