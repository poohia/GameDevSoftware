import { ipcMain, dialog, BrowserWindow } from 'electron';
import fs from 'fs';
import { ElectronIpcMainEvent } from 'types';

export default class FolderPlugin {
  constructor(private mainWindow: BrowserWindow) {}
  static srcDirectory = '/src';
  static publicDirectory = '/public';
  static resourcesDirectory = '/resources';
  static platformsDirectory = '/platforms';
  static cypressDirectory = `cypress`;

  static gameDevSoftwareDirectory = `${FolderPlugin.srcDirectory}/GameDevSoftware`;
  static modulesDirectory = `${FolderPlugin.gameDevSoftwareDirectory}/modules`;

  static translationDirectory = `${FolderPlugin.srcDirectory}/translations`;
  static languageFile = `${FolderPlugin.gameDevSoftwareDirectory}/languages.json`;
  static constantFile = `${FolderPlugin.gameDevSoftwareDirectory}/constants.json`;
  static assetFile = `${FolderPlugin.gameDevSoftwareDirectory}/assets.json`;
  /** Menu and Parameters */
  static menuPath = '/pages/Home';
  static menuConfig = `${FolderPlugin.gameDevSoftwareDirectory}/homecomponent.json`;
  /** Game Objects */
  static gameObjectTypesDirectory = `/gameobjectTypes`;
  static gameObjectDirectory = `${FolderPlugin.gameDevSoftwareDirectory}/gameObjects`;
  static gameObjectFile = `${FolderPlugin.gameObjectDirectory}/index.json`;
  /* Scenes  */
  static sceneTypesDirectory = `/scenesTypes`;
  static sceneDirectory = `${FolderPlugin.gameDevSoftwareDirectory}/scenes`;
  static sceneFile = `${FolderPlugin.sceneDirectory}/index.json`;
  /* ShortcutsFolderFile */
  static shortcutsFolderFile = `/shortcutsFolders.json`;
  /* ChatGPT */
  static chatGPTFile = '/chatgpt.json';
  /** */
  static configFile = `/capacitor.config.json`;
  static configFileJson = '/src/config.json';
  static indexHtml = `/index.html`;
  /** directories */
  static assetsDirectory = `${FolderPlugin.publicDirectory}/assets`;
  static directoryImages = `${FolderPlugin.assetsDirectory}/images`;
  static directoryVideos = `${FolderPlugin.assetsDirectory}/videos`;
  static directorySounds = `${FolderPlugin.assetsDirectory}/sounds`;
  static directoryJson = `${FolderPlugin.gameDevSoftwareDirectory}/configurationsFiles`;
  /** env files */
  static envFolder = `${FolderPlugin.gameDevSoftwareDirectory}/envs`;
  static envFiles = [
    '/env.development.json',
    '/env.production.json',
    '/env.default.json',
  ];
  /** */
  /** */
  static splashscreenFileConfig = `${FolderPlugin.gameDevSoftwareDirectory}/splashscreen.json`;
  static splashscreenAssetFolder = `${FolderPlugin.assetsDirectory}/splashscreen`;
  static splashscreenBrandImageFile = `${FolderPlugin.splashscreenAssetFolder}/brand.png`;
  static splashscreenGamePromotionFile = `${FolderPlugin.splashscreenAssetFolder}/game_promotion.mp4`;
  /** */
  static appImages = [
    `${FolderPlugin.publicDirectory}/favicon.png`,
    `${FolderPlugin.resourcesDirectory}/icon-only.png`,
    `${FolderPlugin.resourcesDirectory}/splash.png`,
    `${FolderPlugin.resourcesDirectory}/splash.png`,
    `${FolderPlugin.resourcesDirectory}/icon-background.png`,
    `${FolderPlugin.resourcesDirectory}/icon-foreground.png`,
  ];
  static appPlatforms = [
    `/android`,
    `/ios`,
    `${FolderPlugin.platformsDirectory}/electron`,
    `/build`,
  ];
  /** fonts */
  static fontFile = `${FolderPlugin.gameDevSoftwareDirectory}/fonts.json`;
  static directoryFonts = `${FolderPlugin.assetsDirectory}/fonts`;

  static packageJSONFile = '/package.json';
  static trapezeFile = '/app.yaml';

  static typesFiles = 'game-types.ts';
  static typesFilesSave = 'game-types.ts.save';

  static savesFile = `${FolderPlugin.gameDevSoftwareDirectory}/saves.json`;

  /** Cypress */
  static cypressScreenshotsDirectory = `${FolderPlugin.cypressDirectory}/cypress/screenshots`;

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
