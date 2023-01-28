import { ipcMain } from 'electron';
import fs from 'fs';
import async from 'async';
import { ElectronIpcMainEvent, TranslationObject } from 'types';
import FolderPlugin from './FolderPlugin';
import FileService from '../services/FileService';

export default class TranslationPlugin {
  constructor() {}

  loadLanguagesAuthorized = (event: ElectronIpcMainEvent) => {
    // @ts-ignore
    const { path } = global;
    FileService.readJsonFile(`${path}${FolderPlugin.languageFile}`).then(
      (languages) => {
        event.reply('languages-authorized', languages);
      }
    );
  };

  loadTranslations = (event: ElectronIpcMainEvent) => {
    const translations: any = {};
    // @ts-ignore
    const { path } = global;
    const data = fs.readFileSync(`${path}${FolderPlugin.languageFile}`);
    // @ts-ignore
    const languages: { code: string }[] = JSON.parse(data);
    event.reply('languages-authorized', languages);
    async
      .each(languages, (language, callback) => {
        const { code } = language;
        FileService.readJsonFile(
          `${path}${FolderPlugin.translationDirectory}/${code}.json`
        )
          .then((dataTranslation) => {
            translations[code] = dataTranslation;
            callback();
          })
          .catch(() => {
            console.warn(
              `File dosn't exist ${path}${FolderPlugin.translationDirectory}/${code}.json`
            );
          })
          .finally(() => callback());
      })
      .then(() => {
        event.reply('load-translations', translations);
      });
  };

  saveTranslations = (event: ElectronIpcMainEvent, args: TranslationObject) => {
    // @ts-ignore
    const { path } = global;
    async
      .each(Object.keys(args), (code, callback) => {
        FileService.writeJsonFile(
          `${path}${FolderPlugin.translationDirectory}/${code}.json`,
          args[code]
        ).then(() => callback());
      })
      .then(() => {
        this.loadTranslations(event);
      });
  };

  setLanguages = (event: ElectronIpcMainEvent, args: string[]) => {
    // @ts-ignore
    const { path } = global;
    FileService.writeJsonFile(
      `${path}${FolderPlugin.languageFile}`,
      args.map((locale) => ({ code: locale }))
    ).then(() => {
      this.loadTranslations(event);
    });
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
    ipcMain.on('languages-authorized', (event: Electron.IpcMainEvent) => {
      this.loadLanguagesAuthorized(event as ElectronIpcMainEvent);
    });
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
