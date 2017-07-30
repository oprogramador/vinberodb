const key = Symbol('key');

class Reference {
  constructor(_key) {
    this[key] = _key;
  }

  getKey() {
    return this[key];
  }
}

export default Reference;
