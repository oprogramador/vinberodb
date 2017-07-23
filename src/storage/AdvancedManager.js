import _ from 'lodash';
import bluebird from 'bluebird';
import uuid from 'uuid';

class AdvancedManager {
  constructor(db, logger) {
    this.db = db;
    this.logger = logger;
    this.map = new Map();
    this.saved = new Map();
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

    return this.db.set(key, `${type}:${valueToSave}`)
      .then(() => this.logger.info(`saved ${key}`));
  }

  createId(element) {
    const savedKey = this.map.get(element) || this.saved.get(element);
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
    if (this.saved.get(value)) {
      return Promise.resolve();
    }
    this.saved.set(value, key);
    const type = this.getType(value);
    if (type === 'array') {
      return this.saveArray(key, value);
    }
    if (type === 'object') {
      return this.saveObject(key, value);
    }

    return this.saveSimpleValue(key, value);
  }

  set(key, value) {
    return this.saveAny(key, value)
      .catch(error => this.logger.error(error));
  }

  splitValue(value) {
    const position = value.indexOf(':');

    return [
      value.substr(0, position),
      value.substr(position + 1),
    ];
  }

  getExactValue(value) {
    const [type, stringified] = this.splitValue(value);

    if (type === 'boolean') {
      return Boolean(stringified);
    }
    if (type === 'number') {
      return Number(stringified);
    }
    if (type === 'array') {
      return Promise.all(JSON.parse(stringified).map(key => this.getOne(key)));
    }
    if (type === 'object') {
      return bluebird.props(_.mapValues(JSON.parse(stringified), key => this.getOne(key)));
    }

    return stringified;
  }

  getOne(key) {
    if (this.retrieved[key]) {
      return { isSelfReference: true, key };
    }

    this.retrieved[key] = this.db.get(key)
      .then(value => this.getExactValue(value));

    return this.retrieved[key]
      .then(value => ({ key, value }));
  }

  resolveSelfReferences({ key, value, isSelfReference }) {
    if (isSelfReference) {
      return this.values[key];
    }

    if (typeof value !== 'object') {
      return value;
    }

    const reference = Array.isArray(value) ? [] : {};
    this.values[key] = reference;

    Object.assign(
      reference,
      Array.isArray(value)
        ? value.map(innerValue => this.resolveSelfReferences(innerValue))
        : _.mapValues(value, innerValue => this.resolveSelfReferences(innerValue))
    );

    return reference;
  }

  get(key) {
    this.retrieved = {};
    this.values = {};

    return this.getOne(key)
      .then(object => this.resolveSelfReferences(object));
  }
}

export default AdvancedManager;
