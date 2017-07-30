# grapedb

[![MIT License](https://img.shields.io/badge/license-mit-green.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Build Status](https://travis-ci.org/oprogramador/grapedb.svg?branch=master)](https://travis-ci.org/oprogramador/grapedb
)

[![NPM status](https://nodei.co/npm/grapedb.png?downloads=true&stars=true)](https://npmjs.org/package/grapedb
)

GrapeDB is a distributed object database. It can be also considered as an ODM.

## install
`npm install --save grapedb`

## usage
The main class is `AdvancedManager` which has the following public methods:
- `get(key)` - gets a stringified node
- `set(key, value)` - sets a stringified node
- `getComplex(key, maxLevel)` - gets recursively an object with nested fields, `maxLevel` specifies the maximum depth; when `maxLevel` is `undefined`, the full object is returned
- `setComplex(key, value)` - saves an object (creates or updates)

In order to delete an object, use `setComplex(key, null)`.

`AdvancedManager` requires an injected simple manager and a logger.

The logger should have the following methods:
- `info(message)`
- `error(message)`

The simple manager should have the following methods:
- `get(key)`
- `set(key, value)` - value is always a string

GrapeDB provides the following simple managers:
- `InMemorySimpleManager` - saves objects only in JavaScript memory (RAM)
- `LevelSimpleManager` - an adapter to [LevelDB](https://github.com/google/leveldb)

Example usage:
```
const { AdvancedManager, InMemorySimpleManager } = require('grapedb');

const logger = {
  error: () => {},
  info: () => {},
};

const simpleManager = new InMemorySimpleManager();
const manager = new AdvancedManager(simpleManager, logger);
const key = 'foo-key';
const value = {
  foo1: {
    bar: 'bar-value',
    baz: 'baz-value',
    foo: 'foo-value',
  },
  foo2: {
    bar: 'bar-value-2',
    baz: 'baz-value-2',
    foo: [
      'foo-value-2',
      {
        bar: 'foo-value-2-bar-2',
        foo: 'foo-value-2-foo-2',
      },
    ],
  },
};

manager.setComplex(key, value)
  .then(() => expect(manager.getComplex(key)).to.eventually.deep.equal(value));
```
