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

```ts
type MapAsync = F.Curry<
  <T, K extends keyof T, R>(
    asyncMapper: (arg: T[K], key: K) => Promise<R>,
    collection: T,
  ) => Promise<R[]>
>;
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
  // => [2, 4, 6, 8, 10]
  const results1 = await fp.mapAsync(asyncMapper, obj);
  // => [2, 4, 6]
})();
```

### filterAsync

filterAsync works with Promise.all

```ts
type FilterAsync = F.Curry<
  <T, K extends keyof T, R>(
    asyncFilter: (arg: T[K], key: K) => Promise<boolean>,
    collection: T,
  ) => Promise<R[]>
>;
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
  // => [1,3,5]
})();
```

### reduceAsync

reduceAsync works different way from mapAsync and filterAsync, it works with Promise.resolve.
So if you more important function order than performance, reduceAsync is suitable.

```ts
type ReduceAsync = F.Curry<
  <T, K extends keyof T>(
    asyncFn: (acc: unknown, arg: T[K], key: K) => Promise<unknown>,
    initAcc: Promise<unknown> | unknown,
    collection: T,
  ) => Promise<unknown>
>;
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
  // => [2, 4, 6, 8, 10]
})();
```

### findAsync

```ts
type FindAsync = F.Curry<
  <T, K extends keyof T, R>(
    asyncFilter: (arg: T[K], key: K) => Promise<boolean>,
    collection: T,
  ) => Promise<R>
>;
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

```ts
type ForEachAsync = F.Curry<
  <T, K extends keyof T, R>(
    callbackAsync: (value: T[K], key: K) => Promise<R>,
    collection: T,
  ) => Promise<R[]>
>;
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
  // => ['val key', 'world hello', 'stairway to heaven led zeppelin']
})();
```

### promisify

wrap argument with Promise\
**Note: Promisify is not curried to accept Function on first argument. Only when first argument is function, other arguments can be applied.**

```ts
type Promisify = (a: any, ...args: any[]): Promise<any>
```

```javascript
(async () => {
  const result = await fp.promisify(128);
  // => 128
  const result1 = await fp.promisify((a, b) => a + b, 64, 64);
  // => 128
  const result2 = await fp.promisify(Promise.resolve(128));
  // => 128
})();
```

### then

**alias:** andThen

Make Promise.then work with \fp.pipe

```ts
type Then = F.Curry<
  (fn: (response: any) => any, thenable: Promise<unknown>) => Promise<any>
>;
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
  // => 128
  const result2 = await fp.then(fp.identity, p(64));
  // => 128
  const result3 = await fp.pipe(
    p,
    fp.then((x) => x / 2),
  )(128);
  // => 128
})();
```

### otherwise

**alias:** catch

Make Promise.catch work with \fp.pipe.

```ts
type Totherwise = F.Curry<
  (
    failureHandler: (error: Error | any) => never | any,
    thenable: Promise<Error | any>,
  ) => Promise<never | any>
>;
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
  // => 1
  const result2 = await composer(2);
  // => error 'wrong'
})();
```

### finally

Make Promise.finally work with \fp.pipe.

```ts
type Finally = F.Curry<
  (callback: (...args: any[]) => any, thenable: Promise<any>) => Promise<any>
