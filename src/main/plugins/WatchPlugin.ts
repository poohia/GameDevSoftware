import { BrowserWindow, ipcMain } from 'electron';
import fs from 'fs';
import FolderPlugin from './FolderPlugin';
import GameModulesPlugin from './GameModulesPlugin';

export default class WatchPlugin {
  private timeOut: NodeJS.Timer | null = null;
  private refresh: boolean = false;
  constructor(private mainWindow: BrowserWindow) {}

  private watch(path: string) {
    fs.watch(path, { recursive: true }, () => {
      console.log(path, 'REFRESSSH');
      this.refresh = false;
      if (this.timeOut) return;
      this.timeOut = setInterval(() => {
        if (this.refresh && this.timeOut) {
          this.mainWindow.reload();
          clearInterval(this.timeOut);
          this.timeOut = null;
        } else {
          this.refresh = true;
        }
      }, 1500);
    });
  }

  private watchFromModule() {
    // @ts-ignore
    let path: string = global.path;
    GameModulesPlugin.loadDynamicModulesName().then((modules) => {
      modules.forEach((module) => {
        this.watch(
          `${path}${FolderPlugin.modulesDirectory}/${module}/gameobjectTypes`
        );
        this.watch(
          `${path}${FolderPlugin.modulesDirectory}/${module}/scenesTypes`
        );
      });
    });
  }

  init() {
    const timeoutInterval = setInterval(() => {
      // @ts-ignore
      let path: string | undefined = global.path;
      if (typeof path !== 'undefined') {
        clearInterval(timeoutInterval);
        // this.watch(path);
        this.watchFromModule();
      }
    }, 1000);
  }
}
