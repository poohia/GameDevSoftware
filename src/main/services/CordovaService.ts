import { PlatformsParams } from 'types';
import childProcess from 'child_process';

const exec = childProcess.exec;
const spawn = childProcess.spawn;

export default class CordovaService {
  private _childProcess: childProcess.ChildProcessWithoutNullStreams | null =
    null;

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
    // @ts-ignore
    const path = global.path;
    exec(`cordova platform add ${platform}`, { cwd: path }, (error) => {
      callback(Error(error?.message));
    });
  };

  toggleProcess = () => {
    // @ts-ignore
    const { mainWindow } = global;
    exec('npm exec kill-port 3000 -y');
    if (this._childProcess !== null) {
      this._childProcess = null;
      mainWindow.webContents.send('projected-started', false);
      return;
    }
    // @ts-ignore
    const path = global.path;
    this._childProcess = spawn('npm', ['start'], { cwd: path });
    mainWindow.webContents.send('projected-started', true);
  };
}
