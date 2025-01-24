import { PlatformsParams } from 'types';
import childProcess from 'child_process';
import pathModule from 'path';
import fs from 'fs';
import kill from 'kill-port';
import portfinder from 'portfinder';

const exec = childProcess.exec;

export default class CapacitorService {
  private _childProcessElectron: childProcess.ChildProcess | null = null;
  private _childProcessBrowser: childProcess.ChildProcess | null = null;

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
    // @ts-ignore
    const path = global.path;
    exec(`yarn add @capacitor/${platform}`, { cwd: path }, (error) => {
      if (error) {
        callback(Error(error?.message));
        return;
      }
      exec(`yarn cap add ${platform}`, { cwd: path }, (error) => {
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
    exec(`yarn build`, { cwd: path }, (error) => {
      if (error) {
        callback(Error(error?.message));
        return;
      }
      exec(`yarn cap sync`, { cwd: path }, (error, stdout) => {
        console.log(stdout);
        callback(Error(error?.message));
      });
    });
  };

  /**
   *
   * @param _platform
   * @param callback
   *
   * same function prepare
   */
  static buildPlatform = (
    _platform: keyof PlatformsParams,
    callback: (err: Error) => void
  ) => {
    // @ts-ignore
    const path = global.path;
    exec(`yarn build`, { cwd: path }, (error) => {
      if (error) {
        callback(Error(error?.message));
        return;
      }
      exec(`yarn cap sync`, { cwd: path }, (error, stdout) => {
        console.log(stdout);
        callback(Error(error?.message));
      });
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
    // @ts-ignore
    const { mainWindow } = global;
    portfinder.getPortPromise({ port: 3333 }).then((port) => {
      if (port === 3333) {
        // @ts-ignore
        const path = global.path;
        exec('yarn start', {
          cwd: path,
        });
        mainWindow.webContents.send('projected-started', true);
      } else {
        kill(3333).then(() => {
          mainWindow.webContents.send('projected-started', false);
        });
      }
    });
  };
}
