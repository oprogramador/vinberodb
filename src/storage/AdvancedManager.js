import AdvancedManagerGet from 'grapedb/storage/AdvancedManagerGet';
import AdvancedManagerSet from 'grapedb/storage/AdvancedManagerSet';

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

  getComplex(key) {
    return new AdvancedManagerGet(this[db], this[logger]).get(key);
  }

  set(key, value) {
    return this[db].set(key, value);
  }

  get(key) {
    return this[db].get(key);
  }
}

export default AdvancedManager;
