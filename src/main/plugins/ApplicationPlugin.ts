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
} from './subPlugins';
import VersionSoftwareService from '../services/VersionSoftwareService';

const options = { ignoreAttributes: false, format: true };
const parser = new XMLParser(options);
const builder = new XMLBuilder(options);

export default class ApplicationPlugin {
  private _imagePlugin;
  private _platformsPlugin;
  private _buildPlugin;
  private _softwaresToCheck: Array<keyof SoftwaresInfo> = [
    'git',
    'node',
    'npm',
    'cordova',
  ];
  constructor(private mainWindow: BrowserWindow) {
    this._imagePlugin = new ApplicationImagesPlugin(mainWindow);
    this._platformsPlugin = new ApplicationPlatformsPlugin();
    this._buildPlugin = new ApplicationBuildPlugin();
  }

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

  private openConfigFile = (): ApplicationConfigJson => {
    // @ts-ignore
    const { path } = global;
    const data = fs.readFileSync(`${path}${FolderPlugin.configFileJson}`);
    // @ts-ignore
    return JSON.parse(data);
  };

  private writeConfigFile = (json: ApplicationConfigJson) => {
    // @ts-ignore
    const { path } = global;
    fs.writeFileSync(
      `${path}${FolderPlugin.configFileJson}`,
      JSON.stringify(json)
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
    };
    event.reply('load-params-identity', data);
  };

  setParamsIdentity = (
    event: ElectronIpcMainEvent,
    args: ApplicationIdentityParams
  ) => {
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
    };
    this.writeConfigFile(json);
    this.loadParamsIdentity(event);
    this.writeOnIndexHtml({ name: args.name, description: args.description });
  };

  getSoftwaresInfo = (event: ElectronIpcMainEvent) => {
    const softwaresInfo: SoftwaresInfo = {
      git: null,
      node: null,
      npm: null,
      cordova: null,
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
    ipcMain.on('toggle-project', (event: Electron.IpcMainEvent) =>
      this._platformsPlugin.toggleProject(event as ElectronIpcMainEvent)
    );
    ipcMain.on('get-softwares-info', (event: Electron.IpcMainEvent) =>
      this.getSoftwaresInfo(event as ElectronIpcMainEvent)
    );
    ipcMain.on('build-platform', (event: Electron.IpcMainEvent, args) =>
      this._buildPlugin.buildPlatform(event as ElectronIpcMainEvent, args)
    );
    ipcMain.on('prepare-platform', (event: Electron.IpcMainEvent, args) =>
      this._buildPlugin.preparePlatform(event as ElectronIpcMainEvent, args)
    );
    ipcMain.on('emulate-platform', (event: Electron.IpcMainEvent, args) =>
      this._buildPlugin.emulatePlatform(event as ElectronIpcMainEvent, args)
    );
  };
}
