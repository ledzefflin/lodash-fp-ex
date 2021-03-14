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
All functions are curried.

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
* `isDateString`

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

```javascript
(async () => {
  const arr = [1, 2, 3, 4, 5];
  const asyncMapper = (a) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(2 * a);
      }, 5);
    });

  // it takes about 5ms + alpha.
  const results = await _.mapAsync(asyncMapper, arr);
  console.log(results);
  // [2,4,6,8,10]
})();
```

### filterAsync
filterAsync works with Promise.all

```javascript
(async () => {
  const arr = [1, 2, 3, 4, 5];
  const asyncFilter = (a) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(!_.equals(0, a % 2));
      }, 5);
    });
  
  // it takes about 5ms + alpha.
  const results = await _.filterAsync(asyncFilter, arr);
  console.log(_.isEmpty(results));
  // false
  console.log(results);
  // [1,3,5]
})();
```

### reduceAsync
reduceAsync works different way from mapAsync, filterAsync.   
reduceAsync works with Promise.resolve.    
So if you more important function order, reduceAsync will be suitable.

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
  // false
  console.log(results);
  // [2, 4, 6, 8, 10]
})();

```

### findAsync
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
  // { name: 'hello', age: 22 }
})();
```

### promisify
wrap argument with Promise
```javascript
(async () => {
  const result = await _.promisify(128);
  const result1 = await _.promisify((a, b) => a + b, 64, 64);
  const result2 = await _.promisify(Promise.resolve(128));

  console.log(result, result1, result2);
  // 128 128 128
})();
```

### then (alias: andThen)
Make Promise.then work with _.pipe
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
  // 128, 128, 128
})();
```

### otherwise
Make Promise.catch work with _.pipe.
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
  // error 'wrong'
})();
```

### finally
Make Promise.finally work with _.pipe.
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
  // false
})();
```
### isPromise
Check argument is promise.
```javascript
(() => {
  const p = Promise.resolve(1);
  const fn = () => 1;
  const str = '1';
  const num = 1;

  console.log(_.promisify(p));
  // Promise
  console.log(_.promisify(fn));
  // Promise
  console.log(_.promisify(str));
  // Promise
  console.log(_.promisify(num));
  // Promise
  console.log(_.promisify(null));
  // Promise
  console.log(_.promisify(undefined));
  // Promise
})();
```

### isNotEmpty
opposite of _.isEmpty
```javascript
(() => {
  console.log(_.isNotEmpty([]));
  // false
    console.log(_.isNotEmpty({}));
  // false
    console.log(_.isNotEmpty(1));
  // false
    console.log(_.isNotEmpty(''));
  // false
    console.log(_.isNotEmpty(null));
  // false
    console.log(_.isNotEmpty(undefined));
  // false
})()
```

### isNotNil
opposite of _.isNil
```javascript
(() => {
  console.log(_.isNotNil(null));
  // false
  console.log(_.isNotNil(undefined));
  // false

  console.log(_.isNotNil(1));  
  // true
  console.log(_.isNotNil({}));
  // true
  console.log(_.isNotNil(() => {}));
  // true
})()
```
### isJson
Check string is json string.
```javascript
(() => {
  console.log(_.isJson('{ "test": "value" }'));
  // true

  console.log(_.isJson('test'));
  // false
  console.log({ test: 'value' });
  // false
})()
```

### notEquals (alias: isNotEqual)
opposite of _.isEqual
```javascript
(() => {
  console.log(_.notEquals({ a: 1}, {a: 1}));
  // false
  console.log(_.notEquals([1,2,3], [1,2,3]));
  // false

  console.log(_.notEquals([1,2,3], [2,3,4]));
  // true
  console.log(_.notEquals('string', 'number'));
  // true
  console.log(_.notEquals(1, 2));
  // true
})();
```

### isVal (alias: isPrimitive)
Check agument is primitive type.
```javascript
(() => {
  console.log(_.isVal(null));
  // true
  console.log(_.isVal(undefined));
  // true
  console.log(_.isVal(false));
  // true
  console.log(_.isVal(1));
  // true
  console.log(_.isVal('string'));
  // true

  console.log(_.isVal([]));
  // false
  console.log(_.isVal({}));
  // false
  console.log(_.isVal(() => {}));
  // false
})();
```

### isRef (alias: isReference)
Check agument is reference type.
```javascript
(() => {
  console.log(_.isRef(null));
  // false
  console.log(_.isRef(undefined));
  // false
  console.log(_.isRef(false));
  // false
  console.log(_.isRef(1));
  // false
  console.log(_.isRef('string'));
  // false
  
  console.log(_.isRef([]));
  // true
  console.log(_.isRef({}));
  // true
  console.log(_.isRef(() => {}));
  // true
})();
```

### not
```javascript
(() => {
  console.log(_.not(0));
  // true

  console.log(_.not(true));
  // false
  console.log(_.not(1));
  // false
  console.log(_.not({}));
  // false
})();
```

### notIncludes
```javascript
(() => {
  console.log(_.notIncludes(1, [1,2,3]));
  // false
  console.log(_.notIncludes('s', 'string'));
  // false
})();
```

### toBool
```javascript
(() => {
  console.log(_.toBool(1));
  // true
  console.log(_.toBool('true'));
  // true

  console.log(_.toBool(0));
  // false
  console.log(_.toBool(null));
  // false
  console.log(_.toBool(undefined));
  // false
  console.log(_.toBool('false'));
  // false
})();
```

### deepFreeze
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
  // true
  console.log(Object.isFrozen(shallowFrozen.a));
  // false
  console.log(Object.isFrozen(shallowFrozen.a.b));
  // false

  console.log(Object.isFrozen(deepFrozen));
  // true
  console.log(Object.isFrozen(deepFrozen.a));
  // true
  console.log(Object.isFrozen(deepFrozen.a.b));
  // true
  console.log(Object.isFrozen(deepFrozen.a.c));
  // true
})();
```

### key
```javascript
(() => {
  const obj = { a: 1 };
  const obj1 = { a: 1, b: 1, c: 1 };

  console.log(_.key(1, obj));
  // a
  console.log(_.key(1, obj1));
  // c
})()
```