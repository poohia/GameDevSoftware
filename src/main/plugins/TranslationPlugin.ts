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
    // languages.forEach((l: { code: string }) => {
    //   const { code } = l;
    //   const dataTranslation = fs.readFileSync(
    //     `${path}${FolderPlugin.translationDirectory}/${code}.json`
    //   );
    //   // @ts-ignore
    //   translations[code] = JSON.parse(dataTranslation);
    // });
    // event.reply('load-translations', translations);
  };

  saveTranslations = (events: ElectronIpcMainEvent) => {
    // @ts-ignore
    const { path } = global;
    console.log('saveTranslations');
    fs.writeFile(
      `${path}${FolderPlugin.translationDirectory}/fr.json`,
      JSON.stringify({
        jordan: 'ohoh 3',
      }),
      () => {}
    );
  };

  init = () => {
    ipcMain.on('load-translations', (event: Electron.IpcMainEvent) => {
      this.loadTranslations(event as ElectronIpcMainEvent);
    });
    ipcMain.on('save-translations', (event: Electron.IpcMainEvent) => {
      this.saveTranslations(event as ElectronIpcMainEvent);
    });
  };
}
