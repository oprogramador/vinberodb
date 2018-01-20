import Reference from 'vinberodb/storage/Reference';
import _ from 'lodash';
import uuid from 'uuid';

const db = Symbol('db');
const logger = Symbol('logger');
const toSave = Symbol('toSave');
const saved = Symbol('saved');
const getType = Symbol('getType');
const saveSimpleValue = Symbol('saveSimpleValue');
const createId = Symbol('createId');
const saveArray = Symbol('saveArray');
const saveObject = Symbol('saveObject');
const saveAny = Symbol('saveAny');

class AdvancedManagerSet {
  constructor(_db, _logger) {
    this[db] = _db;
    this[logger] = _logger;
    this[toSave] = new Map();
    this[saved] = new Map();
  }

  [getType](value) {
    if (value === null) {
      return 'null';
    }
    if (Array.isArray(value)) {
      return 'array';
    }

    return typeof value;
  }

  [saveSimpleValue](key, value) {
    const type = this[getType](value);
    const valueToSave = ['object', 'array'].includes(type) ? JSON.stringify(value) : value;

    return this[db].set(key, `${type}:${valueToSave}`)
      .then(() => this[logger].info(`saved ${key}`));
  }

  [createId](element) {
    if (element instanceof Reference) {
      return element.getKey();
    }
    const savedKey = this[toSave].get(element) || this[saved].get(element);
    if (savedKey) {
      return savedKey;
    }
    const newKey = uuid.v4();
    if (typeof element === 'object') {
      this[toSave].set(element, newKey);
    }

    return newKey;
  }

  [saveArray](key, value) {
    const ids = value.map(element => this[createId](element));

    return Promise.all([
      this[saveSimpleValue](key, ids),
      ...ids.map((id, i) => this[saveAny](id, value[i])),
    ]);
  }

  [saveObject](key, value) {
    const ids = _.mapValues(value, element => this[createId](element));

    return Promise.all([
      this[saveSimpleValue](key, ids),
      ..._.map(ids, (id, innerKey) => this[saveAny](id, value[innerKey])),
    ]);
  }

  [saveAny](key, value) {
    if (this[saved].get(value)) {
      return Promise.resolve();
    }
    if (typeof value === 'object') {
      this[saved].set(value, key);
    }
    if (value instanceof Reference) {
      return Promise.resolve();
    }
    const type = this[getType](value);
    if (type === 'array') {
      return this[saveArray](key, value);
    }
    if (type === 'object') {
      return this[saveObject](key, value);
    }

    return this[saveSimpleValue](key, value);
  }

  set(key, value) {
    return this[saveAny](key, value)
      .catch(error => this[logger].error(error));
  }
}

export default AdvancedManagerSet;
