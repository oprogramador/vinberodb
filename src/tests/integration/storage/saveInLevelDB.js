import LevelPromise from 'level-promise';
import expect from 'grapedb/tests/expect';
import levelup from 'levelup';
import rimraf from 'rimraf';
import saveInLevelDB from 'grapedb/storage/saveInLevelDB';
import sinon from 'sinon';

const testDbDirectory = `${__dirname}/../../../../leveldb-test`;
let db;

const logger = {
  error: sinon.spy(),
  info: sinon.spy(),
};

describe('saveInLevelDB', () => {
  beforeEach('remove test database', () => rimraf.sync(testDbDirectory));
  afterEach('close database', () => db.close());

  it('saves a string', () => {
    const key = 'foo-key';
    const value = 'lorem ipsum';

    return saveInLevelDB(testDbDirectory, logger)(key, value)
      .then(() => {
        db = LevelPromise(levelup(testDbDirectory));

        return expect(db.get(key)).to.eventually.equal(`string:${value}`);
      });
  });

  it('saves a number', () => {
    const key = 'foo-key';
    const value = 123;

    return saveInLevelDB(testDbDirectory, logger)(key, value)
      .then(() => {
        db = LevelPromise(levelup(testDbDirectory));

        return expect(db.get(key)).to.eventually.equal(`number:${value}`);
      });
  });

  it('saves a boolean', () => {
    const key = 'foo-key';
    const value = true;

    return saveInLevelDB(testDbDirectory, logger)(key, value)
      .then(() => {
        db = LevelPromise(levelup(testDbDirectory));

        return expect(db.get(key)).to.eventually.equal(`boolean:${value}`);
      });
  });

  it('saves a null', () => {
    const key = 'foo-key';
    const value = null;

    return saveInLevelDB(testDbDirectory, logger)(key, value)
      .then(() => {
        db = LevelPromise(levelup(testDbDirectory));

        return expect(db.get(key)).to.eventually.equal(`null:${value}`);
      });
  });

  it('saves an array', () => {
    const key = 'foo-key';

    return saveInLevelDB(testDbDirectory, logger)(key, ['foo', 'bar', 'baz'])
      .then(() => {
        db = LevelPromise(levelup(testDbDirectory));

        return db.get(key);
      })
      .then((value) => {
        expect(value).to.startWith('array:');

        return JSON.parse(value.replace(/array:/, ''));
      })
      .then(([foo, bar, baz]) => Promise.all([
        expect(db.get(foo)).to.eventually.equal('string:foo'),
        expect(db.get(bar)).to.eventually.equal('string:bar'),
        expect(db.get(baz)).to.eventually.equal('string:baz'),
      ]));
  });

  it('saves an object', () => {
    const key = 'foo-key';

    return saveInLevelDB(testDbDirectory, logger)(key, { bar: 'bar-value', baz: 'baz-value', foo: 'foo-value' })
      .then(() => {
        db = LevelPromise(levelup(testDbDirectory));

        return db.get(key);
      })
      .then((value) => {
        expect(value).to.startWith('object:');

        return JSON.parse(value.replace(/object:/, ''));
      })
      .then(({ foo, bar, baz }) => Promise.all([
        expect(db.get(foo)).to.eventually.equal('string:foo-value'),
        expect(db.get(bar)).to.eventually.equal('string:bar-value'),
        expect(db.get(baz)).to.eventually.equal('string:baz-value'),
      ]));
  });

  it('saves an array with multiple references to the same value', () => {
    const key = 'foo-key';
    const referenced = { foo: 'bar' };
    const object = [
      referenced,
      referenced,
    ];

    return saveInLevelDB(testDbDirectory, logger)(key, object)
      .then(() => {
        db = LevelPromise(levelup(testDbDirectory));

        return db.get(key);
      })
      .then((value) => {
        expect(value).to.startWith('array:');

        return JSON.parse(value.replace(/array:/, ''));
      })
      .then(([foo1, foo2]) => {
        expect(foo1).to.equal(foo2);

        return db.get(foo1);
      })
      .then((value) => {
        expect(value).to.startWith('object:');

        return JSON.parse(value.replace(/object:/, ''));
      })
      .then(({ foo }) => expect(db.get(foo)).to.eventually.equal('string:bar'));
  });

  it('saves an object with multiple references to the same value', () => {
    const key = 'foo-key';
    const referenced = { foo: 'bar' };
    const object = {
      foo1: referenced,
      foo2: referenced,
    };

    return saveInLevelDB(testDbDirectory, logger)(key, object)
      .then(() => {
        db = LevelPromise(levelup(testDbDirectory));

        return db.get(key);
      })
      .then((value) => {
        expect(value).to.startWith('object:');

        return JSON.parse(value.replace(/object:/, ''));
      })
      .then(({ foo1, foo2 }) => {
        expect(foo1).to.equal(foo2);

        return db.get(foo1);
      })
      .then((value) => {
        expect(value).to.startWith('object:');

        return JSON.parse(value.replace(/object:/, ''));
      })
      .then(({ foo }) => expect(db.get(foo)).to.eventually.equal('string:bar'));
  });

  it('saves nested objects', () => {
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

    return saveInLevelDB(testDbDirectory, logger)('aRootKey', objects)
      .then(() => {
        db = LevelPromise(levelup(testDbDirectory));

        return db.get('aRootKey')
          .then(value => JSON.parse(value.replace(/^object:/, '')))
          .then(({ foo1, foo2 }) => Promise.all([
            db.get(foo1),
            db.get(foo2),
          ]))
          .then(values => values.map(value => JSON.parse(value.replace(/^object:/, ''))))
          .then(([foo1, foo2]) => Promise.all([
            db.get(foo2.foo),
            expect(db.get(foo1.bar)).to.eventually.equal('string:bar-value'),
            expect(db.get(foo1.baz)).to.eventually.equal('string:baz-value'),
            expect(db.get(foo1.foo)).to.eventually.equal('string:foo-value'),
            expect(db.get(foo2.bar)).to.eventually.equal('string:bar-value-2'),
            expect(db.get(foo2.baz)).to.eventually.equal('string:baz-value-2'),
          ]))
          .then(([foo1foo]) => JSON.parse(foo1foo.replace(/^array:/, '')))
          .then(([foo1foo0, foo1foo1]) => Promise.all([
            db.get(foo1foo1),
            expect(db.get(foo1foo0)).to.eventually.equal('string:foo-value-2'),
          ]))
          .then(([foo1foo1]) => JSON.parse(foo1foo1.replace(/^object:/, '')))
          .then(({ foo, bar }) => Promise.all([
            expect(db.get(foo)).to.eventually.equal('string:foo-value-2-foo-2'),
            expect(db.get(bar)).to.eventually.equal('string:foo-value-2-bar-2'),
          ]))
          ;
      });
  });
});
