# lodash-fp-ex

## Overview
functions to add in lodash-mixin

## Install
```bash
$npm i lodash lodash-fp-ex
```

## Usage 
```javascript
import _ from 'lodash/fp';
import lodashFpEx from 'lodash-fp-ex'

_.mixin(lodashFpEx);
```


## APIs
All functions are curried except promisify.

* `mapASync`
* `filterAsync`
* `reduceAsync`
* `findAsync`
* `promisify`
* `then`
  * `andThen`
* `otherwise`
* `finally`

* `isPromise`
* `isNotEmpty`
* `isNotNil`
* `isJson`
* `notEquals`
  * `isNotEqual`
* `isVal`
  * `isPrimitive`
* `isRef`
  * `isReference`
* `not`
* `notIncludes`
* `toBool`

* `deepFreeze`
* `key`
  * `keyByVal`
  
* `transformObjectKey`
* `toCamelcase`
  * `toCamelKey`
* `toSnakecase`
  * `toSnakeKey`
* `pascalCase`
* `isDatetimeString`

* `ap`
* `instanceOf`

* `ternary`
* `ifT`
* `ifF`
  
* `removeByIndex`
  * `removeByIdx`
* `removeLast`
* `append`
* `prepend`

* `mapWithKey`
  * `mapWithIdx`
* `reduceWithKey`
  * `reduceWithIdx`

### mapAsync
mapAsync works with Promise.all
```
_.mapAsync(thenableIteratee, collection)
```
```javascript
(async () => {
  const arr = [1, 2, 3, 4, 5];
  const obj = { a: 1, b: 2, c: 3 }
  const asyncMapper = (a) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(2 * a);
      }, 5);
    });

  // it takes about 5ms + alpha.
  const results = await _.mapAsync(asyncMapper, arr);
  console.log(results);
  // => [2, 4, 6, 8, 10]
  const results1 = await _.mapAsync(asyncMapper, obj);
  // => [2, 4, 6]
})();
```

### filterAsync
filterAsync works with Promise.all
```
_.filterAsync(thenablePredicate, collection)
```

```javascript
(async () => {
  const arr = [1, 2, 3, 4, 5];
  const asyncFilter = (a) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(!_.equals(0, a % 2));
      }, 5);
    });
  
  // => it takes about 5ms + alpha.
  const results = await _.filterAsync(asyncFilter, arr);
  console.log(_.isEmpty(results));
  // => false
  console.log(results);
  // => [1,3,5]
})();
```

### reduceAsync
reduceAsync works different way from mapAsync, filterAsync.   
reduceAsync works with Promise.resolve.    
So if you more important function order, reduceAsync will be suitable.
```
_.reduceAsync(thenableIteratee, thenableAccumulator, collection)
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
  const results = await _.reduceAsync(
    async (accP, v) => {
      const acc = await accP; // you should await acc first.
      const nextVal = await asyncMapper(v);
      acc.push(nextVal);

      return acc;
    },
    [],
    arr
  );

  console.log(_.isEmpty(result));
  // => false
  console.log(results);
  // => [2, 4, 6, 8, 10]
})();

```

### findAsync
```
_.findAsync(thenablePredicate, collection)
```
```javascript
(async () => {
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
  console.log(result);
  // => { name: 'hello', age: 22 }
})();
```

### promisify
wrap argument with Promise   
**Note: _.promisify is not curried to accept Function on first argument. functionArguments can be applied only case that first argument is function.**
```
_.promisify(value, functionArguments)
```
```javascript
(async () => {
  const result = await _.promisify(128);
  const result1 = await _.promisify((a, b) => a + b, 64, 64);
  const result2 = await _.promisify(Promise.resolve(128));

  console.log(result, result1, result2);
  // => 128 128 128
})();
```

### then 
**alias:** andThen   
Make Promise.then work with _.pipe
```
_.then(successHandler, thenable)
```
```javascript
(async () => {
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

  console.log(result1, result2, result3);
  // => 128, 128, 128
})();
```

### otherwise
Make Promise.catch work with _.pipe.
```
_.otherwise(failureHandler, thenable)
```
```javascript
(async () => {
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
  const result1 = await composer(1);
  console.log(result1);
  // 1
  const result2 = await composer(2);
  console.log(result2);
  // => error 'wrong'
})();
```

