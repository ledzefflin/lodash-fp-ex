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
    const results1 = await _.mapAsync(asyncMapper, { a: 1, b: 2, c: 3 });
    expect(results).to.eqls([2, 4, 6, 8, 10]);
    expect(results1).to.eqls([2, 4, 6]);
  });
});

describe('# _.filterAsync test', () => {
  it('sholud return odd number only', async () => {
    const asyncFilter = (a) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(!_.equals(0, a % 2));
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

describe('# _.forEachAsync test', () => {
  it('should return all values mulplied by array index', async () => {
    const asyncMapper = (v, i) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(i > 0 ? v * i : v * 1);
        }, 5);
      });
    const asyncMapper1 = (v, k) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(`${v} ${k}`);
        });
      }, 5);

    const results = await _.forEachAsync(async (v, i) => {
      const nextVal = await asyncMapper(v, i);
      return nextVal;
    }, arr);

    const results1 = await _.forEachAsync(
      async (v, k) => {
        const nextVal = await asyncMapper1(v, k);
        return nextVal;
      },
      {
        key: 'val',
        hello: 'world',
        'led zeppelin': 'stairway to heaven'
      }
    );

    expect(results).not.empty;
    expect(results).to.eqls([1, 2, 6, 12, 20]);
    expect(results1).to.eql(['val key', 'world hello', 'stairway to heaven led zeppelin']);
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
  const composer = _.pipe(p, _.then(_.identity), _.catch(_.identity));
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

describe('# _.isPromise test', () => {
  const p = Promise.resolve(1);
  const fn = () => 1;
  const str = '1';
  const num = 1;

  it('Promise should return true', () => {
    expect(_.promisify(p)).to.be.a('Promise');
  });

  it('Any other type also should return true', () => {
    expect(_.promisify(fn)).to.be.a('Promise');
    expect(_.promisify(str)).to.be.a('Promise');
    expect(_.promisify(num)).to.be.a('Promise');
    expect(_.promisify(null)).to.be.a('Promise');
    expect(_.promisify(undefined)).to.be.a('Promise');
  });
});

describe('# _.isNotEmpty test', () => {
  it('empty array, empty object, number, empty string, null, undefined should return "false"', () => {
    expect(_.isNotEmpty([])).to.be.false;
    expect(_.isNotEmpty({})).to.be.false;
    expect(_.isNotEmpty(1)).to.be.false;
    expect(_.isNotEmpty('')).to.be.false;
    expect(_.isNotEmpty(null)).to.be.false;
    expect(_.isNotEmpty(undefined)).to.be.false;
  });
});

describe('# _.isNotNil test', () => {
  it('null, undefined should return "false"', () => {
    expect(_.isNotNil(null)).to.be.false;
    expect(_.isNotNil(undefined)).to.be.false;
  });
  it('should return "true" except null and undefined', () => {
    expect(_.isNotNil(1)).to.be.true;
    expect(_.isNotNil({})).to.be.true;
    expect(_.isNotNil(() => 1)).to.be.true;
  });
});

describe('# _.isJson test', () => {
  it('JSON string should return "true"', () => {
    expect(_.isJson('{ "test": "value" }')).to.be.true;
  });

  it('Should return "false" except JSON string', () => {
    expect(_.isJson('test')).to.be.false;
    expect(_.isJson({ test: 'value' })).to.be.false;
  });
});

describe('# _.notEquals test', () => {
  it('Should return result that compare each other deeply', () => {
    expect(_.notEquals({ a: 1 }, { a: 1 })).to.be.false;
    expect(_.notEquals([1, 2, 3], [1, 2, 3])).to.be.false;

    expect(_.isNotEqual([1, 2, 3], [2, 3, 4])).to.be.true;
    expect(_.isNotEqual('string', 'number')).to.be.true;
    expect(_.isNotEqual(1, 2)).to.be.true;
  });
});

describe('# _.isVal test', () => {
  it('null, undefined, Boolean, Number, String type should return true', () => {
    expect(_.isVal(null)).to.be.true;
    expect(_.isVal(undefined)).to.be.true;
    expect(_.isVal(false)).to.be.true;
    expect(_.isVal(1)).to.be.true;
    expect(_.isVal('string')).to.be.true;

    expect(_.isVal([])).to.be.false;
    expect(_.isVal({})).to.be.false;
    expect(_.isVal(() => {})).to.be.false;
  });
});