>;
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
  // => false
})();
```

### isPromise

Check argument is promise.

```ts
type IsPromise = <T>(x: T): boolean
```

```javascript
(() => {
  const p = Promise.resolve(1);
  const fn = () => 1;
  const str = '1';
  const num = 1;

  fp.isPromise(p);
  // => true
  fp.isPromise(fn);
  // => false
  fp.isPromise(str);
  // => false
  fp.isPromise(num);
  // => false
  fp.isPromise(null);
  // => false
  fp.isPromise(undefined);
  // => false
})();
```

### isNotEmpty

opposite of lodash.isEmpty

```ts
type IsNotEmpty = (a: unknown) => boolean;
```

```javascript
(() => {
  fp.isNotEmpty([]);
  // => false
  fp.isNotEmpty({});
  // => false
  fp.isNotEmpty(1);
  // => false
  fp.isNotEmpty(''));
  // => false
  fp.isNotEmpty('str');
  // => true
  fp.isNotEmpty(null);
  // => false
  fp.isNotEmpty(undefined);
  // => false
})();
```

### isNotNil

opposite of lodash.isNil

```ts
type IsNotNil = (arg: unknown) => boolean;
```

```javascript
(() => {
  fp.isNotNil(null);
  // => false
  fp.isNotNil(undefined);
  // => false
  fp.isNotNil(1);
  // => true
  fp.isNotNil({});
  // => true
  fp.isNotNil(() => {});
  // => true
})();
```

### isJson

Check argument is json string.

```ts
type IsJson = (arg: unknown) => boolean;
```

```javascript
(() => {
  fp.isJson('{ "test": "value" }');
  // => true
  fp.isJson('test');
  // => false
  fp.isJson({ test: 'value' });
  // => false
})();
```

### notEquals

**alias:** isNotEqual

opposite of lodash.isEqual

```ts
type NotEquals = F.Curry<(a: unknown, b: unknown) => boolean>;
```

```javascript
(() => {
  fp.notEquals({ a: 1 }, { a: 1 });
  // => false
  fp.notEquals([1, 2, 3], [1, 2, 3]);
  // => false
  fp.notEquals([1, 2, 3], [2, 3, 4]);
  // => true
  fp.notEquals('string', 'number');
  // => true
  fp.notEquals(1, 2);
  // => true
})();
```

### isVal

**alias:** isPrimitive

Check agument is primitive type.

```ts
type IsVal = (arg: unknown) => boolean;
```

```javascript
(() => {
  fp.isVal(null);
  // => true
  fp.isVal(undefined);
  // => true
  fp.isVal(false);
  // => true
  fp.isVal(1);
  // => true
  fp.isVal('string');
  // => true

  fp.isVal([]);
  // => false
  fp.isVal({});
  // => false
  fp.isVal(() => {});
  // => false
})();
```

### isRef

**alias:** isReference

Check agument is reference type.

```ts
type IsRef = (arg: unknown) => boolean;
```

```javascript
(() => {
  fp.isRef(null);
  // => false
  fp.isRef(undefined);
  // => false
  fp.isRef(false);
  // => false
  fp.isRef(1);
  // => false
  fp.isRef('string');
  // => false

  fp.isRef([]);
  // => true
  fp.isRef({});
  // => true
  fp.isRef(() => {});
  // => true
})();
```

### not

Apply **!** operator to argument.

```ts
type Not = <T>(a: T) => boolean;
```

```javascript
(() => {
  fp.not(false);
  // => true
  fp.not(0);
  // => true

  fp.not('string');
  // => false
  fp.not(true);
  // => false
  fp.not(1);
  // => false
  fp.not({});
  // => false
})();
```

### notIncludes

Opposite of lodash.includes

```ts
type NotIncludes = F.Curry<
  (
    arg: unknown,
    targetArray: unknown[] | Record<string, unknown> | string,
  ) => boolean
>;
```

```javascript
(() => {
  fp.notIncludes(1, [1, 2, 3]);
  // => false
  fp.notIncludes('s', 'string');
  // => false
  fp.notIncludes(1, { a: 1, b: 2 });
  // => false
})();
```

### toBool

'true', 'false' string and other argument convert to Boolean type.

```ts
type ToBool = (arg: unknown) => boolean;
```

```javascript
(() => {
  fp.toBool(1);
  // => true

  fp.toBool(0);
  // => false
  fp.toBool(null);
  // => false
  fp.toBool(undefined);
  // => false
})();
```

### deepFreeze

Reference type target freeze deeply.

```ts
type DeepFreeze = (obj: Record<string, unknown>) => Record<string, unknown>;
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

  Object.isFrozen(shallowFrozen);
  // => true
  Object.isFrozen(shallowFrozen.a);
  // => false
  Object.isFrozen(shallowFrozen.a.b);
  // => false

  Object.isFrozen(deepFrozen);
  // => true
  Object.isFrozen(deepFrozen.a);
  // => true
  Object.isFrozen(deepFrozen.a.b);
  // => true
  Object.isFrozen(deepFrozen.a.c);
  // => true
})();
```

### key

**alias:** keyByVal

Get key string of object by value.

```ts
type Key = F.Curry<(obj: Record<string, unknown>, value: unknown) => string>;
```

```javascript
(() => {
  const obj = { a: 1 };
  const obj1 = { a: 1, b: 1, c: 1 };
  const obj2 = { a: { b: { k: 1 } } };

  fp.key(obj, 1);
  // => a
  fp.key(obj1, 1);
  // => c
  fp.key(obj2, { b: { k: 1 } });
  // => a
  fp.key(obj2, { b: { k: 2 } });
  // => undefined
})();
```

### transformObjectKey

Argument object key transform with case transform function.

```ts
type TransformObjectKey = F.Curry<
  (
    transformFn: (orignStr: string) => string,
    obj: Record<string, unknown>,
  ) => Record<string, unknown>
