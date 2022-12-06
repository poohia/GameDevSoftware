import CordovaService from './CordovaService';

type Services = 'cordovaService';

export default class ServiceContainer {
  // doesn't work with class have only static function
  // private _fileService = new FileService();
  // private _versionSoftwareService = new VersionSoftwareService();
  private _cordovaService = new CordovaService();

  get = (service: Services) => {
    return this[`_${service}`];
  };
}
