import Reference from 'vinberodb/storage/Reference';
import expect from 'vinberodb/tests/expect';

describe('Reference', () => {
  it('gets key', () => {
    const reference = new Reference('foo-1');

    expect(reference.getKey()).to.equal('foo-1');
  });
});