>;
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
  // => { obj-key: 1 }
  const kebabKeyObj1 = fp.transformObjectKey(fp.kebabCase, nestedObj);
  // => { 'obj-key': { 'nested-key': { 'another-key': [3] } } }
  fp.transformObjectKey(fp.kebabCase, obj1);
  // => obj-key already exist. duplicated property name is not supported.
})();
```

### toCamelcase

**alias:** toCamelKey

Same with transformObjectKey(lodash.camelCase)

```ts
type ToCamelcase = (obj: Record<string, unknown>) => Record<string, unknown>;
```

```javascript
(() => {
  const obj = { obj_key: 1 };
  const obj1 = { 'obj-key': 1, obj_key: 2 };
  const camelKeyObj = fp.toCamelcase(obj);
  // => { objKey: 1 }
  fp.toCamelcase(obj1);
  // => objKey already exist. duplicated property name is not supported.
})();
```

### toSnakecase

**alias:** toSnakeKey

Same with transformObjectKey(lodash.snakeCase)

```ts
type ToSnakecase = (obj: Record<string, unknown>) => Record<string, unknown>;
```

```javascript
(() => {
  const obj = { objKey: 1 };
  const obj1 = { objKey: 1, 'obj key': 2 };
  const snakeKeyObj = fp.toSnakecase(obj);
  // => { obj_key: 1}

  fp.toSnakecase(obj1);
  // => obj_key already exist. duplicated property name is not supported.
})();
```

### pascalCase

Argument string transform to pascal case.

```ts
type PascalCase = (string) => string;
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
  // => [FooBar, FooBar, FooBar, FooBar, FooBar]
})();
```

### isDatetimeString

Check argument string can parse with Date.parse function.

```ts
type IsDatetimeString = (dateStr: string) => boolean;
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

```ts
type Ap = F.Curry<(arg: unknown, curreid: Function) => unknown>;
```

```javascript
(() => {
  const includesWithAp = fp.pipe(fp.includes, fp.ap('string'));
  const reduceWithAp = fp.pipe(fp.reduce, fp.ap(['f', 'o', 'o']));

  const isIncludeI = includesWithAp('i');
  // => true

  const foo = reduceWithAp((acc, v) => `${acc}${v}`, '');
  // => foo
})();
```

### instanceOf

```ts
type InstanceOf = F.Curry<<T>(t: unknown, arg: T) => boolean>;
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

  fp.instanceOf(Car, auto);
  // => true
  fp.instanceOf(Object, auto);
  // => true
  fp.instanceOf(C, new C());
  // => true
  fp.instanceOf(C, new D());
  // => false

  fp.instanceOf(String, 'string');
  // => false
  fp.instanceOf(String, new String('string'));
  // => true
  fp.instanceOf(Object, {});
  // => true
})();
```

### ternary

```ts
type Ternary = F.Curry<
  <T>(
    evaluator: (arg: T) => boolean | unknown,
    trueHandler: (arg: T) => unknown,
    falseHandler: (arg: T) => unknown,
    arg: T,
  ) => unknown
>;
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

  YorN(true);
  // => Y
  YorN(false);
  // => N
  fp.pipe(fp.isEmpty, YorN)(['a']);
  // => N
  fp.getYorN(true);
  // => y

  paddingYorN('True');
  // => True-Y
  paddingYorN(false);
  // => false-N
  paddingYorN('');
  // => -N
  paddingYorN(null);
  // null-N
  paddingYorN(undefined);
  // undefined-N

  ternaryWithEvaluatorByHandler([false, 'N', null, undefined]);
  // => N
  ternaryWithEvaluatorByHandler([true]);
  // => Y
  ternaryWithEvaluatorByValue([false, 'N', null, undefined]);
  // => n
  ternaryWithEvaluatorByValue([true]);
  // => y
})();
```

### ifT

If evaluator(value) return true, return trueHandler(value) result otherwise return value.

```ts
type IfT = F.Curry<
  <T, R>(
    evaluator: (arg: T) => boolean | boolean,
    trueHandler: (arg: T) => R | R,
    arg: T,
  ) => T | R
>;
```

