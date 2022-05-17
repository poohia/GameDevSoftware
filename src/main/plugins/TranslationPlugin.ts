import { ipcMain } from 'electron';
import fs from 'fs';
import async from 'async';
import { ElectronIpcMainEvent, ModuleArgs, TranslationObject } from 'types';
import FolderPlugin from './FolderPlugin';
import FileService from '../services/FileService';
import GameModulesPlugin from './GameModulesPlugin';

export default class TranslationPlugin {
  private _locale = 'en';
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

  loadTranslationsModule = (event: ElectronIpcMainEvent, module: string) => {
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
            fs.readFile(
              `${path}${FolderPlugin.modulesDirectory}/${module}/translations/${code}.json`,
              (err, dataTranslation) => {
                if (err) {
                  translations[code] = {};
                } else {
                  // @ts-ignore
                  translations[code] = JSON.parse(dataTranslation);
                }
                resolve(true);
              }
            );
          })
      )
    ).then(() => {
      event.reply(`load-translations-module-${module}`, translations);
    });
  };

  saveTranslations = (event: ElectronIpcMainEvent, args: TranslationObject) => {
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

  saveTranslationsModule = (
    event: ElectronIpcMainEvent,
    args: ModuleArgs<TranslationObject>
  ) => {
    // @ts-ignore
    const { path } = global;
    const { data, module } = args;
    Promise.all(
      Object.keys(args).map((code) => {
        new Promise((resolve) => {
          fs.writeFile(
            `${path}${FolderPlugin.modulesDirectory}/${module}/translations/${code}.json`,
            JSON.stringify(data[code]),
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

  loadAllTranslations = (event: ElectronIpcMainEvent, language?: string) => {
    if (language) {
      this._locale = language;
    }
    //@ts-ignore
    const { path } = global;
    async.parallel(
      [
        (callback) => {
          FileService.readJsonFile(
            `${path}${FolderPlugin.translationDirectory}/${this._locale}.json`
          )
            .then((data) => callback(null, [data]))
            .catch(() => {
              FileService.readJsonFile(
                `${path}${FolderPlugin.translationDirectory}/en.json`
              ).then((data) => callback(null, [data]));
            });
        },
        (callback) => {
          const dataModules: any[] = [];
          GameModulesPlugin.loadDynamicModulesName().then((modules) => {
            async
              .each(modules, (module, callbackModule) => {
                FileService.readJsonFile(
                  `${path}${FolderPlugin.modulesDirectory}/${module}/translations/${this._locale}.json`
                ).then((data: Object) => {
                  dataModules.push(data);
                  callbackModule();
                });
              })
              .then(() => callback(null, dataModules));
          });
        },
      ],
      (_err, results) => {
        let finalData: any = {};
        results?.forEach((r: any) => {
          Object.keys(r).forEach((key) => {
            finalData = { ...finalData, ...r[key] };
          });
        });
        event.reply('load-all-translations', finalData);
      }
    );
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
    ipcMain.on(
      'load-translations-module',
      (event: Electron.IpcMainEvent, args) => {
        this.loadTranslationsModule(event as ElectronIpcMainEvent, args);
      }
    );
    ipcMain.on('load-all-translations', (event, args) => {
      this.loadAllTranslations(event as ElectronIpcMainEvent, args);
    });
  };
}
