import LevelPromise from 'level-promise';
import LevelSimpleManager from 'vinberodb/storage/LevelSimpleManager';
import levelup from 'levelup';
import rimraf from 'rimraf';
import { testSimpleManager } from 'vinberodb-test-helpers';

const testDbDirectory = `${__dirname}/../../../../leveldb-test`;
let db;

describe('LevelSimpleManager', () => {
  beforeEach('recreate database', () => {
    rimraf.sync(testDbDirectory);
    db = LevelPromise(levelup(testDbDirectory));
  });
  afterEach('close database', () => db.close());

  testSimpleManager(() => new LevelSimpleManager(db));
});
