import expect from 'grapedb/tests/expect';
import { saveInLevelDB } from 'grapedb/index';

describe('index', () => {
  it('returns saveInLevelDB', () => {
    expect(saveInLevelDB).to.be.a('function');
  });
});
