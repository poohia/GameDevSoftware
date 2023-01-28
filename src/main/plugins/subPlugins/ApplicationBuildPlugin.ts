import CordovaService from '../../services/CordovaService';
import { ElectronIpcMainEvent, PlatformsParams } from 'types';
import detectPort from 'detect-port';
import killPort from 'kill-port';

export default class ApplicationBuildPlugin {
  preparePlatform = (
    event: ElectronIpcMainEvent,
    arg: keyof PlatformsParams
  ) => {
    CordovaService.preparePlatform(arg, (err) => {
      if (err) {
        event.reply('prepare-platform', false);
      }
      event.reply('prepare-platform', true);
    });
  };

  buildPlatform = (event: ElectronIpcMainEvent, arg: keyof PlatformsParams) => {
    CordovaService.buildPlatform(arg, (err) => {
      if (err) {
        event.reply('build-platform', false);
      }
      event.reply('build-platform', true);
    });
  };

  emulatePlatform = (
    _event: ElectronIpcMainEvent,
    arg: keyof PlatformsParams
  ) => {
    const cordovaService: CordovaService =
      // @ts-ignore
      global.serviceContainer.get('cordovaService');
    switch (arg) {
      case 'android':
        CordovaService.openAndroidStudio();
        break;
      case 'ios':
        CordovaService.openXcode();
        break;
      case 'electron':
        cordovaService.openElectron();
        break;
      case 'browser':
        detectPort(8000).then((port) => {
          if (port === 8000) {
            cordovaService.openBrowser();
          } else {
            killPort(8000);
          }
        });
        break;
    }
  };
}
