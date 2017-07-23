import _ from 'lodash';
import bluebird from 'bluebird';

const splitValue = Symbol('splitValue');
const getExactValue = Symbol('getExactValue');
const getOne = Symbol('getOne');
const resolveSelfReferences = Symbol('resolveSelfReferences');

class AdvancedManagerGet {
  constructor(db, logger) {
    this.db = db;
    this.logger = logger;
    this.retrieved = {};
    this.references = {};
  }

  [splitValue](value) {
    const position = value.indexOf(':');

    return [
      value.substr(0, position),
      value.substr(position + 1),
    ];
  }

  [getExactValue](value) {
    const [type, stringified] = this[splitValue](value);

    if (type === 'boolean') {
      return Boolean(stringified);
    }
    if (type === 'number') {
      return Number(stringified);
    }
    if (type === 'array') {
      return Promise.all(JSON.parse(stringified).map(key => this[getOne](key)));
    }
    if (type === 'object') {
      return bluebird.props(_.mapValues(JSON.parse(stringified), key => this[getOne](key)));
    }

    return stringified;
  }

  [getOne](key) {
    if (this.retrieved[key]) {
      return { isSelfReference: true, key };
    }

    this.retrieved[key] = this.db.get(key)
      .then(value => this[getExactValue](value));

    return this.retrieved[key]
      .then(value => ({ key, value }));
  }

  [resolveSelfReferences]({ key, value, isSelfReference }) {
    if (isSelfReference) {
      return this.references[key];
    }

    if (typeof value !== 'object') {
      return value;
    }

    const reference = Array.isArray(value) ? [] : {};
    this.references[key] = reference;

    Object.assign(
      reference,
      Array.isArray(value)
        ? value.map(innerValue => this[resolveSelfReferences](innerValue))
        : _.mapValues(value, innerValue => this[resolveSelfReferences](innerValue))
    );

    return reference;
  }

  get(key) {
    return this[getOne](key)
      .then(object => this[resolveSelfReferences](object));
  }
}

export default AdvancedManagerGet;
