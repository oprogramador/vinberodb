import {
  AdvancedManager,
  InMemorySimpleManager,
  LevelSimpleManager,
  Reference,
} from 'vinberodb/index';
import expect from 'vinberodb/tests/expect';

describe('index', () => {
  it('returns AdvancedManager', () => {
    expect(AdvancedManager).to.be.a('function');
  });

  it('returns LevelSimpleManager', () => {
    expect(LevelSimpleManager).to.be.a('function');
  });

  it('returns InMemorySimpleManager', () => {
    expect(InMemorySimpleManager).to.be.a('function');
  });

  it('returns Reference', () => {
    expect(Reference).to.be.a('function');
  });
});
