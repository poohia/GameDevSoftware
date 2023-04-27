export class UtilsService {
  static ArrayOrderByObjectID = (obj: { _id: number }[]) => {
    obj.sort(({ _id: _idA }, { _id: _idB }) => {
      if (_idA < _idB) return -1;
      if (_idA > _idB) return 1;
      return 0;
    });
  };
}