```javascript
(() => {
  const getYifT = fp.ifT(fp.isEmpty, () => 'Y');
  const ifNotEmptyAppendString = fp.ifT(
    fp.isNotEmpty,
    (str) => `${str}-paddString`,
  );

  getYifT([]);
  // => Y
  getYifT('str');
  // => str
  ifNotEmptyAppendString('str');
  // => 'str-paddString'
  ifNotEmptyAppendString('');
  // =>
  ifNotEmptyAppendString([]);
  // => []
  ifNotEmptyAppendString(['s', 't', 'r']);
  // => s,t,r-paddString
})();
```

### ifF

If evaluator(value) return false, return falseHandler(value) result otherwise return value.

```ts
type IfF = F.Curry<
  <T, R>(
    evaluator: (arg: T) => boolean | boolean,
    falseHandler: (arg: T) => R | R,
    arg: T,
  ) => T | R
>;
```

```javascript
(() => {
  const ifNotEmptyN = fp.ifF(fp.isEmpty, () => 'N');
  const ifNotEmptyAppendString = fp.ifF(
    fp.isEmpty,
    (str) => `${str}-paddString`,
  );

  ifNotEmptyN([]);
  // => []
  ifNotEmptyN('str');
  // => N
  ifNotEmptyAppendString('str');
  // => str-paddString
  ifNotEmptyAppendString('');
  // =>
  ifNotEmptyAppendString([]);
  // => []
  ifNotEmptyAppendString(['s', 't', 'r']);
  // => s,t,r-paddString
})();
```

### removeByIndex

**alias:** removeByIdx

```ts
type RemoveByIndex = F.Curry<
  <R>(index: number | string, targetArray: R[]) => R[]
>;
```

```javascript
(() => {
  const arr = [1, 2, 3];
  const secondRemoved = fp.removeByIndex(1, arr);

  // argument array should not be mutated.
  arr;
  // => [1, 2, 3]
  secondRemoved;
  // => [1, 3]
})();
```

### removeLast

```ts
type RemoveLast = (target: string | unknown[]) => string | unknown[];
```

```javascript
(() => {
  const arr = [1, 2, 3];
  const lastRemoved = fp.removeLast(arr);

  // argument array should not be mutated.
  arr;
  // => [1, 2, 3]
  lastRemoved;
  // => [1, 2]
})();
```

### append

**alias:** concat

```ts
type Append = F.Curry<<T>(arr: T[], arg: T | T[]) => T[]>;
```

```javascript
(() => {
  const arr = [1];
  const appended = fp.append(arr, 34);

  // argument array should not be mutated.
  arr;
  // => [1]
  appended;
  // => [1, 34]
  fp.append(arr, [2, 3, 4]);
  // => [1, 2, 3, 4]
})();
```

### prepend

```ts
type Prepend = F.Curry<<T>(arr: T[], arg: T | T[]) => T[]>;
```

```javascript
(() => {
  const arr = [1];
  const prepended = fp.prepend(arr, 34);

  // argument array should not be mutated.
  arr;
  // => [1]
  prepended;
  // => [34, 1]
  fp.prepend(arr, [2, 3, 4]);
  // => [2, 3, 4, 1]
})();
```

### mapWithKey

**alias:** mapWithIdx

Same with \fp.map.convert({ cap: false})

```ts
type MapWithKey = F.Curry<
  <T, K extends keyof T, R>(
    iteratee: (value: T[K], key: K) => R,
    collection: T,
  ) => R[]
>;
```

```javascript
(() => {
  const arr = [3, 4, 5];
  const getIdxs = fp.mapWithKey((v, i) => i);

  getIdxs(arr);
  // => [0, 1, 2]
  getIdxs({ a: 1, b: 2 });
  // => ['a', 'b']
})();
```

### reduceWithKey

**alias:** reduceWithIdx

Same with \fp.reduce.convert({ cap: false })

```ts
type ReduceWithKey = F.Curry<
  <T, K extends keyof T, R>(
    iteratee: (acc: R, value: T[K], key: K) => R,
    acc: R,
    collection: T,
  ) => R
>;
```

```javascript
(() => {
  const arr = [3, 4, 5];
  const getIdxs = fp.reduceWithKey((acc, v, i) => fp.concat(acc, i), []);

  getIdxs(arr);
  // => [0, 1, 2]
  getIdxs({ a: 1, b: 2 });
  // => ['a', 'b']
})();
```

### isFalsy

```ts
type isFalsy = (arg: unknown) => boolean;
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

```ts
type IsTruthy = (arg: unknown) => boolean;
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

### delayAsync

```ts
type DelayAsync = (ms: number) => Promise<void>;
```

```js
(async () => {
  await fp.delayAsync(300); // 300ms delay
})();
```
