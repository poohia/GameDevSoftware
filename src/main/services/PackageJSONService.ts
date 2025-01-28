import pathModule from 'path';
import FileService from './FileService';
import FolderPlugin from '../plugins/FolderPlugin';

export default class PackageJSONService {
  static updateVersion = (versionName: string) => {
    // @ts-ignore
    const path = global.path;
    return FileService.readJsonFile(
      pathModule.join(path, FolderPlugin.packageJSONFile)
    ).then((data) => {
      data.version = versionName;
      return FileService.writeJsonFile(
        pathModule.join(path, FolderPlugin.packageJSONFile),
        data
      );
    });
  };
}
