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

    this._projectProcess = spawn(
      process.platform === 'win32' ? 'yarn.cmd' : 'yarn',
      ['start'],
      {
        cwd: path,
        env: process.env,
      }
    );
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
          `yarn start stopped unexpectedly (code: ${code}, signal: ${
            signal ?? 'none'
          })`,
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

  private stopDetachedProjectProcess = () => {
    this._isStoppingProject = true;
    kill(3333)
      .catch(() => {
        LogService.Notify('No project process found on port 3333.', {
          type: 'info',
          autoClose: 5000,
          hideProgressBar: true,
        });
      })
      .finally(() => {
        this._projectProcess = null;
        this._isStoppingProject = false;
        this.sendProjectState(false);
      });
  };

  private stopProjectProcess = () => {
    if (!this._projectProcess || this._projectProcess.killed) {
      this.stopDetachedProjectProcess();
      return;
    }
    this._isStoppingProject = true;
    this._projectProcess.kill('SIGTERM');
  };

  static removePlatform = (
    platform: keyof PlatformsParams,
    callback: (err: Error) => void
  ) => {
    if (platform !== 'android' && platform !== 'ios' && platform !== 'electron')
      return;
    // @ts-ignore
    const path = global.path;
    const platformDirectory =
      platform === 'electron' ? 'web2desktop' : platform;
    fs.rm(
      pathModule.join(path, platformDirectory),
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
    const path = global.path;

    if (platform === 'electron') {
      exec(
        'git clone https://github.com/joazco/web2desktop.git',
        { cwd: path },
        (error) => {
          if (error) {
            callback(Error(error?.message));
            return;
          }
          exec(
            `yarn install`,
            { cwd: pathModule.join(path, 'web2desktop') },
            (error) => {
              callback(Error(error?.message));
            }
          );
        }
      );
      return;
    }
    if (platform !== 'android' && platform !== 'ios') {
      CapacitorService.buildPlatform(platform, callback);
      return;
    }
    let opts = ``;
    if (platform === 'ios') {
      opts = ' --packagemanager CocoaPods';
    }

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
    exec(
      `yarn dev`,
      { cwd: pathModule.join(path, FolderPlugin.electronDirectory) },
      (error) => {}
    );
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
        this.stopDetachedProjectProcess();
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
