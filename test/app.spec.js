import chai from 'chai';
import fp from 'lodash/fp';
import lodashFpEx from '../index';

fp.mixin(lodashFpEx);

const expect = chai.expect;

const arr = [1, 2, 3, 4, 5];

describe('# fp.not test', () => {
  it('fp.not(true) should return false', () => {
    expect(fp.not(true)).to.eqls(false);
  });

  it('fp.not("str") should return false', () => {
    expect(fp.not('str')).to.eqls(false);
  });

  it('fp.not(false) should return true', () => {
    expect(fp.not(false)).to.eqls(true);
  });

  it('fp.not(undefined) should return true', () => {
    expect(fp.not(undefined)).to.eqls(true);
  });

  it('fp.not(null) should return true', () => {
    expect(fp.not(null)).to.eqls(true);
  });

  it('fp.not(0) should return true', () => {
    expect(fp.not(0)).to.eqls(true);
  });
});

describe('# fp.mapAsync test', () => {
  it('should return all values multiplied by 2', async () => {
    const asyncMapper = (a, k) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(a + k);
        }, 5);
      });

    const results = await fp.mapAsync(asyncMapper, arr);
    const results1 = await fp.mapAsync(asyncMapper, { a: 1, b: 2, c: 3 });
    // key test를 포함하고 있어서 key test 따로 작성 안함
    expect(results).to.eqls([1, 3, 5, 7, 9]);
    expect(results1).to.eqls(['1a', '2b', '3c']);
  });
});

describe('# fp.filterAsync test', () => {
  it('sholud return odd number only', async () => {
    const asyncFilter = (a, i) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(!fp.equals(0, a % 2));
        }, 5);
      });
    const results = await fp.filterAsync(asyncFilter, arr);
    expect(results).not.empty;
    expect(results).to.eqls([1, 3, 5]);
  });

  it('exist keys', async () => {
    const asyncKeys = (_, i) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(i > 0);
        }, 1);
      });
    const biggerThanZeroList = await fp.filterAsync(asyncKeys, arr);
    expect(biggerThanZeroList).to.eql([2, 3, 4, 5]);
  });
});

describe('# fp.reduceAsync test', () => {
  it('should return all values mulplied by 2', async () => {
    const asyncMapper = (a) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(2 * a);
        }, 5);
      });

    const results = await fp.reduceAsync(
      async (accP, v) => {
        const acc = await accP;
        const nextVal = await asyncMapper(v);
        acc.push(nextVal);

        return acc;
      },
      [],
      arr,
    );

    expect(results).not.empty;
    expect(results).to.eqls([2, 4, 6, 8, 10]);
  });

  it('exist keys', async () => {
    const asyncKeys = (acc, v, i) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(i > 0 ? acc.concat(i) : acc);
        }, 1);
      });
    const biggerThanZeroList = await fp.reduceAsync(
      async (accP, v, k) => {
        const acc = await accP;
        return await asyncKeys(acc, v, k);
      },
      [],
      arr,
    );
    expect(biggerThanZeroList).to.eql([1, 2, 3, 4]);
  });
});

describe('# fp.findAsync test', () => {
  it('should return object name property "hello"', async () => {
    const arr = [
      { name: 'hi', age: 21 },
      { name: 'hello', age: 22 },
      { name: 'alo', age: 23 },
    ];
    const asyncFilter = (a) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(fp.pipe(fp.get('name'), fp.equals('hello'))(a));
        }, 5);
      });

    const result = await fp.findAsync(asyncFilter, arr);

    expect(result).to.have.own.property('name', 'hello');
    expect(result).to.eqls({ name: 'hello', age: 22 });
  });

  it('exist keys', async () => {
    const asyncKeys = (v, i) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(fp.equals(3, i));
        }, 1);
      });
    const threeKey = await fp.findAsync(asyncKeys, arr);
    expect(threeKey).to.eql(4);
  });
});

describe('# fp.forEachAsync test', () => {
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

    const results = await fp.forEachAsync(async (v, i) => {
      const nextVal = await asyncMapper(v, i);
      return nextVal;
    }, arr);

    const results1 = await fp.forEachAsync(
      async (v, k) => {
        const nextVal = await asyncMapper1(v, k);
        return nextVal;
      },
      {
        key: 'val',
        hello: 'world',
        'led zeppelin': 'stairway to heaven',
      },
    );

    expect(results).not.empty;
    expect(results).to.eqls([1, 2, 6, 12, 20]);
    expect(results1).to.eql([
      'val key',
      'world hello',
      'stairway to heaven led zeppelin',
    ]);
  });

  it('exist keys', async () => {
    const asyncKeys = (v, i) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(i);
        }, 1);
      });
    const keys = await fp.forEachAsync(asyncKeys, arr);
    expect(keys).to.eql([0, 1, 2, 3, 4]);
  });
});