describe('# _.isRef test', () => {
  it('null, Array, Object, Function type should return true', () => {
    expect(_.isRef(null)).to.be.false;
    expect(_.isRef(undefined)).to.be.false;
    expect(_.isRef(false)).to.be.false;
    expect(_.isRef(1)).to.be.false;
    expect(_.isRef('string')).to.be.false;

    expect(_.isRef([])).to.be.true;
    expect(_.isRef({})).to.be.true;
    expect(_.isRef(() => {})).to.be.true;
  });
});

describe('# _.not test', () => {
  it('Should return opposite boolean value from input', () => {
    expect(_.not(0)).to.be.true;

    expect(_.not(true)).to.be.false;
    expect(_.not(1)).to.be.false;
    expect(_.not({})).to.be.false;
  });
});

describe('# _.notIncludes test', () => {
  it('Should return opposite result from _.includes', () => {
    expect(_.notIncludes(1, [1, 2, 3])).to.be.false;
    expect(_.notIncludes('s', 'string')).to.be.false;
    expect(_.notIncludes(1, { a: 1, b: 2 })).to.be.false;
  });
});

describe('# _.toBool test', () => {
  it('Argument should transform to Boolean type', () => {
    expect(_.toBool(1)).to.be.true;
    expect(_.toBool('true')).to.be.true;

    expect(_.toBool(0)).to.be.false;
    expect(_.toBool(null)).to.be.false;
    expect(_.toBool(undefined)).to.be.false;
    expect(_.toBool('false')).to.be.false;
  });
});

describe('# _.deepFreeze test', () => {
  const shallowFrozen = Object.freeze({
    a: {
      b: []
    }
  });
  const deepFrozen = _.deepFreeze({
    a: {
      b: [],
      c: () => {}
    }
  });

  it('nested referece type properties should also be freeze', () => {
    expect(Object.isFrozen(shallowFrozen)).to.be.true;
    expect(Object.isFrozen(shallowFrozen.a)).to.be.false;
    expect(Object.isFrozen(shallowFrozen.a.b)).to.be.false;

    expect(Object.isFrozen(deepFrozen)).to.be.true;
    expect(Object.isFrozen(deepFrozen.a)).to.be.true;
    expect(Object.isFrozen(deepFrozen.a.b)).to.be.true;
    expect(Object.isFrozen(deepFrozen.a.c)).to.be.true;
  });
});

describe('# _.key test', () => {
  const obj = { a: 1 };
  const obj1 = { a: 1, b: 1, c: 1 };

  it('Should return last property name of value', () => {
    expect(_.key(obj, 1)).to.be.a('String', 'a');
    expect(_.keyByVal(obj1, 1)).to.be.a('String', 'c');
  });
});

describe('# _.transformObjectKey test', () => {
  const obj = { obj_key: 1 };
  const obj1 = { 'obj-key': 1, obj_key: 2 };
  const nestedObj = {
    objKey: {
      nestedKey: {
        anotherKey: [3]
      }
    }
  };

  it('Should transform by input function', () => {
    const kebabKeyObj = _.transformObjectKey(_.kebabCase, obj);
    const kebabKeyObj1 = _.transformObjectKey(_.kebabCase, nestedObj);
    console.log(kebabKeyObj1);
    expect(_.keys(kebabKeyObj)).to.eqls(['obj-key']);
    expect(kebabKeyObj1).to.eqls({ 'obj-key': { 'nested-key': { 'another-key': [3] } } });
  });

  it('If transformed keys are duplicated, should throw error', () => {
    const errFn = () => _.transformObjectKey(_.kebabCase, obj1);
    expect(errFn).to.throw(
      Error,
      `${_.pipe(
        _.keys,
        _.head,
        _.kebabCase
      )(obj1)} already exist. duplicated property name is not supported.`
    );
  });
});

describe('# _.toCamelKey test', () => {
  const obj = { obj_key: 1 };
  const obj1 = { 'obj-key': 1, obj_key: 2 };

  it('Object property names are converted to camelcase', () => {
    const camelcaseObj = _.toCamelKey(obj);
    expect(_.keys(camelcaseObj)).to.eqls(['objKey']);
  });

  it('If transformed keys are duplicated, should throw error', () => {
    const errFn = () => _.toCamelKey(obj1);
    expect(errFn).to.throw(
      Error,
      `${_.pipe(
        _.keys,
        _.head,
        _.camelCase
      )(obj1)} already exist. duplicated property name is not supported.`
    );
  });
});

