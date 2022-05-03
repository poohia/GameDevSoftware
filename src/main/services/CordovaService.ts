import { PlatformsParams } from 'types';
import childProcess from 'child_process';

const exec = childProcess.exec;

export default class CordovaService {
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
}
