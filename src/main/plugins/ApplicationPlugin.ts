import { ipcMain } from 'electron';
import fs from 'fs';
import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser';
import { ApplicationParams1, ElectronIpcMainEvent } from 'types';
import FolderPlugin from './FolderPlugin';

const options = { ignoreAttributes: false };
const parser = new XMLParser(options);
const builder = new XMLBuilder(options);

export default class ApplicationPlugin {
  constructor() {}

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
    console.log(
      '🚀 ~ file: ApplicationPlugin.ts ~ line 25 ~ ApplicationPlugin ~ xml',
      xml
    );
    // @ts-ignore
    const { path } = global;
    fs.writeFileSync(`${path}${FolderPlugin.configFile}`, builder.build(xml));
  };

  loadParams1 = (event: ElectronIpcMainEvent) => {
    const xml = this.openConfigFile();
    const { widget } = xml;
    const { author } = widget;
    const data: ApplicationParams1 = {
      package: widget['@_id'],
      version: widget['@_version'],
      buildVersion: widget['@_android-versionCode'],
      name: widget.name,
      description: widget.description,
      authorEmail: author['@_email'],
      authorName: author['#text'],
    };

    event.reply('load-params-1', data);
  };

  init = () => {
    ipcMain.on('load-params-1', (event: Electron.IpcMainEvent) =>
      this.loadParams1(event as ElectronIpcMainEvent)
    );
  };
}
