import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiString from 'chai-string';
import chaiSubset from 'chai-subset';
import dirtyChai from 'dirty-chai';
import sinonChai from 'sinon-chai';

chai.use(chaiSubset);
chai.use(chaiAsPromised);
chai.use(chaiString);
chai.use(sinonChai);
chai.use(dirtyChai);

export default expect;
