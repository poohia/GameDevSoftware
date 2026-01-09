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

    if (page === 'credits') {
      menusView = [{ module: 'default', path: 'pages/Credits', used: false }];
      menuPath = FolderPlugin.creditsPath;
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
        } else if (page === 'credits') {
          event.reply('get-page-credits-config', menusView);
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

  getSceneBeforeDemoId = (event: ElectronIpcMainEvent) => {
    this.openPagesConfig().then((results: PagesConfigType) => {
      event.reply(
        'get-page-scene-before-demo-id',
        results.endDemoPath.beforeSceneId || null
      );
    });
  };

  setSceneBeforeDemoId = (event: ElectronIpcMainEvent, id: number | null) => {
    this.openPagesConfig()
      .then((results: PagesConfigType) => {
        results.endDemoPath.beforeSceneId = id;
        return this.writePagesConfig(results);
      })
      .then(() => {
        this.getSceneBeforeDemoId(event);
      });
  };

  getCreditsBlock = (event: ElectronIpcMainEvent) => {
    this.openPagesConfig().then((results: PagesConfigType) => {
      event.reply('get-page-credits-blocks', results.creditsPath.blocks || {});
    });
  };

  setCreditsBlock = (event: ElectronIpcMainEvent, data: any) => {
    this.openPagesConfig()
      .then((results: PagesConfigType) => {
        results.creditsPath.blocks = data;
        return this.writePagesConfig(results);
      })
      .then(() => {
        this.getCreditsBlock(event);
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
    ipcMain.on('get-page-credits-config', (event: Electron.IpcMainEvent) =>
      this.getPageConfig(event as ElectronIpcMainEvent, 'credits')
    );
    ipcMain.on(
      'set-page-credits-config',
      (event: Electron.IpcMainEvent, args) =>
        this.setPageConfig(event as ElectronIpcMainEvent, 'credits', args)
    );
    ipcMain.on(
      'get-page-scene-before-demo-id',
      (event: Electron.IpcMainEvent) =>
        this.getSceneBeforeDemoId(event as ElectronIpcMainEvent)
    );
    ipcMain.on(
      'set-page-scene-before-demo-id',
      (event: Electron.IpcMainEvent, args) =>
        this.setSceneBeforeDemoId(event as ElectronIpcMainEvent, args)
    );
    ipcMain.on('get-page-credits-blocks', (event: Electron.IpcMainEvent) =>
      this.getCreditsBlock(event as ElectronIpcMainEvent)
    );
    ipcMain.on(
      'set-page-credits-blocks',
      (event: Electron.IpcMainEvent, args) =>
        this.setCreditsBlock(event as ElectronIpcMainEvent, args)
    );
  };
}
