import { AssetType } from 'types';

export default class UtilsService {
  static ArrayOrderByObjectID = (obj: { _id: number }[]) => {
    obj.sort(({ _id: _idA }, { _id: _idB }) => {
      if (_idA < _idB) return -1;
      if (_idA > _idB) return 1;
      return 0;
    });
  };

  static SortAssets = (assets: AssetType[]) => {
    assets.sort((a, b) => {
      if (a.type < b.type) {
        return -1;
      }
      if (a.type > b.type) {
        return 1;
      }
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
  };
}
