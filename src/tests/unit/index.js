import {
  AdvancedManager,
  InMemorySimpleManager,
  LevelSimpleManager,
  Reference,
} from 'grapedb/index';
import expect from 'grapedb/tests/expect';

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