describe('# _.toSnakeKey test', () => {
  const obj = { objKey: 1 };
  const obj1 = { objKey: 1, 'obj key': 2 };

  it('Object property names are converted to snakecase', () => {
    const snakecaseObj = _.toSnakeKey(obj);
    expect(_.keys(snakecaseObj)).to.eqls(['obj_key']);
  });

  it('If transformed keys are duplicated, should throw error', () => {
    const errFn = () => _.toSnakeKey(obj1);
    expect(errFn).to.throw(
      Error,
      `${_.pipe(
        _.keys,
        _.head,
        _.snakeCase
      )(obj1)} already exist. duplicated property name is not supported.`
    );
  });
});

describe('# _.pascalCase test', () => {
  it('Should transform to Pascalcase', () => {
    const isAllSame = _.every(
      _.equals('FooBar'),
      _.map(_.pascalCase, ['__Foo_Bar__', 'FOO BAR', 'fooBar', 'foo_bar', 'foo-bar'])
    );
    expect(isAllSame).to.be.true;
  });
});

describe('# _.isDatetimeString test', () => {
  it('Should return true with valid datetime string', () => {
    const datetimeStrings = [
      'Aug 9, 1995',
      'Wed, 09 Aug 1995 00:00:00 GMT',
      'Wed, 09 Aug 1995 00:00:00',
      '2021/03/14',
      '2021-03-14',
      '2021/03/14 14:21:00',
      '2021-03-14 14:21:00',
      '6 Mar 17 21:22 UT',
      '6 Mar 17 21:22:23 UT',
      '6 Mar 2017 21:22:23 GMT',
      '06 Mar 2017 21:22:23 Z',
      'Mon 06 Mar 2017 21:22:23 z',
      'Mon, 06 Mar 2017 21:22:23 +0000'
    ];

    const invalidDatetimeStrings = ['21:22:23', '20210314'];

    expect(_.every(_.pipe(_.isDatetimeString, _.equals(true)), datetimeStrings)).to.be.true;
    expect(_.every(_.pipe(_.isDatetimeString, _.equals(false)), invalidDatetimeStrings)).to.be.true;
  });
});

describe('# _.ap test', () => {
  it('Should return valid value', () => {
    const includesWithAp = _.pipe(_.includes, _.ap('string'));
    const reduceWithAp = _.pipe(_.reduce, _.ap(['f', 'o', 'o']));

    expect(includesWithAp('i')).to.be.true;
    expect(reduceWithAp((acc, v) => `${acc}${v}`, '')).to.eql('foo');
  });
});

describe('# _.instanceOf test', () => {
  class Car {
    constructor(make, model, year) {
      this.make = make;
      this.model = model;
      this.year = year;
    }
  }
  class C {}
  class D {}
  const auto = new Car('Honda', 'Accord', 1998);

  it('Should return true', () => {
    expect(_.instanceOf(Car, auto)).to.be.true;
    expect(_.instanceOf(Object, auto)).to.be.true;

    expect(_.instanceOf(C, new C())).to.be.true;
    expect(_.instanceOf(C, new D())).to.be.false;

    expect(_.instanceOf(String, 'string')).to.be.false;
    expect(_.instanceOf(String, new String('string'))).to.be.true;

    expect(_.instanceOf(Object, {})).to.be.true;
  });
});

describe('# _.ternary test', () => {
  const YorN = _.ternary(null, 'Y', 'N');
  const paddingYorN = _.ternary(
    null,
    (a) => `${a}-Y`,
    (a) => `${a}-N`
  );

  it('If argument is true, should return Y else return N', () => {
    expect(YorN(true)).to.eql('Y');
    expect(YorN(false)).to.eql('N');
    expect(_.pipe(_.isEmpty, YorN)(['a'])).to.eql('N');
    expect(
      _.ternary(
        null,
        () => 'y',
        () => 'n',
        true
      )
    ).to.eql('y');
  });

  it('If arguement is not one of false, null, undefined, empty string, padding "-Y" else padding "-N"', () => {
    expect(paddingYorN('True')).to.eql('True-Y');

    expect(paddingYorN('')).to.eql('-N');
    expect(paddingYorN(null)).to.eql('null-N');
    expect(paddingYorN(undefined)).to.eql('undefined-N');
    expect(paddingYorN(false)).to.eql('false-N');
  });

  it('If argments has true, return Y else N', () => {
    const hasTrue = (args) => _.includes(true, args);
    const ternaryByHandler = _.ternary(
      hasTrue,
      () => 'Y',
      () => 'N'
    );
    const ternaryByValue = _.ternary(hasTrue, 'y', 'n');

    expect(ternaryByHandler([false, 'N', null, undefined])).to.eql('N');
    expect(ternaryByHandler([true])).to.eql('Y');

    expect(ternaryByValue([false, 'N', null, undefined])).to.eql('n');
    expect(ternaryByValue([true])).to.eql('y');
  });
});

