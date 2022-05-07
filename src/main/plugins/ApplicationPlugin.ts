import { BrowserWindow, ipcMain } from 'electron';
import fs from 'fs';
import async from 'async';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import {
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
    'cordova-res',
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

  private openConfigFile = () => {
    // @ts-ignore
    const { path } = global;
    const xmlString = fs.readFileSync(
      `${path}${FolderPlugin.configFile}`,
      'utf8'
    );
    return parser.parse(xmlString);
  };

  private writeConfigFile = (xml: any) => {
    // @ts-ignore
    const { path } = global;
    fs.writeFileSync(`${path}${FolderPlugin.configFile}`, builder.build(xml));
  };

  loadParamsIdentity = (event: ElectronIpcMainEvent) => {
    const xml = this.openConfigFile();
    const { widget } = xml;
    const { author } = widget;
    const data: ApplicationIdentityParams = {
      package: widget['@_id'],
      version: widget['@_version'],
      buildVersion: widget['@_android-versionCode'],
      name: widget.name,
      description: widget.description,
      authorEmail: author['@_email'],
      authorName: author['#text'],
      authorWebSite: author['@_href'],
    };

    event.reply('load-params-identity', data);
  };

  setParamsIdentity = (
    event: ElectronIpcMainEvent,
    args: ApplicationIdentityParams
  ) => {
    const xml = this.openConfigFile();
    const { widget } = xml;
    const { author } = widget;
    (widget['@_id'] = args.package),
      (widget['@_version'] = args.version),
      (widget['@_android-versionCode'] = args.buildVersion),
      (widget['@_ios-CFBundleVersion'] = args.buildVersion),
      (widget.name = args.name),
      (widget.description = args.description || ''),
      (author['@_email'] = args.authorEmail),
      (author['#text'] = args.authorName),
      (author['@_href'] = args.authorWebSite);
    this.writeConfigFile(xml);
    this.loadParamsIdentity(event);
    this.writeOnIndexHtml({ name: args.name, description: args.description });
  };

  getSoftwaresInfo = (event: ElectronIpcMainEvent) => {
    const softwaresInfo: SoftwaresInfo = {
      git: null,
      node: null,
      npm: null,
      cordova: null,
      'cordova-res': null,
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
    ipcMain.on('emulate-platform', (event: Electron.IpcMainEvent, args) =>
      this._buildPlugin.emulatePlatform(event as ElectronIpcMainEvent, args)
    );
  };
}
