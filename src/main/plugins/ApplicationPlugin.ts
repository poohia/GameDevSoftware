import { ipcMain } from 'electron';
import fs from 'fs';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { ApplicationIdentityParams, ElectronIpcMainEvent } from 'types';
import FolderPlugin from './FolderPlugin';

const options = { ignoreAttributes: false, format: true };
const parser = new XMLParser(options);
const builder = new XMLBuilder(options);

export default class ApplicationPlugin {
  constructor() {}

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

  init = () => {
    ipcMain.on('load-params-identity', (event: Electron.IpcMainEvent) =>
      this.loadParamsIdentity(event as ElectronIpcMainEvent)
    );
    ipcMain.on('set-params-identity', (event: Electron.IpcMainEvent, args) =>
      this.setParamsIdentity(event as ElectronIpcMainEvent, args)
    );
  };
}
