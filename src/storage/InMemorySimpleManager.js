const _map = Symbol('map');

class InMemorySimpleManager {
  constructor() {
    this[_map] = {};
  }

  get(key) {
    if (typeof this[_map][key] === 'undefined') {
      return Promise.resolve(null);
    }

    return Promise.resolve(this[_map][key]);
  }

  set(key, value) {
    this[_map][key] = value;

    return Promise.resolve();
  }
}

export default InMemorySimpleManager;
