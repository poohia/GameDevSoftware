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

export default class ApplicationAdvancedPlugin {
  updateIdentityForMobile = (
    identity: Pick<
      ApplicationIdentityParams,
      'version' | 'buildVersion' | 'name' | 'package'
    >
  ) => {
    TrapezeService.updateIdentity(identity);
  };

  loadMenusView = (event: ElectronIpcMainEvent) => {
    const { path } = global;
    const menusView: MenusViewsType[] = [
      { module: 'home', path: 'pages/Home', used: false },
    ];
    let currentMenuView: MenusViewsType | null = null;
    async.parallel(
      [
        (callback) => {
          GameModulesPlugin.loadDynamicModulesName().then((modules) => {
            modules.forEach((module) => {
              const pathHomeModule = `${path}${FolderPlugin.modulesDirectory}/${module}${FolderPlugin.menuPath}.tsx`;
              if (fs.existsSync(pathHomeModule)) {
                menusView.push({
                  module,
                  path: `${FolderPlugin.gameDevSoftwareDirectory.replace(
                    '/src/',
                    ''
                  )}/modules/${module}${FolderPlugin.menuPath}`,
                  used: false,
                });
              }
            });
            callback();
          });
        },
        (callback) => {
          FileService.readJsonFile(`${path}${FolderPlugin.menuConfig}`).then(
            (data) => {
              currentMenuView = data;
              callback();
            }
          );
        },
      ],
      () => {
        const viewFind = menusView.find(
          (m) => m.path === currentMenuView?.path
        );
        if (viewFind) {
          viewFind.used = true;
        }
        event.reply('load-menus-views', menusView);
      }
    );
  };

  loadCurrentOrientation = (
    event: ElectronIpcMainEvent,
    openConfigFile: () => ApplicationConfigJson
  ) => {
    event.reply('load-current-orientation', openConfigFile().screenOrientation);
  };

  setCurrentOrientation = (
    event: ElectronIpcMainEvent,
    orientation: ApplicationConfigJson['screenOrientation'],
    openConfigFile: () => ApplicationConfigJson,
    writeConfigFile: (config: Partial<ApplicationConfigJson>) => void
  ) => {
    TrapezeService.updateOrientation(orientation).then(() => {
      writeConfigFile({ screenOrientation: orientation });
      this.loadCurrentOrientation(event, openConfigFile);
    });
  };

  loadFontFamily = (
    event: ElectronIpcMainEvent,
    openConfigFile: () => ApplicationConfigJson
  ) => {
    event.reply('load-fontFamily', openConfigFile().fontFamily);
  };

  setFontFamily = (
    event: ElectronIpcMainEvent,
    fontFamily: string,
    openConfigFile: () => ApplicationConfigJson,
    writeConfigFile: (config: Partial<ApplicationConfigJson>) => void
  ) => {
    writeConfigFile({ fontFamily });
    this.loadCurrentOrientation(event, openConfigFile);
  };

  loadBackground = (
    event: ElectronIpcMainEvent,
    openConfigFile: () => ApplicationConfigJson
  ) => {
    event.reply('load-background', openConfigFile().background);
  };

  setBackground = (
    event: ElectronIpcMainEvent,
    background: string,
    openConfigFile: () => ApplicationConfigJson,
    writeConfigFile: (config: Partial<ApplicationConfigJson>) => void
  ) => {
    writeConfigFile({ background });
    this.loadCurrentOrientation(event, openConfigFile);
  };
}
