import InMemorySimpleManager from 'vinberodb/storage/InMemorySimpleManager';
import testSimpleManager from 'vinberodb/tests/generic/testSimpleManager';

describe('InMemorySimpleManager', () => {
  testSimpleManager(() => new InMemorySimpleManager());
});
