import fs from 'fs';
import async from 'async';
import {
  ApplicationConfigJson,
  ElectronIpcMainEvent,
  MenusViewsType,
} from 'types';
import FileService from '../../services/FileService';
import FolderPlugin from '../FolderPlugin';

import GameModulesPlugin from '../GameModulesPlugin';

export default class ApplicationAdvancedPlugin {
  loadMenusView = (event: ElectronIpcMainEvent) => {
    // @ts-ignore
    const { path } = global;
    const menusView: MenusViewsType[] = [
      { module: 'home', path: './pages/Home', used: false },
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
                  path: `.${FolderPlugin.gameDevSoftwareDirectory.replace(
                    'src/',
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
}
