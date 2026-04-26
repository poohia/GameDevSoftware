import { ipcMain, dialog, BrowserWindow } from 'electron';
import fs from 'fs';
import pathModule from 'path';
import { ElectronIpcMainEvent } from 'types';
import { LocalStorageIframePlugin } from './subPlugins';

export default class FolderPlugin {
  private _localStorageIframePlugin;

  constructor(private mainWindow: BrowserWindow) {
    this._localStorageIframePlugin = new LocalStorageIframePlugin(
      this.mainWindow
    );
  }
  static srcDirectory = '/src';
  static publicDirectory = '/public';
  static resourcesDirectory = '/resources';
  static cypressDirectory = `cypress`;
  static electronDirectory = 'web2desktop';

  static gameDevSoftwareDirectory = pathModule.join(
    FolderPlugin.srcDirectory,
    'GameDevSoftware'
  );
  static modulesDirectory = pathModule.join(
    FolderPlugin.gameDevSoftwareDirectory,
    'modules'
  );

  static translationDirectory = pathModule.join(
    FolderPlugin.srcDirectory,
    'translations'
  );
  static languageFile = pathModule.join(
    FolderPlugin.gameDevSoftwareDirectory,
    'languages.json'
  );
  static constantFile = pathModule.join(
    FolderPlugin.gameDevSoftwareDirectory,
    'constants.json'
  );
  static assetFile = pathModule.join(
    FolderPlugin.gameDevSoftwareDirectory,
    'assets.json'
  );
  /** Menu and Parameters */
  static menuPath = pathModule.join('/pages', 'Home');
  static endDemoPath = pathModule.join('/pages', 'EndDemo');
  static creditsPath = pathModule.join('/pages', 'Credits');
  static menuConfig = pathModule.join(
    FolderPlugin.gameDevSoftwareDirectory,
    'homecomponent.json'
  );
  static pagesConfig = pathModule.join(
    FolderPlugin.gameDevSoftwareDirectory,
    'pages.json'
  );
  /** Game Objects */
  static gameObjectTypesDirectory = `/gameobjectTypes`;
  static gameObjectDirectory = pathModule.join(
    FolderPlugin.gameDevSoftwareDirectory,
    'gameObjects'
  );
  static gameObjectFile = pathModule.join(
    FolderPlugin.gameObjectDirectory,
    'index.json'
  );
  /* Scenes  */
  static sceneTypesDirectory = `/scenesTypes`;
  static sceneDirectory = pathModule.join(
    FolderPlugin.gameDevSoftwareDirectory,
    'scenes'
  );
  static sceneFile = pathModule.join(FolderPlugin.sceneDirectory, 'index.json');
  /* ShortcutsFolderFile */
  static shortcutsFolderFile = `/shortcutsFolders.json`;
  /* ChatGPT */
  static chatGPTFile = '/chatgpt.json';
  /** */
  static configFile = `/capacitor.config.json`;
  static configFileJson = pathModule.join(
    FolderPlugin.srcDirectory,
    'config.json'
  );
  static indexHtml = `/index.html`;
  /** directories */
  static assetsDirectory = pathModule.join(
    FolderPlugin.publicDirectory,
    'assets'
  );
  static directoryImages = pathModule.join(
    FolderPlugin.assetsDirectory,
    'images'
  );
  static directoryVideos = pathModule.join(
    FolderPlugin.assetsDirectory,
    'videos'
  );
  static directorySounds = pathModule.join(
    FolderPlugin.assetsDirectory,
    'sounds'
  );
  static directoryJson = pathModule.join(
    FolderPlugin.gameDevSoftwareDirectory,
    'configurationsFiles'
  );
  /** env files */
  static envFolder = pathModule.join(
    FolderPlugin.gameDevSoftwareDirectory,
    'envs'
  );
  static envFiles = [
    '/env.development.json',
    '/env.production.json',
    '/env.default.json',
  ];
  /** */
  /** */
  static splashscreenFileConfig = pathModule.join(
    FolderPlugin.gameDevSoftwareDirectory,
    'splashscreen.json'
  );
  static splashscreenAssetFolder = pathModule.join(
    FolderPlugin.assetsDirectory,
    'splashscreen'
  );
  static splashscreenBrandImageFile = pathModule.join(
    FolderPlugin.splashscreenAssetFolder,
    'brand.png'
  );
  static splashscreenGamePromotionFile = pathModule.join(
    FolderPlugin.splashscreenAssetFolder,
    'game_promotion.mp4'
  );
  /** */
  static appImages = [
    pathModule.join(FolderPlugin.publicDirectory, 'favicon.png'),
    pathModule.join(FolderPlugin.resourcesDirectory, 'icon-only.png'),
    pathModule.join(FolderPlugin.resourcesDirectory, 'splash.png'),
    pathModule.join(FolderPlugin.resourcesDirectory, 'splash.png'),
    pathModule.join(FolderPlugin.resourcesDirectory, 'icon-background.png'),
    pathModule.join(FolderPlugin.resourcesDirectory, 'icon-foreground.png'),
  ];
  static appPlatforms = [`/android`, `/ios`, `/web2desktop`, `/build`];
  /** fonts */
  static fontFile = pathModule.join(
    FolderPlugin.gameDevSoftwareDirectory,
    'fonts.json'
  );
  static directoryFonts = pathModule.join(
    FolderPlugin.assetsDirectory,
    'fonts'
  );

