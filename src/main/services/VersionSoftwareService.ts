import { exec } from '../util';

export default class VersionSoftwareService {
  static getVersion = (software: string): Promise<string | null> =>
    new Promise((resolve) => {
      // @ts-ignore
      const { path } = global;
      if (software === 'capacitor') {
        exec(
          `npx cap --version`,
          {
            cwd: path,
          },
          (err, stdout) => {
            if (err) return resolve(null);
            return resolve(stdout.toString('utf-8'));
          }
        );
      } else {
        exec(`${software} --version`, undefined, (err, stdout) => {
          if (err) return resolve(null);
          return resolve(stdout.toString('utf-8'));
        });
      }
    });
}
