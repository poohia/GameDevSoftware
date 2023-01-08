import { BrowserWindow } from 'electron';
import fs from 'fs';

export default class WatchPlugin {
  private timeOut: NodeJS.Timer | null = null;
  private refresh: boolean = false;
  constructor(private mainWindow: BrowserWindow) {}

  private watch(path: string) {
    fs.watch(path, { recursive: true }, () => {
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

  init() {
    const timeoutInterval = setInterval(() => {
      // @ts-ignore
      let path: string | undefined = global.path;
      if (typeof path !== 'undefined') {
        clearInterval(timeoutInterval);
        this.watch(path);
      }
    }, 1000);
  }
}
