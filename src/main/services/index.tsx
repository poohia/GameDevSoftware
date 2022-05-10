import CordovaService from './CordovaService';
import FileService from './FileService';
import VersionSoftwareService from './VersionSoftwareService';

type Services = 'fileService' | 'cordovaService' | 'versionSoftwareService';

export default class ServiceContainer {
  private _fileService = new FileService();
  private _cordovaService = new CordovaService();
  private _versionSoftwareService = new VersionSoftwareService();

  get = (service: Services) => {
    return this[`_${service}`];
  };
}
