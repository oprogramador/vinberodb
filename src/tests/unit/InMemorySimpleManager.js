import InMemorySimpleManager from 'vinberodb/storage/InMemorySimpleManager';
import { testSimpleManager } from 'vinberodb-test-helpers';

describe('InMemorySimpleManager', () => {
  testSimpleManager(() => new InMemorySimpleManager());
});
