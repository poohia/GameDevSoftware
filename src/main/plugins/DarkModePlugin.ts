import { ipcMain, nativeTheme } from 'electron';

export default class DarkModePlugin {
  init = () => {
    ipcMain.on('switch-theme', (_event: Electron.IpcMainEvent, args) => {
      nativeTheme.themeSource = args;
    });
  };
}
