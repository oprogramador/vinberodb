import Reference from 'vinberodb/storage/Reference';
import _ from 'lodash';
import bluebird from 'bluebird';

const db = Symbol('db');
const logger = Symbol('logger');
const retrieved = Symbol('retrieved');
const references = Symbol('references');
const splitValue = Symbol('splitValue');
const getExactValue = Symbol('getExactValue');
const getOne = Symbol('getOne');
const resolveSelfReferences = Symbol('resolveSelfReferences');
const maxLevel = Symbol('maxLevel');

class AdvancedManagerGet {
  constructor(_db, _logger, _maxLevel) {
    this[db] = _db;
    this[logger] = _logger;
    this[maxLevel] = _maxLevel;
    this[retrieved] = {};
    this[references] = {};
  }

  [splitValue](value) {
    const position = value.indexOf(':');

    return [
      value.substr(0, position),
      value.substr(position + 1),
    ];
  }

  [getExactValue](value, level) {
    if (value === null) {
      return null;
    }
    const [type, stringified] = this[splitValue](value);

    if (type === 'boolean') {
      return Boolean(stringified);
    }
    if (type === 'number') {
      return Number(stringified);
    }
    if (type === 'array') {
      return Promise.all(JSON.parse(stringified).map(key => this[getOne](key, level)));
    }
    if (type === 'object') {
      return bluebird.props(_.mapValues(JSON.parse(stringified), key => this[getOne](key, level)));
    }

    return stringified;
  }

  [getOne](key, level) {
    if (level >= this[maxLevel]) {
      return { key, value: new Reference(key) };
    }
    if (this[retrieved][key]) {
      return { isSelfReference: true, key };
    }

    this[retrieved][key] = this[db].get(key)
      .then(value => this[getExactValue](value, level + 1));

    return this[retrieved][key]
      .then(value => ({ key, value }));
  }

  [resolveSelfReferences]({ key, value, isSelfReference }) {
    if (value === null) {
      return null;
    }
    if (value instanceof Reference) {
      return value;
    }
    if (isSelfReference) {
      return this[references][key];
    }

    if (typeof value !== 'object') {
      return value;
    }

    const reference = Array.isArray(value) ? [] : {};
    this[references][key] = reference;

    Object.assign(
      reference,
      Array.isArray(value)
        ? value.map(innerValue => this[resolveSelfReferences](innerValue))
        : _.mapValues(value, innerValue => this[resolveSelfReferences](innerValue))
    );

    return reference;
  }

  get(key) {
    return this[getOne](key, 0)
      .then(object => this[resolveSelfReferences](object));
  }
}

export default AdvancedManagerGet;