describe('# fp.promisify test', () => {
  it('should return array [128, 128, 128]', async () => {
    const result = await fp.promisify(128);
    const result1 = await fp.promisify((a, b) => a + b, 64, 64);
    const result2 = await fp.promisify(Promise.resolve(128));

    expect([result, result1, result2]).to.eqls([128, 128, 128]);
  });
});

describe('# fp.then test', () => {
  it('should return 128', async () => {
    const p = (a) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(2 * a);
        }, 5);
      });

    const composer = fp.pipe(p, fp.then(fp.identity));
    const result1 = await composer(64);
    const result2 = await fp.then(fp.identity, p(64));
    const result3 = await fp.pipe(
      p,
      fp.then((x) => x / 2),
    )(128);

    expect([result1, result2, result3]).to.eqls([128, 128, 128]);
  });
});

describe('# fp.otherwise test', () => {
  const p = (a) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (fp.equals(a * a, a)) {
          resolve(a);
        } else {
          reject(new Error('wrong'));
        }
      });
    });
  const composer = fp.pipe(p, fp.then(fp.identity), fp.catch(fp.identity));
  it('should return "wrong" text', async () => {
    const result = await composer(2);

    expect(result).to.be.a('error', 'wrong');
  });

  it('should return 1', async () => {
    const result = await composer(1);

    expect(result).to.be.a('number', 1);
  });
});

describe('# fp.finally test', () => {
  let isLoading = true;
  const p = (a) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (fp.equals(a * a, a)) {
          resolve(a);
        } else {
          reject(new Error('wrong'));
        }
      });
    });
  const composer = fp.pipe(
    p,
    fp.then(fp.identity),
    fp.otherwise(fp.identity),
    fp.finally(() => (isLoading = false)),
  );

  it('loading should be false', async () => {
    await composer(1);

    expect(isLoading).to.be.a('boolean', false);
  });
});

describe('# fp.isPromise test', () => {
  const p = Promise.resolve(1);
  const fn = () => 1;
  const str = '1';
  const num = 1;

  it('Promise should return true', () => {
    expect(fp.promisify(p)).to.be.a('Promise');
  });

  it('Any other type also should return true', () => {
    expect(fp.promisify(fn)).to.be.a('Promise');
    expect(fp.promisify(str)).to.be.a('Promise');
    expect(fp.promisify(num)).to.be.a('Promise');
    expect(fp.promisify(null)).to.be.a('Promise');
    expect(fp.promisify(undefined)).to.be.a('Promise');
  });
});

describe('# fp.isNotEmpty test', () => {
  it('empty array, empty object, number, empty string, null, undefined should return "false"', () => {
    expect(fp.isNotEmpty([])).to.be.false;
    expect(fp.isNotEmpty({})).to.be.false;
    expect(fp.isNotEmpty(1)).to.be.false;
    expect(fp.isNotEmpty('')).to.be.false;
    expect(fp.isNotEmpty(null)).to.be.false;
    expect(fp.isNotEmpty(undefined)).to.be.false;
  });
});

describe('# fp.isNotNil test', () => {
  it('null, undefined should return "false"', () => {
    expect(fp.isNotNil(null)).to.be.false;
    expect(fp.isNotNil(undefined)).to.be.false;
  });
  it('should return "true" except null and undefined', () => {
    expect(fp.isNotNil(1)).to.be.true;
    expect(fp.isNotNil({})).to.be.true;
    expect(fp.isNotNil(() => 1)).to.be.true;
  });
});

describe('# fp.isJson test', () => {
  it('JSON string should return "true"', () => {
    expect(fp.isJson('{ "test": "value" }')).to.be.true;
  });

  it('Should return "false" except JSON string', () => {
    expect(fp.isJson('test')).to.be.false;
    expect(fp.isJson({ test: 'value' })).to.be.false;
  });
});

describe('# fp.notEquals test', () => {
  it('Should return result that compare each other deeply', () => {
    expect(fp.notEquals({ a: 1 }, { a: 1 })).to.be.false;
    expect(fp.notEquals([1, 2, 3], [1, 2, 3])).to.be.false;

    expect(fp.isNotEqual([1, 2, 3], [2, 3, 4])).to.be.true;
    expect(fp.isNotEqual('string', 'number')).to.be.true;
    expect(fp.isNotEqual(1, 2)).to.be.true;
  });
});

