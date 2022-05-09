import childProcess from 'child_process';

const exec = childProcess.exec;

export default class VersionSoftwareService {
  static getVersion = (software: string): Promise<string | null> =>
    new Promise((resolve) => {
      exec(`${software} --version`, (err, stdout) => {
        if (err) return resolve(null);
        return resolve(stdout);
      });
    });
}
