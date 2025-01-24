import { ElectronIpcMainEvent, PlatformsParams } from 'types';
import async from 'async';
import fs from 'fs';
import portfinder from 'portfinder';
import FolderPlugin from '../FolderPlugin';
import CapacitorService from '../../services/CapacitorService';

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
          // if (platformDirectory.endsWith('electron'))
          //   _platforms.electron = isExist;
          if (platformDirectory.endsWith('build')) _platforms.browser = isExist;
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
    CapacitorService.removePlatform(platform, (err) => {
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
    CapacitorService.addPlatform(platform, (err) => {
      if (err) {
        console.error(err);
        // throw new Error(err.message);
      }
      this.loadPlatforms(event);
    });
  };

  checkProjectStarted = (event: Electron.IpcMainEvent) => {
    portfinder
      .getPortPromise({ port: 3333 })
      .then((port) => {
        if (port === 3333) {
          event.reply('projected-started', false);
        } else {
          event.reply('projected-started', true);
        }
      })
      .catch(() => {
        event.reply('projected-started', false);
      });
  };

  toggleProject = (_event: ElectronIpcMainEvent) => {
    const _capacitorService: CapacitorService =
      // @ts-ignore
      global.serviceContainer.get('capacitorService');
    _capacitorService.toggleProcess();
  };
}
