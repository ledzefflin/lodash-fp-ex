# lodash-fp-ex

## Overview

functions to add in lodash.mixin

## Install

```bash
$npm i lodash lodash-fp-ex
```

## Usage

```javascript
import fp from 'lodash/fp';
import lodashFpEx from 'lodash-fp-ex';

fp.mixin(lodashFpEx);
```

## APIs

All functions are curried except promisify.

[`mapASync`](#mapasync), [`filterAsync`](#filterasync), [`reduceAsync`](#reduceasync), [`findAsync`](#findasync), [`forEachAsync`](#foreachasync), [`promisify`](#promisify), [`then`](#then)(`andThen`), [`otherwise`](#otherwise)(`catch`), [`finally`](#finally), [`isPromise`](#ispromise), [`isNotEmpty`](#isnotempty), [`isNotNil`](#isnotnil), [`isJson`](#isjson), [`notEquals`](#notequals)(`isNotEqual`), [`isVal`](#isval)(`isPrimitive`), [`isRef`](#isref)(`isReference`), [`not`](#not), [`notIncludes`](#notincludes), [`toBool`](#tobool), [`deepFreeze`](#deepfreeze), [`key`](#key)(`keyByVal`), [`transformObjectKey`](#transformobjectkey), [`toCamelcase`](#tocamelcase)(`toCamelKey`), [`toSnakecase`](#tosnakecase)(`toSnakeKey`), [`pascalCase`](#pascalcase), [`isDatetimeString`](#isdatetimestring), [`ap`](#ap), [`instanceOf`](#instanceof), [`ternary`](#ternary), [`ifT`](#ift), [`ifF`](#iff), [`removeByIndex`](#removebyindex)(`removeByIdx`), [`removeLast`](#removelast), [`append`](#append), [`prepend`](#prepend), [`mapWithKey`](#mapwithkey)(`mapWithIdx`), [`reduceWithKey`](#reducewithkey)(`reduceWithIdx`), [`isFalsy`](#isfalsy), [`isTruthy`](#istruthy), [`delayAsync`](#delayasync)

### mapAsync

mapAsync works with Promise.all

```javascript
fp.mapAsync(thenableIteratee, collection);
```

```javascript
(async () => {
  const arr = [1, 2, 3, 4, 5];
  const obj = { a: 1, b: 2, c: 3 };
  const asyncMapper = (a) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(2 * a);
      }, 5);
    });

  // it takes about 5ms + alpha.
  const results = await fp.mapAsync(asyncMapper, arr);
  console.log(results);
  // => [2, 4, 6, 8, 10]
  const results1 = await fp.mapAsync(asyncMapper, obj);
  // => [2, 4, 6]
})();
```

### filterAsync

filterAsync works with Promise.all

```javascript
fp.filterAsync(thenablePredicate, collection);
```

```javascript
(async () => {
  const arr = [1, 2, 3, 4, 5];
  const asyncFilter = (a) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(!fp.equals(0, a % 2));
      }, 5);
    });

  // => it takes about 5ms + alpha.
  const results = await fp.filterAsync(asyncFilter, arr);
  console.log(fp.isEmpty(results));
  // => false
  console.log(results);
  // => [1,3,5]
})();
```

### reduceAsync

reduceAsync works different way from mapAsync and filterAsync, it works with Promise.resolve.
So if you more important function order than performance, reduceAsync is suitable.

```javascript
fp.reduceAsync(thenableIteratee, thenableAccumulator, collection);
```

```javascript
(async () => {
  const asyncMapper = (a) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(2 * a);
      }, 5);
    });

  // it takes about (5 * array length)ms + alpha.
  const results = await fp.reduceAsync(
    async (accP, v) => {
      const acc = await accP; // you should await acc first.
      const nextVal = await asyncMapper(v);
      acc.push(nextVal);

      return acc;
    },
    [],
    arr,
  );

  console.log(fp.isEmpty(result));
  // => false
  console.log(results);
  // => [2, 4, 6, 8, 10]
})();
```

### findAsync

```javascript
fp.findAsync(thenablePredicate, collection);
```

```javascript
(async () => {
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
  console.log(result);
  // => { name: 'hello', age: 22 }
})();
```

### forEachAsync

```javascript
fp.forEachAsync(thenableIteratee, collection);
```

```javascript
(async () => {
  const asyncMapper = (v, i) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(i > 0 ? v * i : v);
      }, 5);
    });

  const results = await fp.forEachAsync(
    async (v, i) => {
      const nextVal = await asyncMapper(v, i);
      return nextVal;
    },
    [1, 2, 3, 4, 5],
  );
  console.log(results);
  // => [1, 2, 6, 12, 20]
})();

(async () => {
  const asyncMapper1 = (v, k) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(`${v} ${k}`);
      });
    }, 5);

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
  console.log(results1);
  // => ['val key', 'world hello', 'stairway to heaven led zeppelin']
})();
```

### promisify

wrap argument with Promise\
**Note: Promisify is not curried to accept Function on first argument. Only when first argument is function, other arguments can be applied.**

```javascript
fp.promisify(value, functionArguments);
```

```javascript
(async () => {
  const result = await fp.promisify(128);
  const result1 = await fp.promisify((a, b) => a + b, 64, 64);
  const result2 = await fp.promisify(Promise.resolve(128));

  console.log(result, result1, result2);
  // => 128 128 128
})();
```

### then

**alias:** andThen

Make Promise.then work with \fp.pipe

```javascript
fp.then(successHandler, thenable);
```

```javascript
(async () => {
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

  console.log(result1, result2, result3);
  // => 128, 128, 128
})();
```

### otherwise

**alias:** catch

Make Promise.catch work with \fp.pipe.

```javascript
fp.otherwise(failureHandler, thenable);
```

```javascript
(async () => {
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
  const result1 = await composer(1);
  console.log(result1);
  // 1
  const result2 = await composer(2);
  console.log(result2);
  // => error 'wrong'
})();
```

### finally

Make Promise.finally work with \fp.pipe.

```javascript
fp.finally(handler, thenable);
```

```javascript
(async () => {
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
    fp.catch(fp.identity),
    fp.finally(() => (isLoading = false)),
  );

  await composer(1);
  console.log(isLoading);
  // => false
})();
```

### isPromise

Check argument is promise.

```javascript
fp.isPromise(value);
```

```javascript
(() => {
  const p = Promise.resolve(1);
  const fn = () => 1;
  const str = '1';
  const num = 1;

  console.log(fp.isPromise(p));
  // => true
  console.log(fp.isPromise(fn));
  // => false
  console.log(fp.isPromise(str));
  // => false
  console.log(fp.isPromise(num));
  // => false
  console.log(fp.isPromise(null));
  // => false
  console.log(fp.isPromise(undefined));
  // => false
})();
```

### isNotEmpty

opposite of lodash.isEmpty

```javascript
fp.isNotEmpty(value);
```

```javascript
(() => {
  console.log(fp.isNotEmpty([]));
  // => false
  console.log(fp.isNotEmpty({}));
  // => false
  console.log(fp.isNotEmpty(1));
  // => false
  console.log(fp.isNotEmpty(''));
  // => false
  console.log(fp.isNotEmpty('str'));
  // => true
  console.log(fp.isNotEmpty(null));
  // => false
  console.log(fp.isNotEmpty(undefined));
  // => false
})();
```

### isNotNil

opposite of lodash.isNil

```javascript
fp.isNotNil(value);
```

```javascript
(() => {
  console.log(fp.isNotNil(null));
  // => false
  console.log(fp.isNotNil(undefined));
  // => false

  console.log(fp.isNotNil(1));
  // => true
  console.log(fp.isNotNil({}));
  // => true
  console.log(fp.isNotNil(() => {}));
  // => true
})();
```

### isJson

Check argument is json string.

```javascript
fp.isJson(string);
```

```javascript
(() => {
  console.log(fp.isJson('{ "test": "value" }'));
  // => true

  console.log(fp.isJson('test'));
  // => false
  console.log({ test: 'value' });
  // => false
})();
```

### notEquals

**alias:** isNotEqual

opposite of lodash.isEqual

```javascript
fp.notEquals(value, other);
```

```javascript
(() => {
  console.log(fp.notEquals({ a: 1 }, { a: 1 }));
  // => false
  console.log(fp.notEquals([1, 2, 3], [1, 2, 3]));
  // => false

  console.log(fp.notEquals([1, 2, 3], [2, 3, 4]));
  // => true
  console.log(fp.notEquals('string', 'number'));
  // => true
  console.log(fp.notEquals(1, 2));
  // => true
})();
```

### isVal

**alias:** isPrimitive

Check agument is primitive type.

```javascript
fp.isVal(value);
```

```javascript
(() => {
  console.log(fp.isVal(null));
  // => true
  console.log(fp.isVal(undefined));
  // => true
  console.log(fp.isVal(false));
  // => true
  console.log(fp.isVal(1));
  // => true
  console.log(fp.isVal('string'));
  // => true

  console.log(fp.isVal([]));
  // => false
  console.log(fp.isVal({}));
  // => false
  console.log(fp.isVal(() => {}));
  // => false
})();
```

### isRef

**alias:** isReference

Check agument is reference type.

```javascript
fp.isRef(value);
```

```javascript
(() => {
  console.log(fp.isRef(null));
  // => false
  console.log(fp.isRef(undefined));
  // => false
  console.log(fp.isRef(false));
  // => false
  console.log(fp.isRef(1));
  // => false
  console.log(fp.isRef('string'));
  // => false

  console.log(fp.isRef([]));
  // => true
  console.log(fp.isRef({}));
  // => true
  console.log(fp.isRef(() => {}));
  // => true
})();
```

### not

Apply **!** operator to argument.

```javascript
fp.not(value);
```

```javascript
(() => {
  console.log(fp.not(false));
  // => true
  console.log(fp.not(0));
  // => true

  console.log(fp.not('string'));
  // => false
  console.log(fp.not(true));
  // => false
  console.log(fp.not(1));
  // => false
  console.log(fp.not({}));
  // => false
})();
```

### notIncludes

Opposite of lodash.includes

```javascript
fp.notIncludes(value, collection);
```

```javascript
(() => {
  console.log(fp.notIncludes(1, [1, 2, 3]));
  // => false
  console.log(fp.notIncludes('s', 'string'));
  // => false
  console.log(fp.notIncludes(1, { a: 1, b: 2 }));
  // => false
})();
```

### toBool

'true', 'false' string and other argument convert to Boolean type.

```javascript
fp.toBool(value);
```

```javascript
(() => {
  console.log(fp.toBool(1));
  // => true

  console.log(fp.toBool(0));
  // => false
  console.log(fp.toBool(null));
  // => false
  console.log(fp.toBool(undefined));
  // => false
})();
```

### deepFreeze

Reference type target freeze deeply.

```javascript
fp.deepFreeze(value);
```

```javascript
(() => {
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

  console.log(Object.isFrozen(shallowFrozen));
  // => true
  console.log(Object.isFrozen(shallowFrozen.a));
  // => false
  console.log(Object.isFrozen(shallowFrozen.a.b));
  // => false

  console.log(Object.isFrozen(deepFrozen));
  // => true
  console.log(Object.isFrozen(deepFrozen.a));
  // => true
  console.log(Object.isFrozen(deepFrozen.a.b));
  // => true
  console.log(Object.isFrozen(deepFrozen.a.c));
  // => true
})();
```

### key

**alias:** keyByVal

Get key string of object by value.

```javascript
fp.key(object, value);
```

```javascript
(() => {
  const obj = { a: 1 };
  const obj1 = { a: 1, b: 1, c: 1 };
  const obj2 = { a: { b: { k: 1 } } };

  console.log(fp.key(obj, 1));
  // => a
  console.log(fp.key(obj1, 1));
  // => c
  console.log(fp.key(obj2, { b: { k: 1 } }));
  // => a
  console.log(fp.key(obj2, { b: { k: 2 } }));
  // => undefined
})();
```

### transformObjectKey

Argument object key transform with case transform function.

```javascript
fp.transformObjectKey(caseTransformer, object);
```

```javascript
(() => {
  const obj = { obj_key: 1 };
  const obj1 = { 'obj-key': 1, obj_key: 2 };
  const nestedObj = {
    objKey: {
      nestedKey: {
        anotherKey: [3],
      },
    },
  };
  const kebabKeyObj = fp.transformObjectKey(fp.kebabCase, obj);
  const kebabKeyObj1 = fp.transformObjectKey(fp.kebabCase, nestedObj);
  console.log(kebabKeyObj);
  // => { obj-key: 1 }
  console.log(kebabKeyObj1);
  // => { 'obj-key': { 'nested-key': { 'another-key': [3] } } }
  console.log(fp.transformObjectKey(fp.kebabCase, obj1));
  // => obj-key already exist. duplicated property name is not supported.
})();
```

### toCamelcase

**alias:** toCamelKey

Same with transformObjectKey(lodash.camelCase)

```javascript
fp.toCamelcase(object);
```

```javascript
(() => {
  const obj = { obj_key: 1 };
  const obj1 = { 'obj-key': 1, obj_key: 2 };
  const camelKeyObj = fp.toCamelcase(obj);

  console.log(camelKeyObj);
  // => { objKey: 1 }
  console.log(fp.toCamelcase(obj1));
  // => objKey already exist. duplicated property name is not supported.
})();
```

### toSnakecase

**alias:** toSnakeKey

Same with transformObjectKey(lodash.snakeCase)

```javascript
fp.toSnakecase(object);
```

```javascript
(() => {
  const obj = { objKey: 1 };
  const obj1 = { objKey: 1, 'obj key': 2 };
  const snakeKeyObj = fp.toSnakecase(obj);

  console.log(snakeKeyObj);
  // => { obj_key: 1}
  console.log(fp.toSnakecase(obj1));
  // => obj_key already exist. duplicated property name is not supported.
})();
```

### pascalCase

Argument string transform to pascal case.

```javascript
fp.pascalCase(string);
```

```javascript
(() => {
  const pascals = fp.map(fp.pascalCase, [
    '__Foo_Bar__',
    'FOO BAR',
    'fooBar',
    'foo_bar',
    'foo-bar',
  ]);

  console.log(pascals);
  // => [FooBar, FooBar, FooBar, FooBar, FooBar]
})();
```

### isDatetimeString

Check argument string can parse with Date.parse function.

```javascript
fp.isDatetimeString(string);
```

```javascript
(() => {
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

  fp.every(fp.pipe(fp.isDatetimeString, fp.equals(true)), datetimeStrings);
  // => true
  fp.every(
    fp.pipe(fp.isDatetimeString, fp.equals(false)),
    invalidDatetimeStrings,
  );
  // => true
})();
```

### ap

Inspired by <https://github.com/monet/monet.js/blob/master/docs/MAYBE.md#ap>

```javascript
fp.ap(value, curriedFunction);
```

```javascript
(() => {
  const includesWithAp = fp.pipe(fp.includes, fp.ap('string'));
  const reduceWithAp = fp.pipe(fp.reduce, fp.ap(['f', 'o', 'o']));

  const isIncludeI = includesWithAp('i');
  console.log(isIncludeI);
  // => true

  const foo = reduceWithAp((acc, v) => `${acc}${v}`, '');
  console.log(foo);
  // => foo
})();
```

### instanceOf

```javascript
fp.instanceOf(value);
```

```javascript
(() => {
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

  console.log(fp.instanceOf(Car, auto));
  // => true
  console.log(fp.instanceOf(Object, auto));
  // => true
  console.log(fp.instanceOf(C, new C()));
  // => true
  console.log(fp.instanceOf(C, new D()));
  // => false

  console.log(fp.instanceOf(String, 'string'));
  // => false
  console.log(fp.instanceOf(String, new String('string')));
  // => true
  console.log(fp.instanceOf(Object, {}));
  // => true
})();
```

### ternary

```javascript
fp.ternary(evaluator, trueHandlerOrVal, falseHandlerOrVal, value);
```

```javascript
(() => {
  const YorN = fp.ternary(null, 'Y', 'N');
  const getYorN = fp.ternary(
    null,
    () => 'y',
    () => 'n',
  );
  const paddingYorN = fp.ternary(
    null,
    (a) => `${a}-Y`,
    (a) => `${a}-N`,
  );

  const hasTrue = (args) => fp.includes(true, args);
  const ternaryWithEvaluatorByHandler = fp.ternary(
    hasTrue,
    () => 'Y',
    () => 'N',
  );
  const ternaryWithEvaluatorByValue = fp.ternary(hasTrue, 'y', 'n');

  console.log(YorN(true));
  // => Y
  console.log(YorN(false));
  // => N
  console.log(fp.pipe(fp.isEmpty, YorN)(['a']));
  // => N
  console.log(fp.getYorN(true));
  // => y

  console.log(paddingYorN('True'));
  // => True-Y
  console.log(paddingYorN(false));
  // => false-N
  console.log(paddingYorN(''));
  // => -N
  console.log(paddingYorN(null));
  // null-N
  console.log(paddingYorN(undefined));
  // undefined-N

  console.log(ternaryWithEvaluatorByHandler([false, 'N', null, undefined]));
  // => N
  console.log(ternaryWithEvaluatorByHandler([true]));
  // => Y
  console.log(ternaryWithEvaluatorByValue([false, 'N', null, undefined]));
  // => n
  console.log(ternaryWithEvaluatorByValue([true]));
  // => y
})();
```

### ifT

If evaluator(value) return true, return trueHandler(value) result otherwise return value.

```javascript
fp.ifT(evaluator, trueHandler, value);
```

```javascript
(() => {
  const getYifT = fp.ifT(fp.isEmpty, () => 'Y');
  const ifNotEmptyAppendString = fp.ifT(
    fp.isNotEmpty,
    (str) => `${str}-paddString`,
  );

  console.log(getYifT([]));
  // => Y
  console.log(getYifT('str'));
  // => str
  console.log(ifNotEmptyAppendString('str'));
  // => 'str-paddString'
  console.log(ifNotEmptyAppendString(''));
  // =>
  console.log(ifNotEmptyAppendString([]));
  // => []
  console.log(ifNotEmptyAppendString(['s', 't', 'r']));
  // => s,t,r-paddString
})();
```

### ifF

If evaluator(value) return false, return falseHandler(value) result otherwise return value.

```javascript
fp.ifF(evaluator, falseHandler, value);
```

```javascript
(() => {
  const ifNotEmptyN = fp.ifF(fp.isEmpty, () => 'N');
  const ifNotEmptyAppendString = fp.ifF(
    fp.isEmpty,
    (str) => `${str}-paddString`,
  );

  console.log(ifNotEmptyN([]));
  // => []
  console.log(ifNotEmptyN('str'));
  // => N
  console.log(ifNotEmptyAppendString('str'));
  // => str-paddString
  console.log(ifNotEmptyAppendString(''));
  // =>
  console.log(ifNotEmptyAppendString([]));
  // => []
  console.log(ifNotEmptyAppendString(['s', 't', 'r']));
  // => s,t,r-paddString
})();
```

### removeByIndex

**alias:** removeByIdx

```javascript
fp.removeByIndex(index, array);
```

```javascript
(() => {
  const arr = [1, 2, 3];
  const secondRemoved = fp.removeByIndex(1, arr);

  // argument array should not be mutated.
  console.log(arr);
  // => [1, 2, 3]
  console.log(secondRemoved);
  // => [1, 3]
})();
```

### removeLast

```javascript
fp.removeLast(array);
```

```javascript
(() => {
  const arr = [1, 2, 3];
  const lastRemoved = fp.removeLast(arr);

  // argument array should not be mutated.
  console.log(arr);
  // => [1, 2, 3]
  console.log(lastRemoved);
  // => [1, 2]
})();
```

### append

**alias:** concat

```javascript
fp.append(array, [values]);
```

```javascript
(() => {
  const arr = [1];
  const appended = fp.append(arr, 34);

  // argument array should not be mutated.
  console.log(arr);
  // => [1]
  console.log(appended);
  // => [1, 34]
  console.log(fp.append(arr, [2, 3, 4]));
  // => [1, 2, 3, 4]
})();
```

### prepend

```javascript
fp.prepend(array, [values]);
```

```javascript
(() => {
  const arr = [1];
  const prepended = fp.prepend(arr, 34);

  // argument array should not be mutated.
  console.log(arr);
  // => [1]
  console.log(prepended);
  // => [34, 1]
  console.log(fp.prepend(arr, [2, 3, 4]));
  // => [2, 3, 4, 1]
})();
```

### mapWithKey

**alias:** mapWithIdx

Same with \fp.map.convert({ cap: false})

```javascript
fp.mapWithKey(iteratee, collection);
```

```javascript
(() => {
  const arr = [3, 4, 5];
  const getIdxs = fp.mapWithKey((v, i) => i);

  console.log(getIdxs(arr));
  // => [0, 1, 2]
  console.log(getIdxs({ a: 1, b: 2 }));
  // => ['a', 'b']
})();
```

### reduceWithKey

**alias:** reduceWithIdx

Same with \fp.reduce.convert({ cap: false })

```javascript
fp.reduceWithKey(iteratee, accumulator, collection);
```

```javascript
(() => {
  const arr = [3, 4, 5];
  const getIdxs = fp.reduceWithKey((acc, v, i) => fp.concat(acc, i), []);

  console.log(getIdxs(arr));
  // => [0, 1, 2]
  console.log(getIdxs({ a: 1, b: 2 }));
  // => ['a', 'b']
})();
```

### isFalsy

```javascript
fp.isFalsy(value);
```

```javascript
() => {
  const falsies = [undefined, null, 0, -0, NaN, false, ''];
  const notFalsies = [[], '0', 'false', {}, () => {}];
  const composer = fp.pipe(fp.map(fp.isFalsy), fp.every(fp.equals(true)));

  composer(falses);
  // => true
  composer(notFalsies);
  // => false
};
```

### isTruthy

```javascript
fp.isTruthy(value);
```

```javascript
(() => {
  const falsies = [undefined, null, 0, -0, NaN, false, ''];
  const notFalsies = [[], '0', 'false', {}, () => {}];

  const composer = fp.pipe(fp.map(fp.isTruthy), fp.every(fp.equals(false)));

  composer(falses);
  // => true
  composer(notFalsies);
  // => false
})();
```

## delayAsync

```js
(async () => {
  await fp.delayAsync(300); // 300ms delay
})();
```