describe('# _.ifT test', () => {
  const getYifT = _.ifT(_.isEmpty, () => 'Y');
  const ifNotEmptyAppendString = _.ifT(_.isNotEmpty, (str) => `${str}-paddString`);

  it('if argument is empty, should return Y else return argument', () => {
    expect(getYifT([])).to.eql('Y');
    expect(getYifT('str')).to.be.a('String', 'str');
  });

  it('if argument is not empty, should pad string, else return argument', () => {
    expect(ifNotEmptyAppendString('str')).to.eql('str-paddString');
    expect(ifNotEmptyAppendString('')).to.eql('');

    expect(ifNotEmptyAppendString([])).to.eql([]);
    expect(ifNotEmptyAppendString(['s', 't', 'r'])).to.eql('s,t,r-paddString');
    expect(ifNotEmptyAppendString('str')).to.eql('str-paddString');
  });
});

describe('# _.ifF test', () => {
  const ifNotEmptyN = _.ifF(_.isEmpty, () => 'N');
  const ifNotEmptyAppendString = _.ifF(_.isEmpty, (str) => `${str}-paddString`);

  it('if argument is not empty, should return N else return argument', () => {
    expect(ifNotEmptyN([])).to.eql([]);
    expect(ifNotEmptyN('str')).to.be.a('String', 'N');
  });

  it('if argument is not empty, should pad string, else return argument', () => {
    expect(ifNotEmptyAppendString('str')).to.eql('str-paddString');
    expect(ifNotEmptyAppendString('')).to.eql('');

    expect(ifNotEmptyAppendString([])).to.eql([]);
    expect(ifNotEmptyAppendString(['s', 't', 'r'])).to.eql('s,t,r-paddString');
    expect(ifNotEmptyAppendString('str')).to.eql('str-paddString');
  });
});

describe('# _.removeByIndex test', () => {
  const arr = [1, 2, 3];
  const secondRemoved = _.removeByIndex(1, arr);

  it('Should argument array is not mutated', () => {
    expect(arr).to.eqls([1, 2, 3]);
  });

  it('argument index element Should be removed', () => {
    expect(secondRemoved).to.eqls([1, 3]);
  });
});

describe('# _.removeLast test', () => {
  const arr = [1, 2, 3];
  const secondRemoved = _.removeLast(arr);

  it('Should argument array is not mutated', () => {
    expect(arr).to.eqls([1, 2, 3]);
  });

  it('argument index element Should be removed', () => {
    expect(secondRemoved).to.eqls([1, 2]);
  });
});

describe('# _.append test', () => {
  const arr = [1];
  const appended = _.append(arr, 34);

  it('Should argument array is not mutated', () => {
    expect(arr).to.eqls([1]);
    expect(appended).to.eqls([1, 34]);
  });

  it('Should append argment', () => {
    expect(_.append(arr, 2)).to.eqls([1, 2]);
    expect(_.append(arr, [2, 3, 4])).to.eqls([1, 2, 3, 4]);
  });
});

describe('# _.prepend test', () => {
  const arr = [1];

  it('Should argument array is not mutated', () => {
    _.prepend(arr, 55);
    expect(arr).to.eqls([1]);
  });

  it('Should prepend argment', () => {
    expect(_.prepend(arr, 2)).to.eqls([2, 1]);
    expect(_.prepend(arr, [2, 3, 4])).to.eqls([2, 3, 4, 1]);
  });
});

describe('# _.mapWithKey test', () => {
  const arr = [3, 4, 5];
  const getIdxs = _.mapWithKey((v, i) => i);

  it('Should return indexs', () => {
    expect(getIdxs(arr)).to.eqls([0, 1, 2]);
  });

  it('Should return keys', () => {
    expect(getIdxs({ a: 1, b: 2 })).to.eqls(['a', 'b']);
  });
});

describe('# _.reduceWithKey test', () => {
  const arr = [3, 4, 5];
  const getIdxs = _.reduceWithKey((acc, v, i) => _.concat(acc, i), []);

  it('Should return indexs', () => {
    expect(getIdxs(arr)).to.eqls([0, 1, 2]);
  });

  it('Should return keys', () => {
    expect(getIdxs({ a: 1, b: 2 })).to.eqls(['a', 'b']);
  });
});
