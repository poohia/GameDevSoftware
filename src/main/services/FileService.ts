import fs from 'fs';

export default class FileService {
  static saveFileFromBase64 = (
    base64: any,
    path: string,
    callback: () => void
  ) => {
    const binaryData = Buffer.from(
      base64.replace(/^data:([A-Za-z-+/]+);base64,/, ''),
      'base64'
    );
    fs.writeFile(path, binaryData, (err) => {
      if (err) {
        console.log(err);
        throw new Error(err.message);
      }
      callback();
    });
  };

  static getFileBase64 = (path: string, callback: (base64: string) => void) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        console.log(err);
        throw new Error(err.message);
      }
      callback(Buffer.from(data).toString('base64'));
    });
  };

  static readdir = (
    path: string,
    filter: 'file' | 'directory' | 'all'
  ): Promise<string[]> =>
    new Promise((resolve, _reject) => {
      fs.readdir(path, { withFileTypes: true }, (err, files) => {
        if (err) {
          console.log(err);
          throw new Error(err.message);
        }
        if (filter === 'all') resolve(files.map((f) => f.name));
        if (filter === 'directory')
          resolve(files.filter((f) => f.isDirectory()).map((f) => f.name));
        if (filter === 'file')
          resolve(files.filter((f) => !f.isDirectory()).map((f) => f.name));
      });
    });

  static readJsonFile = <T = any>(path: string): Promise<T> =>
    new Promise((resolve, reject) => {
      fs.readFile(path, (err, data) => {
        if (err) {
          console.error(err);
          reject(err.message);
          return;
        }
        // @ts-ignore
        resolve(JSON.parse(data));
      });
    });

  static writeJsonFile = <T = Object>(path: string, data: T): Promise<void> =>
    new Promise((resolve) => {
      fs.writeFile(path, JSON.stringify(data), (err) => {
        if (err) {
          console.error(err);
          throw new Error(err.message);
        }
        resolve();
      });
    });
}
