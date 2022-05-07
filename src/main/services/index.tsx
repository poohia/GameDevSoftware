import CordovaService from './CordovaService';
import FileService from './FileService';
import VersionSoftwareService from './VersionSoftwareService';

type Services = 'file' | 'cordova' | 'versionsoftware';

export default class ServiceContainer {
  private _fileService = new FileService();
  private _cordovaService = new CordovaService();
  private _versionSoftwareService = new VersionSoftwareService();

  get = (service: Services) => {
    switch (service) {
      case 'file':
        return this._fileService;
      case 'cordova':
        return this._cordovaService;
      case 'versionsoftware':
        return this._versionSoftwareService;
    }
  };
}
