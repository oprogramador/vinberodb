import InMemorySimpleManager from 'grapedb/storage/InMemorySimpleManager';
import testSimpleManager from 'grapedb/tests/generic/testSimpleManager';

describe('InMemorySimpleManager', () => {
  testSimpleManager(() => new InMemorySimpleManager());
});
