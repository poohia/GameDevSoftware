import { ipcMain, dialog } from 'electron';
import async from 'async';
import pathNode from 'path';
import FileService from '../services/FileService';
import { ElectronIpcMainEvent, FontDataObject, FontObject } from 'types';
import FolderPlugin from './FolderPlugin';

export default class FontPlugin {
  static FORMAT_FONTS = [
    { format: 'woff', extension: '.woff' },
    { format: 'woff2', extension: '.woff2' },
    { format: 'truetype', extension: '.ttf' },
    { format: 'opentype', extension: '.otf' },
    { format: 'embedded-opentype', extension: '.eot' },
  ];
  constructor(private mainWindow: Electron.BrowserWindow) {}

  private loadFontsFile = () => {
    const { path } = global;
    return FileService.readJsonFile<FontObject[]>(
      `${path}${FolderPlugin.fontFile}`
    );
  };

  private writeFontsFile = (data: FontObject[]) => {
    const { path } = global;
    return FileService.writeJsonFile(`${path}${FolderPlugin.fontFile}`, data);
  };

  loadFonts = (event: ElectronIpcMainEvent) => {
    this.loadFontsFile().then((fonts) => {
      event.reply(
        'load-fonts',
        fonts.map((font) => font.key)
      );
    });
  };

  loadFontsData = (event: ElectronIpcMainEvent) => {
    const { path } = global;
    this.loadFontsFile().then((fonts) => {
      const fontsData: FontDataObject[] = [];
      async
        .each(fonts, (font, callback) => {
          FileService.getFileBase64(
            `${path}${FolderPlugin.directoryFonts}/${font.file}`,
            (base64) => {
              fontsData.push({
                ...font,
                data: `data:font/${font.format};base64,${base64}`,
              });
              callback();
            }
          );
        })
        .then(() => {
          event.reply('load-fonts-data', fontsData);
        });
    });
  };

  appendNewFonts = (event: ElectronIpcMainEvent) => {
    const { path } = global;
    dialog
      .showOpenDialog(this.mainWindow, {
        properties: ['multiSelections', 'openFile'],
        filters: [
          {
            extensions: FontPlugin.FORMAT_FONTS.map((f) =>
              f.extension.replace('.', '')
            ),
            name: 'Font files',
          },
        ],
      })
      .then((result) => {
        if (result.canceled) return;
        this.loadFontsFile().then((fonts) => {
          async
            .each(result.filePaths, (file, callback) => {
              const fileName = pathNode.basename(file);
              const fileExtension = pathNode.extname(file);
              const fontKey = pathNode.basename(fileName, fileExtension);
              const format = FontPlugin.FORMAT_FONTS.find(
                (f) => f.extension === fileExtension
              )?.format;
              if (!format) {
                callback();
                return;
              }
              if (fonts.find((f) => f.key === fontKey) === undefined) {
                fonts.push({ key: fontKey, file: fileName, format });
              }
              FileService.copyFile(
                file,
                `${path}${FolderPlugin.directoryFonts}/${fileName}`
              ).finally(callback);
            })
            .then(() => {
              this.writeFontsFile(fonts).then(() => {
                this.loadFontsData(event);
                this.loadFonts(event);
              });
            });
        });
      });
  };

  removeFont = (event: ElectronIpcMainEvent, key: string) => {
    const { path } = global;
    this.loadFontsFile().then((fonts) => {
      const font = fonts.find((f) => f.key === key);
      if (!font) return;
      FileService.removeFile(
        `${path}${FolderPlugin.directoryFonts}/${font.file}`
      ).then(() => {
        this.writeFontsFile(fonts.filter((font) => font.key !== key)).then(
          () => {
            this.loadFontsData(event);
            this.loadFonts(event);
          }
        );
      });
    });
  };

  init = () => {
    ipcMain.on('load-fonts', (event: Electron.IpcMainEvent) =>
      this.loadFonts(event as ElectronIpcMainEvent)
    );
    ipcMain.on('load-fonts-data', (event: Electron.IpcMainEvent) =>
      this.loadFontsData(event as ElectronIpcMainEvent)
    );
    ipcMain.on('append-fonts', (event: Electron.IpcMainEvent) =>
      this.appendNewFonts(event as ElectronIpcMainEvent)
    );
    ipcMain.on('remove-font', (event: Electron.IpcMainEvent, args) =>
      this.removeFont(event as ElectronIpcMainEvent, args)
    );
  };
}
