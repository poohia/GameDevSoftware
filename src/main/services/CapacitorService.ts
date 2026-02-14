import { PlatformsParams } from 'types';
import pathModule from 'path';
import fs from 'fs';
import { ChildProcess, spawn } from 'child_process';
import kill from 'kill-port';
import portfinder from 'portfinder';
import FileService from './FileService';
import FolderPlugin from '../plugins/FolderPlugin';
import { exec } from '../util';
import LogService from './LogService';

export default class CapacitorService {
  private _projectProcess: ChildProcess | null = null;

  private _isStoppingProject = false;

  private sendProjectState = (started: boolean) => {
    // @ts-ignore
    const { mainWindow } = global;
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.webContents.send('projected-started', started);
  };

  private startProjectProcess = () => {
    // @ts-ignore
    const path = global.path;

    this._projectProcess = spawn('yarn', ['start'], {
      cwd: path,
      shell: true,
      env: process.env,
    });
    this._isStoppingProject = false;
    this.sendProjectState(true);

    this._projectProcess.stdout?.on('data', (data: Buffer) => {
      LogService.TerminalMessage(data.toString('utf-8'));
    });
    this._projectProcess.stderr?.on('data', (data: Buffer) => {
      LogService.TerminalMessage(data.toString('utf-8'));
    });

    this._projectProcess.on('close', (code, signal) => {
      const isExpectedStop = this._isStoppingProject;
      this._projectProcess = null;
      this._isStoppingProject = false;
      this.sendProjectState(false);

      if (!isExpectedStop && code !== 0) {
        LogService.Notify(
          `yarn start stopped unexpectedly (code: ${code}, signal: ${signal ?? 'none'})`,
          {
            type: 'error',
            autoClose: 10000,
            hideProgressBar: true,
          }
        );
      }
    });

    this._projectProcess.on('error', (error: Error) => {
      this._projectProcess = null;
      this._isStoppingProject = false;
      this.sendProjectState(false);
      LogService.Notify(error.message, {
        type: 'error',
        autoClose: 10000,
        hideProgressBar: true,
      });
    });
  };

  private stopProjectProcess = () => {
    if (!this._projectProcess || this._projectProcess.killed) {
      this._projectProcess = null;
      this._isStoppingProject = false;
      this.sendProjectState(false);
      return;
    }
    this._isStoppingProject = true;
    this._projectProcess.kill('SIGTERM');
  };

  static removePlatform = (
    platform: keyof PlatformsParams,
    callback: (err: Error) => void
  ) => {
    if (platform !== 'android' && platform !== 'ios') return;
    // @ts-ignore
    const path = global.path;
    fs.rm(
      pathModule.join(path, platform),
      {
        recursive: true,
        force: true,
      },
      (error) => {
        callback(Error(error?.message));
      }
    );
  };

  static addPlatform = (
    platform: keyof PlatformsParams,
    callback: (err: Error) => void
  ) => {
    if (platform !== 'android' && platform !== 'ios') {
      CapacitorService.buildPlatform(platform, callback);
      return;
    }
    let opts = ``;
    if (platform === 'ios') {
      opts = ' --packagemanager CocoaPods';
    }
    // @ts-ignore
    const path = global.path;
    exec(`yarn add @capacitor/${platform}`, { cwd: path }, (error) => {
      if (error) {
        callback(Error(error?.message));
        return;
      }
      exec(`yarn cap add ${platform}${opts}`, { cwd: path }, (error) => {
        callback(Error(error?.message));
      });
    });
  };

  /**
   *
   * @param _platform
   * @param callback
   * @deprecated use buildPlatform
   */
  static preparePlatform = (
    _platform: keyof PlatformsParams,
    callback: (err: Error) => void
  ) => {
    // @ts-ignore
    const path = global.path;
    exec(`NODE_ENV=production yarn build`, { cwd: path }, (error, stdout) => {
      callback(Error(error?.message));
    });
  };

  /**
   *
   * @param _platform
   * @param callback
   *
   * same function prepare
   */
  static buildPlatform = (callback: (err: Error) => void) => {
    // @ts-ignore
    const path = global.path;
    exec(`yarn build`, { cwd: path }, (error, stdout) => {
      callback(Error(error?.message));
    });
  };

  static buildDemo = (callback: (err: Error) => void) => {
    // @ts-ignore
    const path = global.path;
    exec(`yarn build-demo`, { cwd: path }, (error, stdout) => {
      callback(Error(error?.message));
    });
  };

  static openAndroidStudio = () => {
    // @ts-ignore
    const path = global.path;
    exec(`yarn cap open android`, { cwd: path }, (error) => {});
  };

  static openXcode = () => {
    // @ts-ignore
    const path = global.path;
    exec(`yarn cap open ios`, { cwd: path }, (error) => {});
  };

  openElectron = () => {
    // @todo
  };

  openBrowser = () => {
    portfinder.getPortPromise({ port: 4173 }).then((port) => {
      if (port === 4173) {
        // @ts-ignore
        const path = global.path;
        exec(
          'yarn serve',
          {
            cwd: path,
          },
          (err, stdout, stderr) => {}
        );
      } else {
        kill(4173);
      }
    });
  };

  toggleProcess = () => {
    if (this._projectProcess && !this._projectProcess.killed) {
      this.stopProjectProcess();
      return;
    }
    portfinder.getPortPromise({ port: 3333 }).then((port) => {
      if (port !== 3333) {
        this.sendProjectState(true);
        LogService.Notify(
          'Port 3333 already in use by another process. Stop it manually to start from this app.',
          {
            type: 'warning',
            autoClose: 10000,
            hideProgressBar: true,
          }
        );
        return;
      }
      this.startProjectProcess();
    });
  };

  static writeCapacitorConfig = (appId: string, appName: string) => {
    return new Promise((resolve) => {
      // @ts-ignore
      const path = global.path;
      FileService.readJsonFile(
        pathModule.join(path, FolderPlugin.configFile)
      ).then((data) => {
        data.appId = appId;
        data.appName = appName;
        FileService.writeJsonFile(
          pathModule.join(path, FolderPlugin.configFile),
          data
        );
        resolve(data);
      });
    });
  };
}
