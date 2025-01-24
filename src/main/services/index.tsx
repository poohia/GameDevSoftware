import CapacitorService from './CapacitorService';

type Services = 'capacitorService';

export default class ServiceContainer {
  // doesn't work with class have only static function
  // private _fileService = new FileService();
  // private _versionSoftwareService = new VersionSoftwareService();
  private _capacitorService = new CapacitorService();

  get = (service: Services) => {
    return this[`_${service}`];
  };
}
