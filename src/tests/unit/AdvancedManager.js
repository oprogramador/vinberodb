import AdvancedManager from 'grapedb/storage/AdvancedManager';
import InMemorySimpleManager from 'grapedb/storage/InMemorySimpleManager';
import Reference from 'grapedb/storage/Reference';
import expect from 'grapedb/tests/expect';
import sinon from 'sinon';
import testSimpleManager from 'grapedb/tests/generic/testSimpleManager';

const logger = {
  error: sinon.spy(),
  info: sinon.spy(),
};

describe('AdvancedManager', () => {
  testSimpleManager(() => new AdvancedManager(new InMemorySimpleManager(), logger));

  it('saves a string', () => {
    const simpleManager = new InMemorySimpleManager();
    const manager = new AdvancedManager(simpleManager, logger);
    const key = 'foo-key';
    const value = 'foo-value';

    return manager.setComplex(key, value)
      .then(() => expect(simpleManager.get(key)).to.eventually.equal(`string:${value}`));
  });

  it('gets null', () => {
    const simpleManager = new InMemorySimpleManager();
    const manager = new AdvancedManager(simpleManager, logger);

    return expect(manager.getComplex('non-existent')).to.eventually.be.null();
  });

  it('gets a string', () => {
    const simpleManager = new InMemorySimpleManager();
    const manager = new AdvancedManager(simpleManager, logger);
    const key = 'foo-key';
    const value = 'foo-value';

    return manager.setComplex(key, value)
      .then(() => expect(manager.getComplex(key)).to.eventually.equal(value));
  });

  it('saves a number', () => {
    const simpleManager = new InMemorySimpleManager();
    const manager = new AdvancedManager(simpleManager, logger);
    const key = 'foo-key';
    const value = 123;

    return manager.setComplex(key, value)
      .then(() => expect(simpleManager.get(key)).to.eventually.equal(`number:${value}`));
  });

  it('gets a number', () => {
    const simpleManager = new InMemorySimpleManager();
    const manager = new AdvancedManager(simpleManager, logger);
    const key = 'foo-key';
    const value = 234;

    return manager.setComplex(key, value)
      .then(() => expect(manager.getComplex(key)).to.eventually.equal(value));
  });

  it('gets zero', () => {
    const simpleManager = new InMemorySimpleManager();
    const manager = new AdvancedManager(simpleManager, logger);
    const key = 'foo-key';
    const value = 0;

    return manager.setComplex(key, value)
      .then(() => expect(manager.getComplex(key)).to.eventually.equal(value));
  });

  it('gets repeated simple values in nested object', () => {
    const simpleManager = new InMemorySimpleManager();
    const manager = new AdvancedManager(simpleManager, logger);
    const key = 'foo-key';
    const value = {
      foo: {
        bar: 1,
        baz: 123,
      },
      foo2: {
        bar: 'bar2',
        baz: 1,
      },
    };

    return manager.setComplex(key, value)
      .then(() => expect(manager.getComplex(key)).to.eventually.deep.equal(value));
  });

  it('saves a boolean', () => {
    const simpleManager = new InMemorySimpleManager();
    const manager = new AdvancedManager(simpleManager, logger);
    const key = 'foo-key';
    const value = true;

    return manager.setComplex(key, value)
      .then(() => expect(simpleManager.get(key)).to.eventually.equal(`boolean:${value}`));
  });

  it('gets a boolean', () => {
    const simpleManager = new InMemorySimpleManager();
    const manager = new AdvancedManager(simpleManager, logger);
    const key = 'foo-key';
    const value = true;

    return manager.setComplex(key, value)
      .then(() => expect(manager.getComplex(key)).to.eventually.equal(value));
  });

  it('saves an array', () => {
    const simpleManager = new InMemorySimpleManager();
    const manager = new AdvancedManager(simpleManager, logger);
    const key = 'foo-key';

    return manager.setComplex(key, ['foo', 'bar', 'baz'])
      .then(() => simpleManager.get(key))
      .then((value) => {
        expect(value).to.startWith('array:');

        return JSON.parse(value.replace(/array:/, ''));
      })
      .then(([foo, bar, baz]) => Promise.all([
        expect(simpleManager.get(foo)).to.eventually.equal('string:foo'),
        expect(simpleManager.get(bar)).to.eventually.equal('string:bar'),
        expect(simpleManager.get(baz)).to.eventually.equal('string:baz'),
      ]));
  });

  it('gets an array', () => {
    const simpleManager = new InMemorySimpleManager();
    const manager = new AdvancedManager(simpleManager, logger);
    const key = 'foo-key';
    const value = [1, 40, 3];

    return manager.setComplex(key, value)
      .then(() => expect(manager.getComplex(key)).to.eventually.deep.equal(value));
  });

  it('saves an object', () => {
    const simpleManager = new InMemorySimpleManager();
    const manager = new AdvancedManager(simpleManager, logger);
    const key = 'foo-key';

    return manager.setComplex(key, { bar: 'bar-value', baz: 'baz-value', foo: 'foo-value' })
      .then(() => simpleManager.get(key))
      .then((value) => {
        expect(value).to.startWith('object:');

        return JSON.parse(value.replace(/object:/, ''));
      })
      .then(({ foo, bar, baz }) => Promise.all([
        expect(simpleManager.get(foo)).to.eventually.equal('string:foo-value'),
        expect(simpleManager.get(bar)).to.eventually.equal('string:bar-value'),
        expect(simpleManager.get(baz)).to.eventually.equal('string:baz-value'),
      ]));
  });

  it('gets an object', () => {
    const simpleManager = new InMemorySimpleManager();
    const manager = new AdvancedManager(simpleManager, logger);
    const key = 'foo-key';
    const value = {
      bar: 'bar-1',
      baz: 'lorem ipsum',
      foo: 'foo-1',
    };

    return manager.setComplex(key, value)
      .then(() => expect(manager.getComplex(key)).to.eventually.deep.equal(value));
  });

  it('saves an array with multiple references to the same value', () => {
    const simpleManager = new InMemorySimpleManager();
    const manager = new AdvancedManager(simpleManager, logger);
    const key = 'foo-key';
    const referenced = { foo: 'bar' };
    const object = [
      referenced,
      referenced,
    ];

    return manager.setComplex(key, object)
      .then(() => simpleManager.get(key))
      .then((value) => {
        expect(value).to.startWith('array:');

        return JSON.parse(value.replace(/array:/, ''));
      })
      .then(([foo1, foo2]) => {
        expect(foo1).to.equal(foo2);

        return simpleManager.get(foo1);
      })
      .then((value) => {
        expect(value).to.startWith('object:');

        return JSON.parse(value.replace(/object:/, ''));
      })
      .then(({ foo }) => expect(simpleManager.get(foo)).to.eventually.equal('string:bar'));
  });

  it('gets an array with multiple references to the same value', () => {
    const simpleManager = new InMemorySimpleManager();
    const manager = new AdvancedManager(simpleManager, logger);
    const key = 'foo-key';
    const referenced = { foo: 'bar' };
    const value = [
      'lorem ipsum',
      referenced,
      referenced,
    ];

    return manager.setComplex(key, value)
      .then(() => expect(manager.getComplex(key)).to.eventually.deep.equal(value));
  });

  it('saves an object with multiple references to the same value', () => {
    const simpleManager = new InMemorySimpleManager();
    const manager = new AdvancedManager(simpleManager, logger);
    const key = 'foo-key';
    const referenced = { foo: 'bar' };
    const object = {
      foo1: referenced,
      foo2: referenced,
    };

    return manager.setComplex(key, object)
      .then(() => simpleManager.get(key))
      .then((value) => {
        expect(value).to.startWith('object:');

        return JSON.parse(value.replace(/object:/, ''));
      })
      .then(({ foo1, foo2 }) => {
        expect(foo1).to.equal(foo2);

        return simpleManager.get(foo1);
      })
      .then((value) => {
        expect(value).to.startWith('object:');

        return JSON.parse(value.replace(/object:/, ''));
      })
      .then(({ foo }) => expect(simpleManager.get(foo)).to.eventually.equal('string:bar'));
  });

  it('gets an object with multiple references to the same value', () => {
    const simpleManager = new InMemorySimpleManager();
    const manager = new AdvancedManager(simpleManager, logger);
    const key = 'foo-key';
    const referenced = { foo1: 'bar1' };
    const value = {
      bar: referenced,
      baz: 123,
      foo: referenced,
    };

    return manager.setComplex(key, value)
      .then(() => expect(manager.getComplex(key)).to.eventually.deep.equal(value));
  });

  it('saves an object with self-reference', () => {
    const simpleManager = new InMemorySimpleManager();
    const manager = new AdvancedManager(simpleManager, logger);
    const key = 'foo-main-key';
    const object = {
      foo1: 'foo-value',
    };
    object.foo2 = object;

    return manager.setComplex(key, object)
      .then(() => simpleManager.get(key))
      .then((value) => {
        expect(value).to.startWith('object:');

        return JSON.parse(value.replace(/object:/, ''));
      })
      .then(({ foo1, foo2 }) => {
        expect(foo2).to.equal(key);

        return expect(simpleManager.get(foo1)).to.eventually.equal('string:foo-value');
      });
  });

  it('gets an object with self-reference', () => {
    const simpleManager = new InMemorySimpleManager();
    const manager = new AdvancedManager(simpleManager, logger);
    const key = 'foo-key';
    const value = {
      foo1: 'foo-value',
    };
    value.foo2 = value;

    return manager.setComplex(key, value)
      .then(() => expect(manager.getComplex(key)).to.eventually.deep.equal(value));
  });

  it('saves nested objects', () => {
    const simpleManager = new InMemorySimpleManager();
    const manager = new AdvancedManager(simpleManager, logger);
    const objects = {
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

    return manager.setComplex('aRootKey', objects)
      .then(() => simpleManager.get('aRootKey'))
      .then(value => JSON.parse(value.replace(/^object:/, '')))
      .then(({ foo1, foo2 }) => Promise.all([
        simpleManager.get(foo1),
        simpleManager.get(foo2),
      ]))
      .then(values => values.map(value => JSON.parse(value.replace(/^object:/, ''))))
      .then(([foo1, foo2]) => Promise.all([
        simpleManager.get(foo2.foo),
        expect(simpleManager.get(foo1.bar)).to.eventually.equal('string:bar-value'),
        expect(simpleManager.get(foo1.baz)).to.eventually.equal('string:baz-value'),
        expect(simpleManager.get(foo1.foo)).to.eventually.equal('string:foo-value'),
        expect(simpleManager.get(foo2.bar)).to.eventually.equal('string:bar-value-2'),
        expect(simpleManager.get(foo2.baz)).to.eventually.equal('string:baz-value-2'),
      ]))
      .then(([foo1foo]) => JSON.parse(foo1foo.replace(/^array:/, '')))
      .then(([foo1foo0, foo1foo1]) => Promise.all([
        simpleManager.get(foo1foo1),
        expect(simpleManager.get(foo1foo0)).to.eventually.equal('string:foo-value-2'),
      ]))
      .then(([foo1foo1]) => JSON.parse(foo1foo1.replace(/^object:/, '')))
      .then(({ foo, bar }) => Promise.all([
        expect(simpleManager.get(foo)).to.eventually.equal('string:foo-value-2-foo-2'),
        expect(simpleManager.get(bar)).to.eventually.equal('string:foo-value-2-bar-2'),
      ]));
  });

  it('gets nested objects', () => {
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

    return manager.setComplex(key, value)
      .then(() => expect(manager.getComplex(key)).to.eventually.deep.equal(value));
  });

  it('gets nested objects limited to one level', () => {
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
    const limit = 1;

    return manager.setComplex(key, value)
      .then(() => manager.getComplex(key, limit))
      .then((result) => {
        expect(result).to.have.keys(['foo1', 'foo2']);
        expect(result.foo1).to.be.an.instanceOf(Reference);
        expect(result.foo2).to.be.an.instanceOf(Reference);
      });
  });

  it('gets nested objects limited to two levels', () => {
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
    const limit = 2;

    return manager.setComplex(key, value)
      .then(() => manager.getComplex(key, limit))
      .then((result) => {
        expect(result).to.have.keys(['foo1', 'foo2']);
        expect(result.foo1).to.have.keys(['bar', 'baz', 'foo']);
        expect(result.foo2).to.have.keys(['bar', 'baz', 'foo']);
        expect(result.foo1.bar).to.be.an.instanceOf(Reference);
        expect(result.foo1.baz).to.be.an.instanceOf(Reference);
        expect(result.foo1.foo).to.be.an.instanceOf(Reference);
        expect(result.foo2.bar).to.be.an.instanceOf(Reference);
        expect(result.foo2.baz).to.be.an.instanceOf(Reference);
        expect(result.foo2.foo).to.be.an.instanceOf(Reference);
      });
  });

  it('appends to object with references', () => {
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
    const limit = 2;

    return manager.setComplex(key, value)
      .then(() => manager.getComplex(key, limit))
      .then(result => manager.setComplex(key, Object.assign({}, result, { foo3: 'foo-3-value' })))
      .then(() => expect(manager.getComplex(key))
        .to.eventually.deep.equal(Object.assign({}, value, { foo3: 'foo-3-value' }))
      );
  });

  it('gets nested objects limited to three levels', () => {
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
    const limit = 3;

    return manager.setComplex(key, value)
      .then(() => manager.getComplex(key, limit))
      .then((result) => {
        expect(result).to.have.keys(['foo1', 'foo2']);
        expect(result.foo1).to.deep.equal({
          bar: 'bar-value',
          baz: 'baz-value',
          foo: 'foo-value',
        });
        expect(result.foo2).to.have.keys(['bar', 'baz', 'foo']);
        expect(result.foo2).to.containSubset({
          bar: 'bar-value-2',
          baz: 'baz-value-2',
        });
        expect(result.foo2.foo).to.be.an('array');
        expect(result.foo2.foo).to.have.length(2);
        expect(result.foo2.foo[0]).to.be.an.instanceOf(Reference);
        expect(result.foo2.foo[1]).to.be.an.instanceOf(Reference);
      });
  });

  it('gets nested objects limited to four levels', () => {
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
    const limit = 4;

    return manager.setComplex(key, value)
      .then(() => manager.getComplex(key, limit))
      .then((result) => {
        expect(result).to.have.keys(['foo1', 'foo2']);
        expect(result.foo1).to.deep.equal({
          bar: 'bar-value',
          baz: 'baz-value',
          foo: 'foo-value',
        });
        expect(result.foo2).to.have.keys(['bar', 'baz', 'foo']);
        expect(result.foo2).to.containSubset({
          bar: 'bar-value-2',
          baz: 'baz-value-2',
        });
        expect(result.foo2.foo).to.be.an('array');
        expect(result.foo2.foo).to.have.length(2);
        expect(result.foo2.foo[0]).to.equal('foo-value-2');
        expect(result.foo2.foo[1]).to.have.keys(['bar', 'foo']);
        expect(result.foo2.foo[1].bar).to.be.an.instanceOf(Reference);
        expect(result.foo2.foo[1].foo).to.be.an.instanceOf(Reference);
      });
  });

  it('gets nested objects limited to five levels', () => {
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
    const level = 5;

    return manager.setComplex(key, value)
      .then(() => expect(manager.getComplex(key, level)).to.eventually.deep.equal(value));
  });
});