### finally
Make Promise.finally work with _.pipe.
```
_.finally(handler, thenable)
```
```javascript
(async () => {
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

  await composer(1);
  console.log(isLoading);
  // => false
})();
```
### isPromise
Check argument is promise.
```
_.isPromise(value)
```
```javascript
(() => {
  const p = Promise.resolve(1);
  const fn = () => 1;
  const str = '1';
  const num = 1;

  console.log(_.isPromise(p));
  // => true
  console.log(_.isPromise(fn));
  // => false
  console.log(_.isPromise(str));
  // => false
  console.log(_.isPromise(num));
  // => false
  console.log(_.isPromise(null));
  // => false
  console.log(_.isPromise(undefined));
  // => false
})();
```

### isNotEmpty
opposite of _.isEmpty
```
_.isNotEmpty(value)
```
```javascript
(() => {
  console.log(_.isNotEmpty([]));
  // => false
  console.log(_.isNotEmpty({}));
  // => false
  console.log(_.isNotEmpty(1));
  // => false
  console.log(_.isNotEmpty(''));
  // => false
  console.log(_.isNotEmpty('str'));
  // => true
  console.log(_.isNotEmpty(null));
  // => false
  console.log(_.isNotEmpty(undefined));
  // => false
})()
```

### isNotNil
opposite of _.isNil
```
_.isNotNil(value)
```
```javascript
(() => {
  console.log(_.isNotNil(null));
  // => false
  console.log(_.isNotNil(undefined));
  // => false

  console.log(_.isNotNil(1));  
  // => true
  console.log(_.isNotNil({}));
  // => true
  console.log(_.isNotNil(() => {}));
  // => true
})()
```
### isJson
Check argument is json string.
```
_.isJson(string)
```
```javascript
(() => {
  console.log(_.isJson('{ "test": "value" }'));
  // => true

  console.log(_.isJson('test'));
  // => false
  console.log({ test: 'value' });
  // => false
})()
```

### notEquals
**alias:** isNotEqual   
opposite of _.isEqual
```
_.notEquals(value, other)
```
```javascript
(() => {
  console.log(_.notEquals({ a: 1}, {a: 1}));
  // => false
  console.log(_.notEquals([1,2,3], [1,2,3]));
  // => false

  console.log(_.notEquals([1,2,3], [2,3,4]));
  // => true
  console.log(_.notEquals('string', 'number'));
  // => true
  console.log(_.notEquals(1, 2));
  // => true
})();
```

### isVal 
**alias:** isPrimitive   
Check agument is primitive type.
```
_.isVal(value)
```
```javascript
(() => {
  console.log(_.isVal(null));
  // => true
  console.log(_.isVal(undefined));
  // => true
  console.log(_.isVal(false));
  // => true
  console.log(_.isVal(1));
  // => true
  console.log(_.isVal('string'));
  // => true

  console.log(_.isVal([]));
  // => false
  console.log(_.isVal({}));
  // => false
  console.log(_.isVal(() => {}));
  // => false
})();
```

### isRef 
**alias:** isReference   
Check agument is reference type.
```
_.isRef(value)
```
```javascript
(() => {
  console.log(_.isRef(null));
  // => false
  console.log(_.isRef(undefined));
  // => false
  console.log(_.isRef(false));
  // => false
  console.log(_.isRef(1));
  // => false
  console.log(_.isRef('string'));
  // => false
  
  console.log(_.isRef([]));
  // => true
  console.log(_.isRef({}));
  // => true
  console.log(_.isRef(() => {}));
  // => true
})();
```

### not
```
_.not(value)
```
```javascript
(() => {
  console.log(_.not(false));
  // => true
  console.log(_.not(0));
  // => true
  
  console.log(_.not('string'));
  // => false
  console.log(_.not(true));
  // => false
  console.log(_.not(1));
  // => false
  console.log(_.not({}));
  // => false
})();
```

### notIncludes
```
_.notIncludes(value, collection)
```
```javascript
(() => {
  console.log(_.notIncludes(1, [1,2,3]));
  // => false
  console.log(_.notIncludes('s', 'string'));
  // => false
  console.log(_.notIncludes(1, { a: 1, b: 2 }));
  // => false
})();
```

