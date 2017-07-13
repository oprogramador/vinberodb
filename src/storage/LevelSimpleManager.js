import levelup from 'levelup';

const _db = Symbol('map');

class LevelSimpleManager {
  constructor(db) {
    this[_db] = db;
  }

  get(key) {
    return this[_db].get(key)
      .catch((error) => {
        if (error instanceof levelup.errors.NotFoundError) {
          return null;
        }

        throw error;
      });
  }

  set(key, value) {
    if (value === null) {
      return this[_db].del(key);
    }

    return this[_db].put(key, value);
  }
}

export default LevelSimpleManager;
