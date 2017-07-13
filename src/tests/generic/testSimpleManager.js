import expect from 'grapedb/tests/expect';

function testSimpleManager(createManager) {
  describe('SimpleManager', () => {
    it('returns null when getting non-existent key', () => {
      const manager = createManager();

      return expect(manager.get('non-existent')).to.eventually.be.null();
    });

    it('sets an empty string and gets', () => {
      const manager = createManager();

      return manager.set('foo', '')
        .then(() => expect(manager.get('foo')).to.eventually.equal(''));
    });

    it('sets a string and gets', () => {
      const manager = createManager();

      return manager.set('foo', 'foo-123')
        .then(() => expect(manager.get('foo')).to.eventually.equal('foo-123'));
    });

    it('sets null at the begin', () => {
      const manager = createManager();

      return manager.set('foo', null)
        .then(() => expect(manager.get('foo')).to.eventually.be.null());
    });

    it('updates and gets', () => {
      const manager = createManager();

      return manager.set('foo', 'foo-123')
        .then(() => manager.set('foo', 'foo-new-value'))
        .then(() => expect(manager.get('foo')).to.eventually.equal('foo-new-value'));
    });

    it('updates with null', () => {
      const manager = createManager();

      return manager.set('foo', 'foo-123')
        .then(() => manager.set('foo', null))
        .then(() => expect(manager.get('foo')).to.eventually.be.null());
    });
  });
}

export default testSimpleManager;
