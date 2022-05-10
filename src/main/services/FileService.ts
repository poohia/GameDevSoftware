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
    filter: 'file' | 'directory' | 'all',
    callback: (names: string[]) => void
  ) => {
    fs.readdir(path, { withFileTypes: true }, (err, files) => {
      if (err) {
        console.log(err);
        throw new Error(err.message);
      }
      if (filter === 'all') callback(files.map((f) => f.name));
      if (filter === 'directory')
        callback(files.filter((f) => f.isDirectory()).map((f) => f.name));
      if (filter === 'file')
        callback(files.filter((f) => !f.isDirectory()).map((f) => f.name));
    });
  };
}