describe('# fp.isVal test', () => {
  it('null, undefined, Boolean, Number, String type should return true', () => {
    expect(fp.isVal(null)).to.be.true;
    expect(fp.isVal(undefined)).to.be.true;
    expect(fp.isVal(false)).to.be.true;
    expect(fp.isVal(1)).to.be.true;
    expect(fp.isVal('string')).to.be.true;

    expect(fp.isVal([])).to.be.false;
    expect(fp.isVal({})).to.be.false;
    expect(fp.isVal(() => {})).to.be.false;
  });
});

describe('# fp.isRef test', () => {
  it('null, Array, Object, Function type should return true', () => {
    expect(fp.isRef(null)).to.be.false;
    expect(fp.isRef(undefined)).to.be.false;
    expect(fp.isRef(false)).to.be.false;
    expect(fp.isRef(1)).to.be.false;
    expect(fp.isRef('string')).to.be.false;

    expect(fp.isRef([])).to.be.true;
    expect(fp.isRef({})).to.be.true;
    expect(fp.isRef(() => {})).to.be.true;
  });
});

describe('# fp.not test', () => {
  it('Should return opposite boolean value from input', () => {
    expect(fp.not(0)).to.be.true;

    expect(fp.not(true)).to.be.false;
    expect(fp.not(1)).to.be.false;
    expect(fp.not({})).to.be.false;
  });
});

describe('# fp.notIncludes test', () => {
  it('Should return opposite result from fp.includes', () => {
    expect(fp.notIncludes(1, [1, 2, 3])).to.be.false;
    expect(fp.notIncludes('s', 'string')).to.be.false;
    expect(fp.notIncludes(1, { a: 1, b: 2 })).to.be.false;
  });
});

describe('# fp.toBool test', () => {
  it('Argument should transform to Boolean type', () => {
    expect(fp.toBool(1)).to.be.true;

    expect(fp.toBool(0)).to.be.false;
    expect(fp.toBool(null)).to.be.false;
    expect(fp.toBool(undefined)).to.be.false;
  });
});

