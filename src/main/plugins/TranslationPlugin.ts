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
      (languages: { code: string; default?: boolean }[]) => {
        event.reply(
          'languages-authorized',
          languages.sort((a, b) => {
            // Les langues avec `default: true` doivent être en premier
            if (a.default && !b.default) {
              return -1;
            } else if (!a.default && b.default) {
              return 1;
            }
            return 0;
          })
        );
      }
    );
  };

  private reverseAllLanguages = (translations: any) => {
    // on reconstruit un nouvel objet pour ne pas muter l’original
    return Object.fromEntries(
      Object.entries(translations).map(([lang, entries]: any) => [
        lang,
        [...entries].reverse(), // clone & reverse
      ])
    );
  };

  loadTranslations = (event: ElectronIpcMainEvent) => {
    const translations: any = {};
    // @ts-ignore
    const { path } = global;
    const data = fs.readFileSync(`${path}${FolderPlugin.languageFile}`);
    // @ts-ignore
    const languages: { code: string; default?: boolean }[] = JSON.parse(data);
    event.reply(
      'languages-authorized',
      languages.sort((a, b) => {
        // Les langues avec `default: true` doivent être en premier
        if (a.default && !b.default) {
          return -1;
        } else if (!a.default && b.default) {
          return 1;
        }
        return 0;
      })
    );
    async
      .each(languages, (language, callback) => {
        const { code } = language;
        const translateFile = `${path}${FolderPlugin.translationDirectory}/${code}.json`;
        if (!fs.existsSync(translateFile)) {
          fs.writeFileSync(translateFile, '[]');
        }
        FileService.readJsonFile(translateFile)
          .then((dataTranslation) => {
            translations[code] = dataTranslation;
          })
          .catch(() => {
            console.warn(
              `File dosn't exist ${path}${FolderPlugin.translationDirectory}/${code}.json`
            );
          })
          .finally(() => callback());
      })
      .then(() => {
        event.reply(
          'load-translations',
          this.reverseAllLanguages(translations)
        );
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
    this.loadLocaleGame(event);
  };

  setLocaleGame = (event: ElectronIpcMainEvent, locale: string) => {
    // @ts-ignore
    const { path } = global;
    FileService.readJsonFile(`${path}${FolderPlugin.languageFile}`).then(
      (languages: { code: string; default?: boolean }[]) => {
        languages.forEach((l) => {
          if (l.code === locale) {
            l.default = true;
          } else {
            l.default = false;
          }
        });
        FileService.writeJsonFile(
          `${path}${FolderPlugin.languageFile}`,
          languages
        );
        this.loadLocaleGame(event);
      }
    );
  };

  loadLocaleGame = (event: ElectronIpcMainEvent) => {
    // @ts-ignore
    const { path } = global;
    FileService.readJsonFile(`${path}${FolderPlugin.languageFile}`).then(
      (languages: { code: string; default?: boolean }[]) => {
        event.reply(
          'load-game-locale',
          languages.find((l) => l.default)?.code || 'en'
        );
      }
    );
  };

  init = () => {
    ipcMain.on('languages-authorized', (event: Electron.IpcMainEvent) => {
      this.loadLanguagesAuthorized(event as ElectronIpcMainEvent);
    });
    ipcMain.on('load-translations', (event: Electron.IpcMainEvent, args) => {
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
    ipcMain.on('set-game-locale', (event: Electron.IpcMainEvent, args) => {
      this.setLocaleGame(event as ElectronIpcMainEvent, args);
    });
    ipcMain.on('load-game-locale', (event: Electron.IpcMainEvent) => {
      this.loadLocaleGame(event as ElectronIpcMainEvent);
    });
  };
}
