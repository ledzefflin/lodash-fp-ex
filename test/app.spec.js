import chai from 'chai';
import _ from 'lodash/fp';
import lodashFpEx from '../lib/index';

_.mixin(lodashFpEx);

const expect = chai.expect;

const arr = [1, 2, 3, 4, 5];

describe('# _.mapAsync test', () => {
  it('should return all values multiplied by 2', async () => {
    const asyncMapper = (a) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(2 * a);
        }, 300);
      });

    const results = await _.mapAsync(asyncMapper, arr);
    console.log(results);
    expect(results).to.eql([2, 4, 6, 8, 10]);
  });
});

describe('# _.filterAsync test', () => {
  it('sholud return odd number only', async () => {
    const asyncFilter = (a) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(!(0 === a % 2));
        }, 300);
      });
    const results = await _.filterAsync(asyncFilter, arr);
    console.log(results);
    expect(results).not.empty;
    expect(results).to.eql([1, 3, 5]);
  });
});

describe('# _.reduceAsync test', () => {
  it('should return all values mulplied by 4', async () => {
    const asyncMapper = (a) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(2 * a);
        }, 500);
      });

    const results = await _.reduceAsync(
      async (accP, v) => {
        const acc = await accP;
        const nextVal = await asyncMapper(v);
        acc.push(nextVal);

        return acc;
      },
      [],
      arr
    );

    console.log(results);
    expect(results).not.empty;
    expect(results).to.eql([2, 4, 6, 8, 10]);
  });
});

describe('# _.not test', () => {
  it('_.not(true) should return false', () => {
    expect(_.not(true)).to.eql(false);
  });

  it('_.not("str") should return false', () => {
    expect(_.not('str')).to.eql(false);
  });

  it('_.not(false) should return true', () => {
    expect(_.not(false)).to.eql(true);
  });

  it('_.not(undefined) should return true', () => {
    expect(_.not(undefined)).to.eql(true);
  });

  it('_.not(null) should return true', () => {
    expect(_.not(null)).to.eql(true);
  });

  it('_.not(0) should return true', () => {
    expect(_.not(0)).to.eql(true);
  });
});