describe('# fp.deepFreeze test', () => {
  const shallowFrozen = Object.freeze({
    a: {
      b: [],
    },
  });
  const deepFrozen = fp.deepFreeze({
    a: {
      b: [],
      c: () => {},
    },
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

describe('# fp.key test', () => {
  const obj = { a: 1 };
  const obj1 = { a: 1, b: 1, c: 1 };
  const obj2 = { a: { b: { k: 1 } } };

  it('Should return last property name of value', () => {
    expect(fp.key(obj, 1)).to.be.a('String', 'a');
    expect(fp.keyByVal(obj1, 1)).to.be.a('String', 'c');
    expect(fp.key(obj2, { b: { k: 1 } })).eql('a');
    expect(fp.key(obj2, { b: { k: 2 } })).eql(undefined);
  });
});

describe('# fp.transformObjectKey test', () => {
  const obj = { obj_key: 1 };
  const obj1 = { 'obj-key': 1, obj_key: 2 };
  const nestedObj = {
    objKey: {
      nestedKey: {
        anotherKey: [3],
      },
    },
  };

  it('Should transform by input function', () => {
    const kebabKeyObj = fp.transformObjectKey(fp.kebabCase, obj);
    const kebabKeyObj1 = fp.transformObjectKey(fp.kebabCase, nestedObj);
    console.log(kebabKeyObj1);
    expect(fp.keys(kebabKeyObj)).to.eqls(['obj-key']);
    expect(kebabKeyObj1).to.eqls({
      'obj-key': { 'nested-key': { 'another-key': [3] } },
    });
  });

  it('If transformed keys are duplicated, should throw error', () => {
    const errFn = () => fp.transformObjectKey(fp.kebabCase, obj1);
    expect(errFn).to.throw(
      Error,
      `${fp.pipe(
        fp.keys,
        fp.head,
        fp.kebabCase,
      )(obj1)} already exist. duplicated property name is not supported.`,
    );
  });
});

describe('# fp.toCamelKey test', () => {
  const obj = { obj_key: 1 };
  const obj1 = { 'obj-key': 1, obj_key: 2 };

  it('Object property names are converted to camelcase', () => {
    const camelcaseObj = fp.toCamelKey(obj);
    expect(fp.keys(camelcaseObj)).to.eqls(['objKey']);
  });

  it('If transformed keys are duplicated, should throw error', () => {
    const errFn = () => fp.toCamelKey(obj1);
    expect(errFn).to.throw(
      Error,
      `${fp.pipe(
        fp.keys,
        fp.head,
        fp.camelCase,
      )(obj1)} already exist. duplicated property name is not supported.`,
    );
  });
});

describe('# fp.toSnakeKey test', () => {
  const obj = { objKey: 1 };
  const obj1 = { objKey: 1, 'obj key': 2 };

  it('Object property names are converted to snakecase', () => {
    const snakecaseObj = fp.toSnakeKey(obj);
    expect(fp.keys(snakecaseObj)).to.eqls(['obj_key']);
  });

  it('If transformed keys are duplicated, should throw error', () => {
    const errFn = () => fp.toSnakeKey(obj1);
    expect(errFn).to.throw(
      Error,
      `${fp.pipe(
        fp.keys,
        fp.head,
        fp.snakeCase,
      )(obj1)} already exist. duplicated property name is not supported.`,
    );
  });
});

describe('# fp.pascalCase test', () => {
  it('Should transform to Pascalcase', () => {
    const isAllSame = fp.every(
      fp.equals('FooBar'),
      fp.map(fp.pascalCase, [
        '__Foo_Bar__',
        'FOO BAR',
        'fooBar',
        'foo_bar',
        'foo-bar',
      ]),
    );
    expect(isAllSame).to.be.true;
  });
});

describe('# fp.isDatetimeString test', () => {
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
      'Mon, 06 Mar 2017 21:22:23 +0000',
    ];

    const invalidDatetimeStrings = ['21:22:23', '20210314'];

    expect(
      fp.every(fp.pipe(fp.isDatetimeString, fp.equals(true)), datetimeStrings),
    ).to.be.true;
    expect(
      fp.every(
        fp.pipe(fp.isDatetimeString, fp.equals(false)),
        invalidDatetimeStrings,
      ),
    ).to.be.true;
  });
});

describe('# fp.ap test', () => {
  it('Should return valid value', () => {
    const includesWithAp = fp.pipe(fp.includes, fp.ap('string'));
    const reduceWithAp = fp.pipe(fp.reduce, fp.ap(['f', 'o', 'o']));

    expect(includesWithAp('i')).to.be.true;
    expect(reduceWithAp((acc, v) => `${acc}${v}`, '')).to.eql('foo');
  });
});

describe('# fp.instanceOf test', () => {
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
    expect(fp.instanceOf(Car, auto)).to.be.true;
    expect(fp.instanceOf(Object, auto)).to.be.true;

    expect(fp.instanceOf(C, new C())).to.be.true;
    expect(fp.instanceOf(C, new D())).to.be.false;

    expect(fp.instanceOf(String, 'string')).to.be.false;
    expect(fp.instanceOf(String, new String('string'))).to.be.true;

    expect(fp.instanceOf(Object, {})).to.be.true;
  });
});

describe('# fp.ternary test', () => {
  const YorN = fp.ternary(null, 'Y', 'N');
  const paddingYorN = fp.ternary(
    fp.isTruthy,
    (a) => `${a}-Y`,
    (a) => `${a}-N`,
  );

  it('If argument is true, should return Y else return N', () => {
    expect(YorN(true)).to.eql('Y');
    expect(YorN(false)).to.eql('N');
    expect(fp.pipe(fp.isEmpty, YorN)(['a'])).to.eql('N');
    // evaluator가 함수가 아니면, evaluator를 boolean으로 변환해서 평가
    expect(
      fp.ternary(
        null,
        (a) => `y-${fp.isNotNil(a)}`,
        (a) => `n-${fp.isBoolean(a)}`,
        true,
      ),
    ).to.eql('y-true');
  });

  it('If arguement is not one of false, null, undefined, empty string, padding "-Y" else padding "-N"', () => {
    expect(paddingYorN('True')).to.eql('True-Y');

    expect(paddingYorN('')).to.eql('-N');
    expect(paddingYorN(null)).to.eql('null-N');
    expect(paddingYorN(undefined)).to.eql('undefined-N');
    expect(paddingYorN(false)).to.eql('false-N');
  });

  it('If argments has true, return Y else N', () => {
    const hasTrue = (args) => fp.includes(true, args);
    const ternaryByHandler = fp.ternary(
      hasTrue,
      () => 'Y',
      () => 'N',
    );
    const ternaryByValue = fp.ternary(hasTrue, 'y', 'n');

    expect(ternaryByHandler([false, 'N', null, undefined])).to.eql('N');
    expect(ternaryByHandler([true])).to.eql('Y');

    expect(ternaryByValue([false, 'N', null, undefined])).to.eql('n');
    expect(ternaryByValue([true])).to.eql('y');
    expect(fp.ternary(hasTrue, () => 'Y', 'n', [true])).to.eql('Y');
    expect(fp.ternary(hasTrue, () => 'Y', 'n', [false])).to.eql('n');
  });
});

