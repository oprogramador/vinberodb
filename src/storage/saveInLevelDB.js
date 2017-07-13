import LevelPromise from 'level-promise';
import _ from 'lodash';
import levelup from 'levelup';
import uuid from 'uuid';

class Manager {
  constructor(db, logger) {
    this.db = db;
    this.logger = logger;
    this.map = new Map();
  }

  getType(value) {
    if (value === null) {
      return 'null';
    }
    if (Array.isArray(value)) {
      return 'array';
    }

    return typeof value;
  }

  saveSimpleValue(key, value) {
    const type = this.getType(value);
    const valueToSave = ['object', 'array'].includes(type) ? JSON.stringify(value) : value;

    return this.db.put(key, `${type}:${valueToSave}`)
      .then(() => this.logger.info(`saved ${key}`));
  }

  createId(element) {
    const savedKey = this.map.get(element);
    if (savedKey) {
      return savedKey;
    }
    const newKey = uuid.v4();
    this.map.set(element, newKey);

    return newKey;
  }

  saveArray(key, value) {
    const ids = value.map(element => this.createId(element));

    return Promise.all([
      this.saveSimpleValue(key, ids),
      ...ids.map((id, i) => this.saveAny(id, value[i])),
    ]);
  }

  saveObject(key, value) {
    const ids = _.mapValues(value, element => this.createId(element));

    return Promise.all([
      this.saveSimpleValue(key, ids),
      ..._.map(ids, (id, innerKey) => this.saveAny(id, value[innerKey])),
    ]);
  }

  saveAny(key, value) {
    const type = this.getType(value);
    if (type === 'array') {
      return this.saveArray(key, value);
    }
    if (type === 'object') {
      return this.saveObject(key, value);
    }

    return this.saveSimpleValue(key, value);
  }
}

const saveInLevelDB = (databaseDirectory, logger) => (key, value) => {
  const db = LevelPromise(levelup(databaseDirectory));
  const rootKey = 'root';
  const manager = new Manager(db, logger);

  return db.get(rootKey)
    .catch((error) => {
      if (error instanceof levelup.errors.NotFoundError) {
        return 'array:[]';
      }

      throw error;
    })
    .then(root => JSON.parse(root.replace(/^array:/, '')))
    .then(root => manager.saveSimpleValue(rootKey, [...root, key]))
    .then(() => manager.saveAny(key, value))
    .then(() => db.close())
    .catch(error => logger.error(error));
};

export default saveInLevelDB;
