import CapacitorService from '../../services/CapacitorService';
import { ElectronIpcMainEvent, PlatformsParams } from 'types';

export default class ApplicationBuildPlugin {
  preparePlatform = (
    event: ElectronIpcMainEvent,
    arg: keyof PlatformsParams
  ) => {
    CapacitorService.preparePlatform(arg, (err) => {
      if (err) {
        event.reply('prepare-platform', false);
      }
      event.reply('prepare-platform', true);
    });
  };

  buildPlatform = (event: ElectronIpcMainEvent, arg: keyof PlatformsParams) => {
    CapacitorService.buildPlatform(arg, (err) => {
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
    const capacitorService: CapacitorService =
      // @ts-ignore
      global.serviceContainer.get('capacitorService');
    switch (arg) {
      case 'android':
        CapacitorService.openAndroidStudio();
        break;
      case 'ios':
        CapacitorService.openXcode();
        break;
      case 'electron':
        capacitorService.openElectron();
        break;
      case 'browser':
        capacitorService.openBrowser();
        break;
    }
  };
}
