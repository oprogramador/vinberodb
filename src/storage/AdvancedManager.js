import AdvancedManagerGet from 'vinberodb/storage/AdvancedManagerGet';
import AdvancedManagerSet from 'vinberodb/storage/AdvancedManagerSet';

const db = Symbol('db');
const logger = Symbol('logger');

class AdvancedManager {
  constructor(_db, _logger) {
    this[db] = _db;
    this[logger] = _logger;
  }

  setComplex(key, value) {
    return new AdvancedManagerSet(this[db], this[logger]).set(key, value);
  }

  getComplex(key, maxLevel) {
    return new AdvancedManagerGet(this[db], this[logger], maxLevel).get(key);
  }

  set(key, value) {
    return this[db].set(key, value);
  }

  get(key) {
    return this[db].get(key);
  }
}

export default AdvancedManager;
