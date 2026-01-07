import fs from 'fs';
import async from 'async';
import { ElectronIpcMainEvent, MenusViewsType, PagesConfigType } from 'types';
import GameModulesPlugin from './GameModulesPlugin';
import FolderPlugin from './FolderPlugin';
import FileService from './../services/FileService';
import { ipcMain } from 'electron';

export default class PagesPlugin {
  openPagesConfig = () => {
    const { path } = global;
    return FileService.readJsonFile(`${path}${FolderPlugin.pagesConfig}`);
  };

  writePagesConfig = (pagesConfig: PagesConfigType) => {
    const { path } = global;
    return FileService.writeJsonFile(
      `${path}${FolderPlugin.pagesConfig}`,
      pagesConfig
    );
  };

  getPageConfig = (
    event: ElectronIpcMainEvent,
    page: 'home' | 'endDemo' | 'credits' = 'home'
  ) => {
    let menusView: MenusViewsType[] = [
      { module: 'default', path: 'pages/Home', used: false },
    ];
    let menuPath = FolderPlugin.menuPath;

    if (page === 'endDemo') {
      menusView = [{ module: 'default', path: 'pages/EndDemo', used: false }];
      menuPath = FolderPlugin.endDemoPath;
    }

    let currentMenuView: string | null = null;
    async.parallel(
      [
        (callback) => {
          GameModulesPlugin.loadDynamicModulesName().then((modules) => {
            modules.forEach((module) => {
              const pathHomeModule = `${path}${FolderPlugin.modulesDirectory}/${module}${menuPath}.tsx`;
              if (fs.existsSync(pathHomeModule)) {
                menusView.push({
                  module,
                  path: `${FolderPlugin.gameDevSoftwareDirectory.replace(
                    '/src/',
                    ''
                  )}/modules/${module}${menuPath}`,
                  used: false,
                });
              }
            });
            callback();
          });
        },
        (callback) => {
          this.openPagesConfig().then((data: PagesConfigType) => {
            if (page === 'home') {
              currentMenuView = data.homePath.path;
            } else if (page === 'endDemo') {
              currentMenuView = data.endDemoPath.path;
            } else if (page === 'credits') {
              currentMenuView = data.creditsPath.path;
            }

            callback();
          });
        },
      ],
      () => {
        const viewFind = menusView.find((m) => m.path === currentMenuView);
        if (viewFind) {
          viewFind.used = true;
        }
        if (page === 'home') {
          event.reply('get-page-home-config', menusView);
        } else if (page === 'endDemo') {
          event.reply('get-page-enddemo-config', menusView);
        }
      }
    );
  };

  setPageConfig = (
    event: ElectronIpcMainEvent,
    page: 'home' | 'endDemo' | 'credits',
    arg: string
  ) => {
    this.openPagesConfig()
      .then((results: PagesConfigType) => {
        if (page === 'home') {
          results.homePath.path = arg;
        } else if (page === 'endDemo') {
          results.endDemoPath.path = arg;
        } else if (page === 'credits') {
          results.creditsPath.path = arg;
        }

        return this.writePagesConfig(results);
      })
      .then(() => {
        this.getPageConfig(event, page);
      });
  };

  init = () => {
    ipcMain.on('get-page-home-config', (event: Electron.IpcMainEvent) =>
      this.getPageConfig(event as ElectronIpcMainEvent, 'home')
    );
    ipcMain.on('set-page-home-config', (event: Electron.IpcMainEvent, args) =>
      this.setPageConfig(event as ElectronIpcMainEvent, 'home', args)
    );
    ipcMain.on('get-page-enddemo-config', (event: Electron.IpcMainEvent) =>
      this.getPageConfig(event as ElectronIpcMainEvent, 'endDemo')
    );
    ipcMain.on(
      'set-page-enddemo-config',
      (event: Electron.IpcMainEvent, args) =>
        this.setPageConfig(event as ElectronIpcMainEvent, 'endDemo', args)
    );
  };
}
