import fs from 'fs';
import async from 'async';
import {
  ApplicationConfigJson,
  ApplicationIdentityParams,
  ElectronIpcMainEvent,
  MenusViewsType,
} from 'types';
import FileService from '../../services/FileService';
import FolderPlugin from '../FolderPlugin';

import GameModulesPlugin from '../GameModulesPlugin';
import TrapezeService from '../../services/TrapezeService';
import LogService from '../../services/LogService';

export default class ApplicationHolidaysOverlayPlugin {
  getHolidaysOverlay = (
    event: ElectronIpcMainEvent,
    openConfigFile: () => ApplicationConfigJson
  ) => {
    event.reply('get-holidays-overlay', openConfigFile().holidaysOverlay);
  };

  setHolidaysOverlay = (
    event: ElectronIpcMainEvent,
    holidaysOverlay: ApplicationConfigJson['holidaysOverlay'],
    openConfigFile: () => ApplicationConfigJson,
    writeConfigFile: (config: Partial<ApplicationConfigJson>) => void
  ) => {
    writeConfigFile({ holidaysOverlay });
    this.getHolidaysOverlay(event, openConfigFile);
  };
}
