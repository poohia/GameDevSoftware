import { BrowserWindow, ipcMain } from 'electron';
import fs from 'fs';
import async from 'async';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import {
  ApplicationConfigJson,
  ApplicationIdentityParams,
  ElectronIpcMainEvent,
  SoftwaresInfo,
} from 'types';
import FolderPlugin from './FolderPlugin';
import {
  ApplicationImagesPlugin,
  ApplicationPlatformsPlugin,
  ApplicationBuildPlugin,
  SplashscreenPlugin,
} from './subPlugins';
import VersionSoftwareService from '../services/VersionSoftwareService';
import FileService from '../services/FileService';
import ApplicationAdvancedPlugin from './subPlugins/ApplicationAdvancedPlugin';
import PackageJSONService from '../services/PackageJSONService';

const options = {
  ignoreAttributes: false,
  format: true,
  suppressEmptyNode: true,
};
const parser = new XMLParser(options);
const builder = new XMLBuilder(options);

export default class ApplicationPlugin {
  private _imagePlugin;
  private _platformsPlugin;
  private _buildPlugin;
  private _splashscreenPlugin;
  private _softwaresToCheck: Array<keyof SoftwaresInfo> = [
    'git',
    'node',
    'npm',
    'capacitor',
  ];
  private _advancedPlugin: ApplicationAdvancedPlugin;

  constructor(private mainWindow: BrowserWindow) {
    this._imagePlugin = new ApplicationImagesPlugin(this.mainWindow);
    this._platformsPlugin = new ApplicationPlatformsPlugin();
    this._buildPlugin = new ApplicationBuildPlugin();
    this._splashscreenPlugin = new SplashscreenPlugin(this.mainWindow);
    this._advancedPlugin = new ApplicationAdvancedPlugin();
  }

  // static refreshConfigFileToSrc = (callback?: (err?: Error) => void) => {
  //   // @ts-ignore
  //   const path = global.path;
  //   // exec(`node ./hooks/exec_edit_config.js`, { cwd: path }, (error) => {
  //   //   callback && callback(Error(error?.message));
  //   // });
  //   callback();
  // };

  private writeOnIndexHtml = (
    args: Pick<ApplicationIdentityParams, 'name' | 'description'>
  ) => {
    // @ts-ignore
    const { path } = global;
    const xmlString = fs.readFileSync(
      `${path}${FolderPlugin.indexHtml}`,
      'utf8'
    );
    const xml = parser.parse(xmlString);
    const { head } = xml.html;
    const { meta } = head;
    head.title = args.name;
    meta.forEach((m: any) => {
      if (m['@_name'] === 'description') {
        m['@_content'] = args.description;
      }
    });
    fs.writeFile(
      `${path}${FolderPlugin.indexHtml}`,
      builder.build(xml),
      () => {}
    );
  };

  private mergeObjects = (obj1: any, obj2: any) => {
    const merged = { ...obj1 };

    for (let key in obj2) {
      if (obj2.hasOwnProperty(key)) {
        if (
          typeof obj2[key] === 'object' &&
          obj1.hasOwnProperty(key) &&
          typeof obj1[key] === 'object'
        ) {
          merged[key] = this.mergeObjects(obj1[key], obj2[key]); // Appel récursif pour les objets imbriqués
        } else {
          merged[key] = obj2[key];
        }
      }
    }

    return merged;
  };

  private openConfigFile = (): ApplicationConfigJson => {
    // @ts-ignore
    const { path } = global;
    const data = fs.readFileSync(`${path}${FolderPlugin.configFileJson}`);
    // @ts-ignore
    return JSON.parse(data);
  };

  private writeConfigFile = (json: Partial<ApplicationConfigJson>) => {
    let data = this.openConfigFile();
    const finalJSON = this.mergeObjects(data, json);
    // @ts-ignore
    const { path } = global;
    fs.writeFileSync(
      `${path}${FolderPlugin.configFileJson}`,
      JSON.stringify(finalJSON, null, 4)
    );
  };

  loadParamsIdentity = (event: ElectronIpcMainEvent) => {
    const json = this.openConfigFile();
    const data: ApplicationIdentityParams = {
      package: json.build.id,
      version: json.build.version,
      buildVersion: json.build.android.versionCode,
      name: json.name,
      description: json.description || '',
      authorName: json.author?.name || '',
      authorEmail: json.author?.email || '',
      authorWebSite: json.author?.link || '',
      appStore: json.appStore || '',
      playStore: json.playStore || '',
      webStore: json.webStore || '',
    };
    event.reply('load-params-identity', data);
  };

  setParamsIdentity = (
    event: ElectronIpcMainEvent,
    args: ApplicationIdentityParams
  ) => {
    async.parallel([
      () => {
        let json = this.openConfigFile();

        json = {
          ...json,
          name: args.name,
          build: {
            version: args.version,
            id: args.package,
            android: {
              versionCode: args.buildVersion,
            },
            ios: {
              CFBundleVersion: args.buildVersion,
            },
          },
          description: args.description || '',
          author: {
            email: args.authorEmail,
            link: args.authorWebSite,
            name: args.authorName,
          },
          appStore: args.appStore,
          playStore: args.playStore,
          webStore: args.webStore,
        };
        this.writeConfigFile(json);
        this.loadParamsIdentity(event);
      },
      () => {
        this.writeOnIndexHtml({
          name: args.name,
          description: args.description,
        });
      },
      () => {
        this._advancedPlugin.updateIdentityForMobile(args);
      },
      () => {
        PackageJSONService.updateVersion(args.version);
      },
    ]);
    // ApplicationPlugin.refreshConfigFileToSrc();
  };

