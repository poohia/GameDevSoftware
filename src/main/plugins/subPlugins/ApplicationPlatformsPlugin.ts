import { ElectronIpcMainEvent, PlatformsParams } from 'types';
import async from 'async';
import fs from 'fs';
import detect from 'detect-port';
import FolderPlugin from '../FolderPlugin';
import CordovaService from '../../services/CordovaService';

export default class ApplicationPlatformsPlugin {
  loadPlatforms = (event: ElectronIpcMainEvent) => {
    // @ts-ignore
    const path = global.path;
    const _platforms: PlatformsParams = {
      android: false,
      ios: false,
      browser: false,
      electron: false,
    };
    async.each(
      FolderPlugin.appPlatforms,
      (platformDirectory: string, callback: (error?: Error) => void) => {
        fs.access(`${path}${platformDirectory}`, (err) => {
          let isExist = false;
          if (!err) {
            isExist = true;
          }
          if (platformDirectory.endsWith('android'))
            _platforms.android = isExist;
          if (platformDirectory.endsWith('ios')) _platforms.ios = isExist;
          if (platformDirectory.endsWith('electron'))
            _platforms.electron = isExist;
          if (platformDirectory.endsWith('browser'))
            _platforms.browser = isExist;
          callback();
        });
      },
      () => {
        event.reply('load-platforms', _platforms);
      }
    );
  };

  removePlatform = (
    event: ElectronIpcMainEvent,
    platform: keyof PlatformsParams
  ) => {
    CordovaService.removePlatform(platform, (err) => {
      if (err) {
        console.error(err);
        // throw new Error(err.message);
      }
      this.loadPlatforms(event);
    });
  };

  addPlatform = (
    event: ElectronIpcMainEvent,
    platform: keyof PlatformsParams
  ) => {
    if (process.platform !== 'darwin' && platform === 'ios') {
      return;
    }
    CordovaService.addPlatform(platform, (err) => {
      if (err) {
        console.error(err);
        // throw new Error(err.message);
      }
      this.loadPlatforms(event);
    });
  };

  checkProjectStarted = (event: Electron.IpcMainEvent) => {
    detect(3333)
      .then(() => event.reply('projected-started', true))
      .catch(() => event.reply('projected-started', true));
  };

  toggleProject = (_event: ElectronIpcMainEvent) => {
    const _cordovaService: CordovaService =
      // @ts-ignore
      global.serviceContainer.get('cordovaService');
    _cordovaService.toggleProcess();
  };
}
