import { ipcMain } from 'electron';
import fs from 'fs';
import { ElectronIpcMainEvent } from 'types';
import FolderPlugin from './FolderPlugin';

export default class TranslationPlugin {
  constructor() {}

  loadTranslations = (event: ElectronIpcMainEvent) => {
    const translations: any = {};
    // @ts-ignore
    const { path } = global;
    const data = fs.readFileSync(`${path}${FolderPlugin.languageFile}`);
    // @ts-ignore
    const languages: { code: string }[] = JSON.parse(data);
    event.reply('languages-authorized', languages);
    Promise.all(
      languages.map(
        (l) =>
          new Promise((resolve) => {
            const { code } = l;
            const dataTranslation = fs.readFileSync(
              `${path}${FolderPlugin.translationDirectory}/${code}.json`
            );
            // @ts-ignore
            translations[code] = JSON.parse(dataTranslation);
            resolve(true);
          })
      )
    ).then(() => {
      event.reply('load-translations', translations);
    });
  };

  saveTranslations = (event: ElectronIpcMainEvent, args: any) => {
    // @ts-ignore
    const { path } = global;
    Promise.all(
      Object.keys(args).map((code) => {
        new Promise((resolve) => {
          fs.writeFile(
            `${path}${FolderPlugin.translationDirectory}/${code}.json`,
            JSON.stringify(args[code]),
            () => {
              resolve(true);
            }
          );
        });
      })
    ).then(() => {
      this.loadTranslations(event);
    });
  };

  setLanguages = (event: ElectronIpcMainEvent, args: string[]) => {
    // @ts-ignore
    const { path } = global;
    fs.writeFileSync(
      `${path}${FolderPlugin.languageFile}`,
      JSON.stringify(args.map((locale) => ({ code: locale })))
    );
    this.loadTranslations(event);
  };

  removeLanguage = (
    event: ElectronIpcMainEvent,
    args: { language: string; languages: string[] }
  ) => {
    //@ts-ignore
    const { path } = global;
    const { language, languages } = args;
    fs.unlinkSync(
      `${path}${FolderPlugin.translationDirectory}/${language}.json`
    );
    this.setLanguages(event, languages);
  };

  init = () => {
    ipcMain.on('load-translations', (event: Electron.IpcMainEvent) => {
      this.loadTranslations(event as ElectronIpcMainEvent);
    });
    ipcMain.on('save-translations', (event: Electron.IpcMainEvent, args) => {
      this.saveTranslations(event as ElectronIpcMainEvent, args);
    });
    ipcMain.on('set-languages', (event: Electron.IpcMainEvent, args) => {
      this.setLanguages(event as ElectronIpcMainEvent, args);
    });
    ipcMain.on('remove-language', (event: Electron.IpcMainEvent, args) => {
      this.removeLanguage(event as ElectronIpcMainEvent, args);
    });
  };
}