  static packageJSONFile = '/package.json';
  static trapezeFile = '/app.yaml';

  static typesFiles = 'game-types.ts';
  static typesFilesSave = 'game-types.ts.save';

  static savesFile = pathModule.join(
    FolderPlugin.gameDevSoftwareDirectory,
    'saves.json'
  );

  static themeFile = pathModule.join(
    FolderPlugin.gameDevSoftwareDirectory,
    'theme.json'
  );
  static cacheFile = pathModule.join(
    FolderPlugin.gameDevSoftwareDirectory,
    'caches.json'
  );

  /** Web2Desktop */
  static web2desktopConfigFiles = [
    pathModule.join(
      FolderPlugin.resourcesDirectory,
      'web2desktop',
      'config.local.json'
    ),
    pathModule.join(
      FolderPlugin.electronDirectory,
      FolderPlugin.srcDirectory,
      'config.local.json'
    ),
  ];

  /** Cypress */
  static cypressScreenshotsDirectory = pathModule.join(
    FolderPlugin.cypressDirectory,
    'cypress',
    'screenshots'
  );

  static validePath(path: string) {
    let isValid = true;
    if (!fs.existsSync(`${path}${FolderPlugin.configFile}`)) {
      isValid = false;
    } else if (!fs.existsSync(`${path}${FolderPlugin.translationDirectory}`)) {
      isValid = false;
    } else if (!fs.existsSync(`${path}${FolderPlugin.translationDirectory}`)) {
      isValid = false;
    } else if (!fs.existsSync(`${path}${FolderPlugin.constantFile}`)) {
      isValid = false;
    } else if (!fs.existsSync(`${path}${FolderPlugin.assetFile}`)) {
      isValid = false;
    } else if (!fs.existsSync(`${path}${FolderPlugin.fontFile}`)) {
      isValid = false;
    } else if (!fs.existsSync(`${path}${FolderPlugin.pagesConfig}`)) {
      isValid = false;
    }

    return isValid;
  }

  static saveGlobalPath(path: string) {
    // @ts-ignore
    global.path = path;
  }

  loadLastOpenDirectory = (event: ElectronIpcMainEvent, ...args: any[]) => {
    const path = args[0];
    if (FolderPlugin.validePath(path)) {
      event.reply('path-is-correct', path);
      FolderPlugin.saveGlobalPath(path);
    } else {
      event.reply('path-is-correct', null);
    }
  };

  openDirectory = (event: ElectronIpcMainEvent) => {
    dialog
      .showOpenDialog(this.mainWindow, {
        properties: ['openDirectory'],
      })
      .then((result) => {
        const path = result.filePaths[0];
        if (FolderPlugin.validePath(path)) {
          this._localStorageIframePlugin.resetViewDatabase();
          event.reply('set-path', path);
          event.reply('path-is-correct', path);
          FolderPlugin.saveGlobalPath(path);
        } else {
          event.reply('set-path', null);
        }
      });
  };

  init = () => {
    ipcMain.on('select-path', (event: Electron.IpcMainEvent) =>
      this.openDirectory(event as ElectronIpcMainEvent)
    );
    ipcMain.on('last-path', (event: Electron.IpcMainEvent, args: any[]) =>
      this.loadLastOpenDirectory(event as ElectronIpcMainEvent, args)
    );
  };
}