describe('# fp.ifT test', () => {
  const getYifT = fp.ifT(fp.isEmpty, () => 'Y');
  const ifNotEmptyAppendString = fp.ifT(
    fp.isNotEmpty,
    (str) => `${str}-paddString`,
  );

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

describe('# fp.ifF test', () => {
  const ifNotEmptyN = fp.ifF(fp.isEmpty, () => 'N');
  const ifNotEmptyAppendString = fp.ifF(
    fp.isEmpty,
    (str) => `${str}-paddString`,
  );

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

describe('# fp.removeByIndex test', () => {
  const arr = [1, 2, 3];
  const secondRemoved = fp.removeByIndex(1, arr);

  it('Should argument array is not mutated', () => {
    expect(arr).to.eqls([1, 2, 3]);
  });

  it('argument index element Should be removed', () => {
    expect(secondRemoved).to.eqls([1, 3]);
  });
});

describe('# fp.removeLast test', () => {
  const arr = [1, 2, 3];
  const secondRemoved = fp.removeLast(arr);

  it('Should argument array is not mutated', () => {
    expect(arr).to.eqls([1, 2, 3]);
  });

  it('argument index element Should be removed', () => {
    expect(secondRemoved).to.eqls([1, 2]);
  });
});

describe('# fp.append test', () => {
  const arr = [1];
  const appended = fp.append(arr, 34);

  it('Should argument array is not mutated', () => {
    expect(arr).to.eqls([1]);
    expect(appended).to.eqls([1, 34]);
  });

  it('Should append argment', () => {
    expect(fp.append(arr, 2)).to.eqls([1, 2]);
    expect(fp.append(arr, [2, 3, 4])).to.eqls([1, 2, 3, 4]);
  });
});

describe('# fp.prepend test', () => {
  const arr = [1];

  it('Should argument array is not mutated', () => {
    fp.prepend(arr, 55);
    expect(arr).to.eqls([1]);
  });

  it('Should prepend argment', () => {
    expect(fp.prepend(arr, 2)).to.eqls([2, 1]);
    expect(fp.prepend(arr, [2, 3, 4])).to.eqls([2, 3, 4, 1]);
  });
});

describe('# fp.mapWithKey test', () => {
  const arr = [3, 4, 5];
  const getIdxs = fp.mapWithKey((v, i) => i);

  it('Should return indexs', () => {
    expect(getIdxs(arr)).to.eqls([0, 1, 2]);
  });

  it('Should return keys', () => {
    expect(getIdxs({ a: 1, b: 2 })).to.eqls(['a', 'b']);
  });
});

describe('# fp.reduceWithKey test', () => {
  const arr = [3, 4, 5];
  const getIdxs = fp.reduceWithKey((acc, v, i) => fp.concat(acc, i), []);

  it('Should return indexs', () => {
    expect(getIdxs(arr)).to.eqls([0, 1, 2]);
  });

  it('Should return keys', () => {
    expect(getIdxs({ a: 1, b: 2 })).to.eqls(['a', 'b']);
  });
});

describe('# fp.isFalsy test', () => {
  const falsies = [undefined, null, 0, -0, NaN, false, ''];
  const notFalsy = [[], '0', 'false', {}, () => {}];
  const composer = fp.pipe(fp.map(fp.isFalsy), fp.every(fp.equals(true)));

  it('Should return true', () => {
    expect(composer(falsies)).to.eqls(true);
  });

  it('Should return false', () => {
    expect(composer(notFalsy)).to.eqls(false);
  });
});

describe('# fp.isTruthy test', () => {
  const falsies = [undefined, null, 0, -0, NaN, false, ''];
  const notFalsy = [[], '0', 'false', {}, () => {}];

  const composer = fp.pipe(fp.map(fp.isTruthy), fp.every(fp.equals(false)));

  it('Should return true', () => {
    expect(composer(falsies)).to.eqls(true);
  });

  it('Should return false', () => {
    expect(composer(notFalsy)).to.eqls(false);
  });
});