  getSoftwaresInfo = (event: ElectronIpcMainEvent) => {
    const softwaresInfo: SoftwaresInfo = {
      git: null,
      node: null,
      npm: null,
      capacitor: null,
    };
    async.each(
      this._softwaresToCheck,
      (software: keyof SoftwaresInfo, callback) => {
        VersionSoftwareService.getVersion(software).then((value) => {
          softwaresInfo[software] = value;
          callback();
        });
      },
      () => {
        event.reply('get-softwares-info', softwaresInfo);
      }
    );
  };

  setMenuView = (event: ElectronIpcMainEvent, arg: string) => {
    // @ts-ignore
    const { path } = global;
    FileService.writeJsonFile(`${path}${FolderPlugin.menuConfig}`, {
      path: arg,
    }).then(() => {
      this._advancedPlugin.loadMenusView(event);
    });
  };

  init = () => {
    ipcMain.on('load-params-identity', (event: Electron.IpcMainEvent) =>
      this.loadParamsIdentity(event as ElectronIpcMainEvent)
    );
    ipcMain.on('set-params-identity', (event: Electron.IpcMainEvent, args) =>
      this.setParamsIdentity(event as ElectronIpcMainEvent, args)
    );
    ipcMain.on('load-params-image', (event: Electron.IpcMainEvent) =>
      this._imagePlugin.loadParamsImage(event as ElectronIpcMainEvent)
    );
    ipcMain.on('replace-params-image', (event: Electron.IpcMainEvent, args) =>
      this._imagePlugin.replaceParamsImage(event as ElectronIpcMainEvent, args)
    );
    ipcMain.on('load-platforms', (event: Electron.IpcMainEvent) =>
      this._platformsPlugin.loadPlatforms(event as ElectronIpcMainEvent)
    );
    ipcMain.on('remove-platform', (event: Electron.IpcMainEvent, args) =>
      this._platformsPlugin.removePlatform(event as ElectronIpcMainEvent, args)
    );
    ipcMain.on('add-platform', (event: Electron.IpcMainEvent, args) =>
      this._platformsPlugin.addPlatform(event as ElectronIpcMainEvent, args)
    );
    ipcMain.on('projected-started', (event: Electron.IpcMainEvent) => {
      this._platformsPlugin.checkProjectStarted(event);
    });
    ipcMain.on('toggle-project', (event: Electron.IpcMainEvent) =>
      this._platformsPlugin.toggleProject(event as ElectronIpcMainEvent)
    );
    ipcMain.on('get-softwares-info', (event: Electron.IpcMainEvent) =>
      this.getSoftwaresInfo(event as ElectronIpcMainEvent)
    );
    ipcMain.on('load-menus-views', (event: Electron.IpcMainEvent) =>
      this._advancedPlugin.loadMenusView(event as ElectronIpcMainEvent)
    );
    ipcMain.on('set-menu-view', (event: Electron.IpcMainEvent, args) =>
      this.setMenuView(event as ElectronIpcMainEvent, args)
    );
    ipcMain.on('build-platform', (event: Electron.IpcMainEvent) =>
      this._buildPlugin.buildPlatform(event as ElectronIpcMainEvent)
    );
    ipcMain.on('prepare-platform', (event: Electron.IpcMainEvent, args) =>
      this._buildPlugin.preparePlatform(event as ElectronIpcMainEvent, args)
    );
    ipcMain.on('emulate-platform', (event: Electron.IpcMainEvent, args) =>
      this._buildPlugin.emulatePlatform(event as ElectronIpcMainEvent, args)
    );
    ipcMain.on(
      'load-splashscreen-informations',
      (event: Electron.IpcMainEvent) => {
        this._splashscreenPlugin.openSplashscreenFile(
          event as ElectronIpcMainEvent
        );
      }
    );
    ipcMain.on(
      'splashscreen-modify-slogan',
      (event: Electron.IpcMainEvent, args) => {
        this._splashscreenPlugin.modifySlogan(
          event as ElectronIpcMainEvent,
          args
        );
      }
    );
    ipcMain.on(
      'splashscreen-replace-brand-image',
      (event: Electron.IpcMainEvent) => {
        this._splashscreenPlugin.replaceBrandImage(
          event as ElectronIpcMainEvent
        );
      }
    );
    ipcMain.on(
      'splashscreen-replace-promotion-video',
      (event: Electron.IpcMainEvent) => {
        this._splashscreenPlugin.replaceGamePromotionVideo(
          event as ElectronIpcMainEvent
        );
      }
    );
    ipcMain.on('load-current-orientation', (event: Electron.IpcMainEvent) => {
      this._advancedPlugin.loadCurrentOrientation(
        event as ElectronIpcMainEvent,
        this.openConfigFile
      );
    });
    ipcMain.on(
      'set-current-orientation',
      (event: Electron.IpcMainEvent, args) => {
        this._advancedPlugin.setCurrentOrientation(
          event as ElectronIpcMainEvent,
          args,
          this.openConfigFile,
          this.writeConfigFile
        );
      }
    );
  };
}
