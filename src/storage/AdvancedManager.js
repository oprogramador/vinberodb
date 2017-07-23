import AdvancedManagerGet from 'grapedb/storage/AdvancedManagerGet';
import AdvancedManagerSet from 'grapedb/storage/AdvancedManagerSet';

const db = Symbol('db');
const logger = Symbol('logger');

class AdvancedManager {
  constructor(_db, _logger) {
    this[db] = _db;
    this[logger] = _logger;
  }

  set(key, value) {
    return new AdvancedManagerSet(this[db], this[logger]).set(key, value);
  }

  get(key) {
    return new AdvancedManagerGet(this[db], this[logger]).get(key);
  }
}

export default AdvancedManager;