### toBool
```
_.toBool(value)
```
```javascript
(() => {
  console.log(_.toBool(1));
  // => true
  console.log(_.toBool('true'));
  // => true

  console.log(_.toBool(0));
  // => false
  console.log(_.toBool(null));
  // => false
  console.log(_.toBool(undefined));
  // => false
  console.log(_.toBool('false'));
  // => false
})();
```

### deepFreeze
Freeze reference type target deeply.
```
_.deepFreeze(value)
```
```javascript
(() => {
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
```
_.key(object)
```
```javascript
(() => {
  const obj = { a: 1 };
  const obj1 = { a: 1, b: 1, c: 1 };

  console.log(_.key(obj, 1));
  // => a
  console.log(_.key(obj1, 1));
  // => c
})();
```

### transformObjectKey
Transform argument object key with argument case transform function
```
_.transformObjectKey(caseTransformer, object)
```
```javascript
(() => {
  const obj = { obj_key: 1 };
  const obj1 = { 'obj-key': 1, obj_key: 2 };
  const nestedObj = {
    objKey: {
      nestedKey: {
        anotherKey: [3]
      }
    }
  };
  const kebabKeyObj = _.transformObjectKey(_.kebabCase, obj);
  const kebabKeyObj1 = _.transformObjectKey(_.kebabCase, nestedObj);
  console.log(kebabKeyObj);
  // => { obj-key: 1 }
  console.log(kebabKeyObj1);
  // => { 'obj-key': { 'nested-key': { 'another-key': [3] } } }
  console.log(_.transformObjectKey(_.kebabCase, obj1));
  // => obj-key already exist. duplicated property name is not supported.
})();
```

### _.toCamelKey 
**alias:** toCamelcase   
Same with transformObjectKey(_.camelCase)
```
_.toCamelKey(object)
```
```javascript
(() => {
  const obj = { obj_key: 1 };
  const obj1 = { 'obj-key': 1, obj_key: 2 };
  const camelKeyObj = _.toCamelKey(obj);
  
  console.log(camelKeyObj);
  // => { objKey: 1 }
  console.log(_.camelKey(obj1));
  // => objKey already exist. duplicated property name is not supported.
})();
```

### _.toSnakeKey 
**alias:** toSnakecase   
Same with transformObjectKey(_.snakeCase)
```
_.toSnakeKey(object)
```
```javascript
(() => {
  const obj = { objKey: 1 };
  const obj1 = { objKey: 1, 'obj key': 2 };
  const snakeKeyObj = _.toSnakeKey(obj);

  console.log(snakeKeyObj);
  // => { obj_key: 1}
  console.log(_.snakeKey(obj1));
  // => obj_key already exist. duplicated property name is not supported.
})();
```
### _.pascalCase
Argument string transform to pascal case.
```
_.pascalCase(string)
```
```javascript
(() => {
  const pascals = _.map(_.pascalCase, ['__Foo_Bar__', 'FOO BAR', 'fooBar', 'foo_bar', 'foo-bar']);
  
  console.log(pascals);
  // => [FooBar, FooBar, FooBar, FooBar, FooBar]
})();
```

### _.isDatetimeString
Check argument string can parse with Date.parse function.
```
_.isDatetimeString(string)
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
    'Mon, 06 Mar 2017 21:22:23 +0000'
  ];

  const invalidDatetimeStrings = ['21:22:23', '20210314'];

  _.every(_.pipe(_.isDatetimeString, _.equals(true)), datetimeStrings);
  // => true
  _.every(_.pipe(_.isDatetimeString, _.equals(false)), invalidDatetimeStrings);
  // => true
})();
```

### _.ap
Inspired by https://github.com/monet/monet.js/blob/master/docs/MAYBE.md#ap
```
_.ap(value, curriedFunction)
```
```javascript
(() => {
  const includesWithAp = _.pipe(_.includes, _.ap('string'));
  const reduceWithAp = _.pipe(_.reduce, _.ap(['f', 'o', 'o']));
  
  const isIncludeI = includesWithAp('i');
  console.log(isIncludeI);
  // => true
  
  const foo = reduceWithAp((acc, v) => `${acc}${v}`, '');
  console.log(foo);
  // => foo
})();
```

### _.instanceOf
```
_.instanceOf(value)
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

  console.log(_.instanceOf(Car, auto));
  // => true
  console.log(_.instanceOf(Object, auto));
  // => true
  console.log(_.instanceOf(C, new C()));
  // => true
  console.log(_.instanceOf(C, new D()));
  // => false

  console.log(_.instanceOf(String, 'string'));
  // => false
  console.log(_.instanceOf(String, new String('string')));
  // => true
  console.log(_.instanceOf(Object, {}));
  // => true
})();
```

### _.ternary
```
_.ternary(trueHandlerOrVal, falseHandlerOrVal, value)
```
```javascript
(() => {
  const YorN = _.ternary('Y', 'N');

  console.log(YorN(true));
  // => Y
  console.log(YorN(false));
  // => N
  console.log(_.pipe(_.isEmpty, YorN)(['a']));
  // => N
  console.log(_.ternary(() => 'y', () => 'n', true))
  // => y
})();
```
### _.ifT
```
_.ifT(evaluator, trueHandler, value)
```

```javascript
(() => {
  const getYifT = _.ifT(_.isEmpty, () => 'Y');
  const ifNotEmptyAppendString = _.ifT(_.isNotEmpty, (str) => `${str}-paddString`);

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

### _.ifF
```
_.ifF(evaluator, falseHandler, value)
```

```javascript
(() => {
  const ifNotEmptyN = _.ifF(_.isEmpty, () => 'N');
  const ifNotEmptyAppendString = _.ifF(_.isEmpty, (str) => `${str}-paddString`);

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

### _.removeByIndex
**alias:** removeByIdx
```
_.removeByIndex(index, array);
```
```javascript
(() => {
  const arr = [1, 2, 3];
  const secondRemoved = _.removeByIndex(1, arr);

  // argument array should not be mutated.
  console.log(arr);
  // => [1, 2, 3]
  console.log(secondRemoved);
  // => [1, 3]
})();
```

### _.removeLast
```
_.removeLast(array);
```
```javascript
(() => {
  const arr = [1, 2, 3];
  const lastRemoved = _.removeLast(arr);

  // argument array should not be mutated.
  console.log(arr);
  // => [1, 2, 3]
  console.log(lastRemoved);
  // => [1, 2]
})();
```

### _.append
**alias:** concat

```
_.append(array, [values])
```

```javascript
(() => {
  const arr = [1];
  const appended = _.append(arr, 34);

  // argument array should not be mutated.
  console.log(arr);
  // => [1]
  console.log(appended);
  // => [1, 34]
  console.log(_.append(arr, [2,3,4]));
  // => [1, 2, 3, 4]
})();
```
### _.prepend
```
_.prepend(array, [values])
```
```javascript
(() => {
  const arr = [1];
  const prepended = _.prepend(arr, 34);

    // argument array should not be mutated.
  console.log(arr);
  // => [1]
  console.log(prepended);
  // => [34, 1]
  console.log(_.prepend(arr, [2,3,4]));
  // => [2, 3, 4, 1]
})();
```

### _.mapWithKey
**alias:** mapWithIdx   
Same with _.map.convert({ cap: false})
```
_.mapWithKey(iteratee, collection)
```
```javascript
(() => {
  const arr = [3, 4, 5];
  const getIdxs = _.mapWithKey((v, i) => i);

  console.log(getIdxs(arr));
  // => [0, 1, 2]
  console.log(getIdxs({ a: 1, b: 2}));
  // => ['a', 'b']
})();
```

### _.reduceWithKey
**alias:** reduceWithIdx   
Same with _.reduce.convert({ cap: false })
```
_.reduceWithKey(iteratee, accumulator, collection)
```
```javascript
(() => {
  const arr = [3, 4, 5];
  const getIdxs = _.reduceWithKey((acc, v, i) => _.concat(acc, i), []);

  console.log(getIdxs(arr));
  // => [0, 1, 2]
  console.log(getIdxs({ a: 1, b: 2 }));
  // => ['a', 'b']
})();
```