import chai from 'chai';
import _ from 'lodash/fp';
import lodashFpEx from '../lib/index';

_.mixin(lodashFpEx);

const expect = chai.expect;

const arr = [1, 2, 3, 4, 5];

describe('# _.not test', () => {
  it('_.not(true) should return false', () => {
    expect(_.not(true)).to.eqls(false);
  });

  it('_.not("str") should return false', () => {
    expect(_.not('str')).to.eqls(false);
  });

  it('_.not(false) should return true', () => {
    expect(_.not(false)).to.eqls(true);
  });

  it('_.not(undefined) should return true', () => {
    expect(_.not(undefined)).to.eqls(true);
  });

  it('_.not(null) should return true', () => {
    expect(_.not(null)).to.eqls(true);
  });

  it('_.not(0) should return true', () => {
    expect(_.not(0)).to.eqls(true);
  });
});

describe('# _.mapAsync test', () => {
  it('should return all values multiplied by 2', async () => {
    const asyncMapper = (a) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(2 * a);
        }, 5);
      });

    const results = await _.mapAsync(asyncMapper, arr);
    expect(results).to.eqls([2, 4, 6, 8, 10]);
  });
});

describe('# _.filterAsync test', () => {
  it('sholud return odd number only', async () => {
    const asyncFilter = (a) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(!(0 === a % 2));
        }, 5);
      });
    const results = await _.filterAsync(asyncFilter, arr);
    expect(results).not.empty;
    expect(results).to.eqls([1, 3, 5]);
  });
});

describe('# _.reduceAsync test', () => {
  it('should return all values mulplied by 2', async () => {
    const asyncMapper = (a) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(2 * a);
        }, 5);
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

    expect(results).not.empty;
    expect(results).to.eqls([2, 4, 6, 8, 10]);
  });
});

describe('# _.findAsync test', () => {
  it('should return object name property "hello"', async () => {
    const arr = [
      { name: 'hi', age: 21 },
      { name: 'hello', age: 22 },
      { name: 'alo', age: 23 }
    ];
    const asyncFilter = (a) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(_.pipe(_.get('name'), _.equals('hello'))(a));
        }, 5);
      });

    const result = await _.findAsync(asyncFilter, arr);

    expect(result).to.have.own.property('name', 'hello');
    expect(result).to.eqls({ name: 'hello', age: 22 });
  });
});

describe('# _.promisify test', () => {
  it('should return array [128, 128, 128]', async () => {
    const result = await _.promisify(128);
    const result1 = await _.promisify((a, b) => a + b, 64, 64);
    const result2 = await _.promisify(Promise.resolve(128));

    expect([result, result1, result2]).to.eqls([128, 128, 128]);
  });
});

describe('# _.then test', () => {
  it('should return 128', async () => {
    const p = (a) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(2 * a);
        }, 5);
      });

    const composer = _.pipe(p, _.then(_.identity));
    const result1 = await composer(64);
    const result2 = await _.then(_.identity, p(64));
    const result3 = await _.pipe(
      p,
      _.then((x) => x / 2)
    )(128);

    expect([result1, result2, result3]).to.eqls([128, 128, 128]);
  });
});

describe('# _.otherwise test', () => {
  const p = (a) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (_.equals(a * a, a)) {
          resolve(a);
        } else {
          reject(new Error('wrong'));
        }
      });
    });
  const composer = _.pipe(p, _.then(_.identity), _.otherwise(_.identity));
  it('should return "wrong" text', async () => {
    const result = await composer(2);

    expect(result).to.be.a('error', 'wrong');
  });

  it('should return 1', async () => {
    const result = await composer(1);

    expect(result).to.be.a('number', 1);
  });
});

describe('# _.finally test', () => {
  let isLoading = true;
  const p = (a) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (_.equals(a * a, a)) {
          resolve(a);
        } else {
          reject(new Error('wrong'));
        }
      });
    });
  const composer = _.pipe(
    p,
    _.then(_.identity),
    _.otherwise(_.identity),
    _.finally(() => (isLoading = false))
  );

  it('loading should be false', async () => {
    await composer(1);

    expect(isLoading).to.be.a('boolean', false);
  });
});
