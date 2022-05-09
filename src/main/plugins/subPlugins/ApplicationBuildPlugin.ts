import CordovaService from '../../services/CordovaService';
import { ElectronIpcMainEvent, PlatformsParams } from 'types';

export default class ApplicationBuildPlugin {
  private _browserIsOpenned = false;
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
      global.serviceContainer.get('cordova');
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
        if (this._browserIsOpenned) {
          cordovaService.closeBrowser();
          this._browserIsOpenned = false;
        } else {
          cordovaService.openBrowser();
          this._browserIsOpenned = true;
        }
        break;
    }
  };
}
