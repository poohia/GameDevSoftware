import { PlatformsParams } from 'types';
import childProcess from 'child_process';
import pathModule from 'path';
import fs from 'fs';

import { FolderPlugin } from '../plugins';

const exec = childProcess.exec;
const spawn = childProcess.spawn;

export default class CordovaService {
  private _childProcessStart: childProcess.ChildProcessWithoutNullStreams | null =
    null;
  private _childProcessElectron: childProcess.ChildProcess | null = null;
  private _childProcessBrowser: childProcess.ChildProcess | null = null;

  static removePlatform = (
    platform: keyof PlatformsParams,
    callback: (err: Error) => void
  ) => {
    // @ts-ignore
    const path = global.path;
    exec(`cordova platform remove ${platform}`, { cwd: path }, (error) => {
      callback(Error(error?.message));
    });
  };
  static addPlatform = (
    platform: keyof PlatformsParams,
    callback: (err: Error) => void
  ) => {
    platform = platform === 'electron' ? 'cordova-electron' : platform;
    // @ts-ignore
    const path = global.path;
    exec(`cordova platform add ${platform}`, { cwd: path }, (error) => {
      callback(Error(error?.message));
    });
  };
  static buildPlatform = (
    platform: keyof PlatformsParams,
    callback: (err: Error) => void
  ) => {
    // @ts-ignore
    const path = global.path;
    exec(`cordova build ${platform}`, { cwd: path }, (error, stdout) => {
      console.log(stdout);
      callback(Error(error?.message));
    });
  };

  static openAndroidStudio = () => {
    const { platform } = process;
    // @ts-ignore
    const path = global.path;
    const androidPath = `${path}${FolderPlugin.platformsDirectory}/android`;

    switch (platform) {
      case 'darwin':
        exec(`open -a /Applications/Android\\ Studio.app ${androidPath}`);
        break;
      case 'win32':
        exec(
          `"C:\\Program Files\\Android\\Android Studio\\bin\\studio64.exe\" ${androidPath}`
        );
        break;
      default:
        exec(`/opt/android-studio/bin/studio.sh ${androidPath}`);
    }
  };

  static openXcode = () => {
    // @ts-ignore
    const path = global.path;
    const iosPath = `${path}${FolderPlugin.platformsDirectory}/ios`;
    fs.readdir(iosPath, (_, files) => {
      files.forEach((file) => {
        const extFile = pathModule.extname(file);
        if (extFile === '.xcworkspace') {
          file = file.replaceAll(' ', '\\ ');
          exec(`open -a Xcode ${iosPath}/${file}`);
        }
      });
    });
  };

  openElectron = () => {
    if (this._childProcessElectron !== null) {
      this._childProcessElectron.kill();
      this._childProcessElectron = null;
      return;
    }
    // @ts-ignore
    const path = global.path;
    this._childProcessElectron = exec('cordova run electron --nobuild', {
      cwd: path,
    });
  };

  openBrowser = () => {
    this.closeBrowser();
    // @ts-ignore
    const path = global.path;
    this._childProcessBrowser = exec('cordova emulate browser', {
      cwd: path,
    });
  };

  closeBrowser = () => {
    if (this._childProcessBrowser) {
      this._childProcessBrowser.kill();
    } else {
      exec('npm exec kill-port 8000 -y');
    }
  };

  toggleProcess = () => {
    // @ts-ignore
    const { mainWindow } = global;
    exec('npm exec kill-port 3000 -y');
    if (this._childProcessStart !== null) {
      this._childProcessStart = null;
      mainWindow.webContents.send('projected-started', false);
      return;
    }
    // @ts-ignore
    const path = global.path;
    this._childProcessStart = spawn('npm', ['start'], { cwd: path });
    mainWindow.webContents.send('projected-started', true);
  };
}
