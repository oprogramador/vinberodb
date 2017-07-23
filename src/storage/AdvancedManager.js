import AdvancedManagerGet from 'grapedb/storage/AdvancedManagerGet';
import AdvancedManagerSet from 'grapedb/storage/AdvancedManagerSet';

class AdvancedManager {
  constructor(db, logger) {
    this.db = db;
    this.logger = logger;
  }

  set(key, value) {
    return new AdvancedManagerSet(this.db, this.logger).set(key, value);
  }

  get(key) {
    return new AdvancedManagerGet(this.db, this.logger).get(key);
  }
}

export default AdvancedManager;
