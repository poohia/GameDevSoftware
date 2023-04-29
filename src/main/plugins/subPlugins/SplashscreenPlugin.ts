import FileService from '../../services/FileService';
import { ElectronIpcMainEvent, SplashscreenType } from 'types';
import FolderPlugin from '../FolderPlugin';
import { formatBase64 } from '../../../utils';

export default class SplashscreenPlugin {
  constructor(private mainWindow: BrowserWindow);

  private openFile = () => {
    // @ts-ignore
    const { path } = global;
    return FileService.readJsonFile(
      `${path}${FolderPlugin.splashscreenFileConfig}`
    );
  };

  private writeFile = (data: SplashscreenType) => {
    // @ts-ignore
    const { path } = global;
    return FileService.writeJsonFile(
      `${path}${FolderPlugin.splashscreenFileConfig}`,
      data
    );
  };

  openSplashscreenFile = (event: ElectronIpcMainEvent) => {
    // @ts-ignore
    const { path } = global;
    this.openFile().then((data: SplashscreenType) => {
      FileService.getFileBase64(
        `${path}${FolderPlugin.publicDirectory}/${data.brandImage}`,
        (base64) => {
          data.brandImage = formatBase64('image', base64);
          FileService.getFileBase64(
            `${path}${FolderPlugin.publicDirectory}/${data.gamePromotionVideo}`,
            (videoBase64) => {
              data.gamePromotionVideo = formatBase64('video', videoBase64);
              event.reply('load-splashscreen-informations', data);
            }
          );
        }
      );
    });
  };

  modifySlogan = (event: ElectronIpcMainEvent, arg: string) => {
    this.openFile().then((data: SplashscreenType) => {
      data.brandSlogan = arg;
      this.writeFile(data).then(() => this.openSplashscreenFile(event));
    });
  };

  replaceBrandImage = (event: ElectronIpcMainEvent) => {
    // @ts-ignore
    const { path } = global;
    FileService.replaceFile(
      `${path}${FolderPlugin.splashscreenBrandImageFile}`,
      this.mainWindow,
      {
        properties: ['openFile'],
        filters: [{ extensions: ['.png'], name: 'Image' }],
      }
    ).then(() => this.openSplashscreenFile(event));
  };

  replaceGamePromotionVideo = (event: ElectronIpcMainEvent) => {
    // @ts-ignore
    const { path } = global;
    FileService.replaceFile(
      `${path}${FolderPlugin.splashscreenGamePromotionFile}`,
      this.mainWindow,
      {
        properties: ['openFile'],
        filters: [{ extensions: ['mp4'], name: 'Video' }],
      }
    ).then(() => this.openSplashscreenFile(event));
  };
}
