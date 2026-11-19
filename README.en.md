# lodash-fp-ex

[한국어](./README.md) | **English**

A collection of extension functions designed to be **mixed into `lodash/fp`**.
It provides async collection functions (`mapAsync`, `findAsync`, `pipeAsync`, …), helpers that put Promises into a `pipe` (`andThen`, `otherwise`, `finally`), and frequently used check/transform utilities.

- Every function is **auto-curried** (plug it straight into `pipe`/`flow`)
- **Immutable** behavior — inputs are never mutated
- TypeScript **generic inference** — callback parameter and return types are inferred, and no `unknown` / `undefined` / `never` leaks into the public types
- Both ESM and CommonJS are supported; `lodash` is a peer dependency

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [At a Glance](#at-a-glance)
- [Read This First (Caveats)](#read-this-first-caveats)
- [Real-World Use Cases](#real-world-use-cases)
- [API Reference](#api-reference)
  - [Async Collections](#async-collections)
  - [Promise Helpers](#promise-helpers)
  - [Type Checks / Booleans](#type-checks--booleans)
  - [Objects](#objects)
  - [Strings](#strings)
  - [Arrays](#arrays)
  - [Iterating with Keys](#iterating-with-keys)
  - [Misc](#misc)
- [TypeScript](#typescript)
- [Migration Notes](#migration-notes)
- [Development](#development)

## Install

```bash
pnpm add lodash lodash-fp-ex
```

- `lodash` (^4.17.21) is a peer dependency.
- Developed and tested on Node.js `^22.18 || ^24.11 || >=26`.

## Usage

### 1. Mix into lodash/fp (recommended)

```js
import fp from 'lodash/fp';
import lodashFpEx from 'lodash-fp-ex';

fp.mixin(lodashFpEx);

// Now fp.mapAsync, fp.pipeAsync, ... work like any other fp function
const ids = await fp.pipe(fp.map(fp.get('id')), fp.uniq)(users);
```

CommonJS:

```js
const fp = require('lodash/fp');
const lodashFpEx = require('lodash-fp-ex');

fp.mixin(lodashFpEx);
```

### 2. Use directly without mixin

```js
import fpEx from 'lodash-fp-ex';

await fpEx.mapAsync(fetchUser, [1, 2, 3]);
```

> **TypeScript users**: `@types/lodash` has no type for `fp.mixin`, and the types of functions added by a mixin are unknown to the compiler.
> To get full type inference, use **option 2 (direct import)**.

## At a Glance

| Category | Functions |
| --- | --- |
| Async collections | [`mapAsync`](#mapasync) · [`filterAsync`](#filterasync) · [`reduceAsync`](#reduceasync) · [`forEachAsync`](#foreachasync) · [`findAsync`](#findasync) · [`findIndexAsync`](#findindexasync) · [`findKeyAsync`](#findkeyasync) · [`someAsync`](#someasync) · [`everyAsync`](#everyasync) |
| Promise helpers | [`pipeAsync`](#pipeasync) · [`promisify`](#promisify) · [`andThen`](#andthen) · [`otherwise`](#otherwise) · [`finally`](#finally) · [`delayAsync`](#delayasync) (`sleep`) |
| Type checks / booleans | [`isPromise`](#ispromise) · [`isNotEmpty`](#isnotempty) · [`isNotNil`](#isnotnil) · [`isJson`](#isjson) · [`isDatetimeString`](#isdatetimestring) · [`isVal`](#isval) (`isPrimitive`) · [`isRef`](#isref) (`isReference`) · [`isFalsy`](#isfalsy) · [`isTruthy`](#istruthy) · [`instanceOf`](#instanceof) · [`not`](#not) · [`toBool`](#tobool) · [`notEquals`](#notequals) (`isNotEqual`) · [`notIncludes`](#notincludes) |
| Objects | [`key`](#key) (`keyByVal`) · [`deepFreeze`](#deepfreeze) · [`transformObjectKey`](#transformobjectkey) · [`toCamelcase`](#tocamelcase) (`toCamelKey`) · [`toSnakecase`](#tosnakecase) (`toSnakeKey`) · [`toPascalcase`](#topascalcase) · [`getOr`](#getor) |
| Strings | [`pascalCase`](#pascalcase) |
| Arrays | [`removeByIndex`](#removebyindex) · [`removeLast`](#removelast) · [`append`](#append) · [`prepend`](#prepend) |
| Iterating with keys | [`mapWithKey`](#mapwithkey) (`mapWithIndex`) · [`forEachWithKey`](#foreachwithkey) (`forEachWithIndex`) · [`reduceWithKey`](#reducewithkey) (`reduceWithIndex`) |
| Misc | [`ap`](#ap) |

## Read This First (Caveats)

### Parallel vs. sequential execution

Async functions run in different modes. Pick the one that fits.

| Mode | Functions | Notes |
| --- | --- | --- |
| **Parallel** (`Promise.all`) | `mapAsync`, `filterAsync` | Starts every element at once. Fastest, but many elements mean many concurrent requests |
| **Sequential** | `forEachAsync`, `reduceAsync`, `findAsync`, `findIndexAsync`, `findKeyAsync`, `someAsync`, `everyAsync`, `pipeAsync` | The next element starts only after the previous one finishes. `find*` / `some` / `every` **stop as soon as the result is known** and never call the remaining elements |

> Example: 4 elements, 50ms each. `mapAsync` ≈ 50ms, `forEachAsync` ≈ 200ms.

Calling thousands of APIs with `mapAsync` can overload the server or network. In that case split the work into chunks and process them with `reduceAsync` / `forEachAsync` ([see use case](#4-process-a-large-number-of-requests-in-chunks)).

### Return values when nothing matches

Behaves like lodash.

| Function | When nothing matches |
| --- | --- |
| `findAsync` | `undefined` |
| `findKeyAsync` | `undefined` |
| `findIndexAsync` | `-1` |
| `key` | `undefined` |
| `someAsync` / `everyAsync` (empty collection) | `false` / `true` |

The type declarations deliberately do not include `undefined` (they are `Promise<V>`), so check the result with something like `isNotNil` before using it.

### Error handling

- Errors thrown in a callback (synchronous `throw` or a rejection) are delivered as a **rejection of the returned Promise**.
- `pipeAsync` **does not run the remaining steps** once a step fails.
- `findAsync` rejects when the predicate throws (it does not swallow the error into `undefined`).

### Immutability

- Array/object functions **return new values and never mutate the input**.
- `removeByIndex` and `removeLast` create a new array but **share the element references with the original** (structural sharing — much faster than deep cloning). If you mutate an element object of the returned array, the original element changes too, so create new objects when you need to modify elements.
- The `transformObjectKey` family always returns a new object.

### Currying

All functions that take two or more arguments are curried, except `promisify`, `removeLast`, `pipeAsync`, and `delayAsync`.

```js
const double = fp.mapAsync(async (v) => v * 2); // partial application
await double([1, 2, 3]); // [2, 4, 6]
```

### How getOr differs

Unlike `fp.getOr`, it returns the default value when the value is **`null`** as well as `undefined` (see [getOr](#getor)).

## Real-World Use Cases

### 1. Call several APIs in parallel and convert response keys to camelCase

```js
import fp from 'lodash/fp';
import lodashFpEx from 'lodash-fp-ex';
fp.mixin(lodashFpEx);

const fetchUser = (id) => fetch(`/api/users/${id}`).then((r) => r.json());

// parallel calls → convert snake_case responses to camelCase
const loadUsers = fp.pipeAsync(
  fp.mapAsync(fetchUser), // parallel
  fp.map(fp.toCamelcase), // { user_name } → { userName }
);

const users = await loadUsers([1, 2, 3]);
```

### 2. Loading state and error handling in a Vue composable

`andThen` / `otherwise` / `finally` behave like `then` / `catch` / `finally` inside a `pipe`.

```js
import { ref } from 'vue';
import fp from 'lodash/fp';
import lodashFpEx from 'lodash-fp-ex';
fp.mixin(lodashFpEx);

export function useUsers() {
  const loading = ref(false);
  const error = ref('');
  const users = ref([]);

  const load = fp.pipe(
    () => fetch('/api/users').then((r) => r.json()),
    fp.andThen(fp.map(fp.toCamelcase)),
    fp.andThen((list) => (users.value = list)),
    fp.otherwise((e) => (error.value = e.message)),
    fp.finally(() => (loading.value = false)),
  );

  return {
    users,
    loading,
    error,
    load: () => ((loading.value = true), load()),
  };
}
```

### 3. Async validation pipeline (`everyAsync` / `someAsync`)

```js
const validators = [
  async (form) => (await isEmailAvailable(form.email)) === true,
  async (form) => form.password.length >= 8,
  async (form) => (await isBlocked(form.ip)) === false,
];

// If an earlier check fails, the remaining checks are not called (sequential + short-circuit)
const isValid = await fp.everyAsync((validate) => validate(form), validators);

// true immediately as soon as one passes
const hasPermission = await fp.someAsync(
  (role) => checkPermission(user, role),
  ['admin', 'editor', 'viewer'],
);
```

### 4. Process a large number of requests in chunks

```js
const chunks = fp.chunk(50, ids); // group by 50

// chunks run sequentially, requests inside a chunk run in parallel → bounded server load
const results = await fp.reduceAsync(
  async (acc, chunk) => fp.concat(acc, await fp.mapAsync(fetchUser, chunk)),
  [],
  chunks,
);
```

### 5. Find the first available server (`findAsync`, `findKeyAsync`)

```js
const mirrors = ['https://a.example.com', 'https://b.example.com', 'https://c.example.com'];

// stops at the first server that responds (the rest are not called)
const alive = await fp.findAsync(
  (url) => fetch(`${url}/health`).then((r) => r.ok).catch(() => false),
  mirrors,
);

// for objects you can find the key
const region = await fp.findKeyAsync(
  (url) => isHealthy(url),
  { seoul: 'https://kr.example.com', tokyo: 'https://jp.example.com' },
);
// => 'seoul' | 'tokyo' (undefined if none)
```

### 6. Find the position of an element that satisfies a condition (`findIndexAsync`)

```js
const idx = await fp.findIndexAsync(
  async (task) => (await getStatus(task.id)) === 'failed',
  tasks,
);
// idx === -1 means there is no failed task
const rest = idx === -1 ? tasks : fp.removeByIndex(idx, tasks);
```

### 7. Safely lock a response object (`deepFreeze`)

```js
const config = fp.deepFreeze(await loadConfig());
// Attempts like config.a.b.c = 1 are ignored (or throw in strict mode)
```

## API Reference

Notation: `T extends object` means an array or an object. The `key` in a callback is a **`number` for arrays and a `string` for objects**.

### Async Collections

#### mapAsync

Runs in **parallel** (`Promise.all`). The result order matches the input order.

```ts
mapAsync<T extends object, R>(
  asyncMapper: (value: ValueOf<T>, key: KeyOf<T>) => R | Promise<R>,
  collection: T,
): Promise<R[]>
```

```js
const arr = [1, 2, 3, 4, 5];
await fp.mapAsync(async (v) => v * 2, arr); // takes about one delay
// => [2, 4, 6, 8, 10]

await fp.mapAsync(async (v, k) => `${k}:${v}`, { a: 1, b: 2 });
// => ['a:1', 'b:2']
```

#### filterAsync

Runs in **parallel**. Keeps only the elements for which the predicate returns `true` (original order preserved).

```ts
filterAsync<T extends object>(
  asyncFilter: (value: ValueOf<T>, key: KeyOf<T>) => boolean | Promise<boolean>,
  collection: T,
): Promise<ValueOf<T>[]>
```

```js
await fp.filterAsync(async (v) => v % 2 !== 0, [1, 2, 3, 4, 5]);
// => [1, 3, 5]
```

#### reduceAsync

Runs **sequentially**. Works with the same arguments as lodash `reduce`, `(acc, value, key)`, and `acc` is always a **resolved value**.

```ts
reduceAsync<T extends object, A>(
  asyncFn: (acc: A, value: ValueOf<T>, key: KeyOf<T>) => A | Promise<A>,
  initAcc: A | Promise<A>,
  collection: T,
): Promise<A>
```

```js
await fp.reduceAsync(
  async (acc, v) => [...acc, await fetchPrice(v)],
  [],
  ['apple', 'banana'],
);

await fp.reduceAsync((acc, v) => acc + v, 0, [1, 2, 3]); // a sync callback also works
// => 6
```

#### forEachAsync

Runs **sequentially**. Collects the callback return values into an array.

```ts
forEachAsync<T extends object, R>(
  callbackAsync: (value: ValueOf<T>, key: KeyOf<T>) => R | Promise<R>,
  collection: T,
): Promise<R[]>
```

```js
await fp.forEachAsync(async (v, i) => v * i, [1, 2, 3]);
// => [0, 2, 6]
```

#### findAsync

Runs **sequentially**. **Stops immediately** at the first element for which the predicate returns `true`. Returns `undefined` if none.

```ts
findAsync<T extends object>(
  asyncFilter: (value: ValueOf<T>, key: KeyOf<T>) => boolean | Promise<boolean>,
  collection: T,
): Promise<ValueOf<T>>
```

```js
const users = [{ name: 'hi' }, { name: 'hello' }, { name: 'alo' }];
await fp.findAsync(async (u) => u.name === 'hello', users);
// => { name: 'hello' }
```

#### findIndexAsync

Runs **sequentially**. The index of the first match, or `-1` if none. **Arrays only.**

```ts
findIndexAsync<V>(
  asyncPredicate: (value: V, index: number) => boolean | Promise<boolean>,
  array: readonly V[],
): Promise<number>
```

```js
await fp.findIndexAsync(async (v) => v === 3, [1, 2, 3, 4]); // => 2
await fp.findIndexAsync(async (v) => v > 10, [1, 2, 3]); // => -1
```

#### findKeyAsync

Runs **sequentially**. The key of the first match, or `undefined` if none. **Objects only.**

```ts
findKeyAsync<T extends object>(
  asyncPredicate: (value: ValueOf<T>, key: KeyOf<T>) => boolean | Promise<boolean>,
  object: T,
): Promise<KeyOf<T>>
```

```js
await fp.findKeyAsync(async (v) => v === 2, { a: 1, b: 2, c: 3 });
// => 'b'
```

#### someAsync

Runs **sequentially**. `true` immediately if any element passes. `false` for an empty collection.

```ts
someAsync<T extends object>(
  asyncPredicate: (value: ValueOf<T>, key: KeyOf<T>) => boolean | Promise<boolean>,
  collection: T,
): Promise<boolean>
```

```js
await fp.someAsync(async (v) => v > 4, [1, 2, 3, 4, 5]); // => true
```

#### everyAsync

Runs **sequentially**. `false` immediately if any element fails. `true` for an empty collection.

```ts
everyAsync<T extends object>(
  asyncPredicate: (value: ValueOf<T>, key: KeyOf<T>) => boolean | Promise<boolean>,
  collection: T,
): Promise<boolean>
```

```js
await fp.everyAsync(async (v) => v > 0, [1, 2, 3]); // => true
await fp.everyAsync(async (v) => v < 3, [1, 2, 3]); // => false (stops at 3)
```

### Promise Helpers

#### pipeAsync

The **async version** of `lodash/fp`'s `pipe`. You can mix sync and async functions; a Promise returned by a step is **resolved before the next function receives it**. The result is always a Promise.

- Only the first function may take multiple arguments.
- If a step throws, the following functions do not run and the result rejects.
- Types are inferred step by step for up to 8 functions.

```ts
pipeAsync<A extends any[], B, C>(
  f1: (...args: A) => B | Promise<B>,
  f2: (arg: B) => C | Promise<C>,
): (...args: A) => Promise<C>
// ... overloads up to f8
```

```js
const run = fp.pipeAsync(
  (a, b) => a + b, // sync
  async (n) => n * 2, // async
  (n) => `v${n}`,
);

await run(1, 2); // => 'v6'
```

More readable than repeating `andThen`:

```js
// before
fp.pipe(fetchUser, fp.andThen(getPosts), fp.andThen(fp.map(fp.get('title'))));
// after
fp.pipeAsync(fetchUser, getPosts, fp.map(fp.get('title')));
```

#### promisify

Wraps a value / function / Promise in a Promise. **Not curried** (other arguments are passed to the function only when the first argument is a function).

```ts
promisify<A extends any[], R>(fn: (...args: A) => R, ...args: A): Promise<Awaited<R>>
promisify<R>(value: R | Promise<R>): Promise<Awaited<R>>
```

```js
await fp.promisify(128); // => 128
await fp.promisify((a, b) => a + b, 64, 64); // => 128
await fp.promisify(Promise.resolve(128)); // => 128
await fp.promisify(() => { throw new Error('x'); }); // rejects
```

#### andThen

`Promise.then` usable inside `pipe`. It also works when the value is not a Promise.

```ts
andThen<T, R>(successHandler: (response: T) => R | Promise<R>, thenable: T | Promise<T>): Promise<R>
```

```js
const composer = fp.pipe(fetchNumber, fp.andThen((x) => x / 2));
await composer(128);
```

#### otherwise

`Promise.catch` usable inside `pipe`. The handler's return value becomes the result.

```ts
otherwise<E extends Error, T, R>(failureHandler: (error: E) => R | Promise<R>, thenable: T | Promise<T>): Promise<T | R>
```

```js
const safe = fp.pipe(riskyJob, fp.otherwise((e) => ({ error: e.message })));
await safe(); // { error: '...' } on failure
```

#### finally

`Promise.finally` usable inside `pipe`. Runs regardless of success or failure and **does not change the result value**.

```ts
finally<T>(callback: () => void | Promise<void>, thenable: T | Promise<T>): Promise<T>
```

```js
await fp.pipe(job, fp.finally(() => (loading = false)))();
```

#### delayAsync

**alias:** `sleep` — waits for the given number of milliseconds.

```ts
delayAsync(ms: number): Promise<void>
```

```js
await fp.delayAsync(300);
```

### Type Checks / Booleans

#### isPromise

```ts
isPromise<T>(x: T): boolean
```

Only values whose `then` and `catch` are both functions return `true`.

```js
fp.isPromise(Promise.resolve(1)); // => true
fp.isPromise(() => 1); // => false
```

#### isNotEmpty

The opposite of `lodash.isEmpty`. **Numbers are always `false`** (because `isEmpty(1)` is `true`).

```js
fp.isNotEmpty([1]); // => true
fp.isNotEmpty('str'); // => true
fp.isNotEmpty([]); // => false
fp.isNotEmpty(1); // => false
fp.isNotEmpty(null); // => false
```

#### isNotNil

```js
fp.isNotNil(0); // => true
fp.isNotNil(null); // => false
fp.isNotNil(undefined); // => false
```

#### isJson

Checks whether a string is JSON. Returns `false` for non-strings.

```js
fp.isJson('{ "test": "value" }'); // => true
fp.isJson('test'); // => false
fp.isJson({ test: 'value' }); // => false
```

#### isDatetimeString

Checks whether a string can be parsed by `Date.parse`.

```js
fp.isDatetimeString('2021-03-14 14:21:00'); // => true
fp.isDatetimeString('Aug 9, 1995'); // => true
fp.isDatetimeString('20210314'); // => false
```

#### isVal

**alias:** `isPrimitive` — `null`, `undefined`, `boolean`, `number`, `string`

```js
fp.isVal(1); // => true
fp.isVal([]); // => false
```

#### isRef

**alias:** `isReference` — the opposite of `isVal` (arrays, objects, functions)

```js
fp.isRef({}); // => true
fp.isRef('str'); // => false
```

#### isFalsy

`true` for falsy values (`0`, `-0`, `NaN`, `false`, `''`, `null`, `undefined`). Empty arrays/objects are **not** falsy.

```js
fp.isFalsy(''); // => true
fp.isFalsy([]); // => false
fp.isFalsy('0'); // => false
```

#### isTruthy

The opposite of `isFalsy`.

```js
fp.isTruthy({}); // => true
fp.isTruthy(0); // => false
```

#### instanceOf

```ts
instanceOf<C extends Ctor, T>(t: C, arg: T): boolean
```

```js
class Car {}
fp.instanceOf(Car, new Car()); // => true
fp.instanceOf(String, 'string'); // => false (primitive)
fp.instanceOf(String, new String('string')); // => true
fp.filter(fp.instanceOf(Car), vehicles); // curried
```

#### not

```js
fp.not(0); // => true
fp.not('string'); // => false
```

#### toBool

```js
fp.toBool(1); // => true
fp.toBool(0); // => false
```

> The string `'false'` converts to `true` (it is a non-empty string).

#### notEquals

**alias:** `isNotEqual` — the opposite of `lodash.isEqual` (deep comparison).

```js
fp.notEquals({ a: 1 }, { a: 1 }); // => false
fp.notEquals([1, 2, 3], [2, 3, 4]); // => true
```

#### notIncludes

The opposite of `lodash.includes`. Supports arrays, strings, and objects (by value).

```js
fp.notIncludes(1, [1, 2, 3]); // => false
fp.notIncludes('s', 'string'); // => false
fp.notIncludes(1, { a: 1, b: 2 }); // => false
fp.notIncludes(9, [1, 2, 3]); // => true
```

### Objects

#### key

**alias:** `keyByVal` — finds a key by value (deep comparison). If several keys match, the **first** one is returned; `undefined` if none.

```ts
key<T extends object>(obj: T, value: ValueOf<T>): KeyOf<T>
```

```js
fp.key({ a: 1, b: 1 }, 1); // => 'a'
fp.key({ a: { b: { k: 1 } } }, { b: { k: 1 } }); // => 'a'
fp.key({ a: 1 }, 2); // => undefined
```

#### deepFreeze

Recursively applies `Object.freeze` to nested objects/arrays/functions. Freezes the input object itself and returns it.

```js
const frozen = fp.deepFreeze({ a: { b: [], c: () => {} } });
Object.isFrozen(frozen.a); // => true
Object.isFrozen(frozen.a.b); // => true
```

> Circular references and already-frozen sub-objects are skipped. It has a cost on large objects, so call it only once.

#### transformObjectKey

Renames every key with a transform function. It transforms **nested objects and objects inside arrays** recursively, and throws an error if the transformed keys **collide**.

```ts
transformObjectKey<T extends object>(transformFn: (originStr: string) => string, obj: T): Record<string, any>
```

```js
fp.transformObjectKey(fp.kebabCase, { objKey: { nestedKey: [{ anotherKey: 3 }] } });
// => { 'obj-key': { 'nested-key': [{ 'another-key': 3 }] } }

fp.transformObjectKey(fp.kebabCase, { 'obj-key': 1, obj_key: 2 });
// => Error: obj-key already exist. duplicated property name is not supported.
```

> If a transformed key is interpreted as a lodash path such as `a.b`, a nested object is created.

#### toCamelcase

**alias:** `toCamelKey` — `transformObjectKey(camelCase)`

```js
fp.toCamelcase({ user_name: 'kim', address_info: { zip_code: 1 } });
// => { userName: 'kim', addressInfo: { zipCode: 1 } }
```

#### toSnakecase

**alias:** `toSnakeKey` — `transformObjectKey(snakeCase)`

```js
fp.toSnakecase({ userName: 'kim' }); // => { user_name: 'kim' }
```

#### toPascalcase

`transformObjectKey(pascalCase)`

```js
fp.toPascalcase({ foo_bar: 1 }); // => { FooBar: 1 }
```

#### getOr

An overridden version of `lodash/fp`'s `getOr`. It returns the default value when the value at the path is **`null` as well as `undefined`**.

```js
fp.getOr('def', 'a.b', { a: { b: null } }); // => 'def'  (lodash/fp returns null)
fp.getOr('def', 'a.b', { a: { b: 1 } }); // => 1
fp.getOr('def', 'a.b', null); // => 'def'
```

### Strings

#### pascalCase

```js
fp.map(fp.pascalCase, ['__Foo_Bar__', 'FOO BAR', 'fooBar', 'foo_bar', 'foo-bar']);
// => ['FooBar', 'FooBar', 'FooBar', 'FooBar', 'FooBar']
```

### Arrays

#### removeByIndex

Returns a **new array** without the element at the index (original untouched, elements structurally shared). If the index is out of range or cannot be interpreted as a number, the original is returned as-is. Negative indexes count from the end.

```ts
removeByIndex<R>(index: number | string, targetArray: R[]): R[]
```

```js
const arr = [1, 2, 3];
fp.removeByIndex(1, arr); // => [1, 3]
arr; // => [1, 2, 3]
fp.removeByIndex(-1, arr); // => [1, 2]
fp.removeByIndex(99, arr); // => arr (unchanged)
```

#### removeLast

Removes the last element (character) of an array or string. **Not curried.**

```js
fp.removeLast([1, 2, 3]); // => [1, 2]
fp.removeLast('abc'); // => 'ab'
```

#### append

An alias of `fp.concat`. Appends an element or an array to the end.

```js
fp.append([1], 2); // => [1, 2]
fp.append([1], [2, 3]); // => [1, 2, 3]
```

#### prepend

Adds an element or an array to the **front**.

```js
fp.prepend([1], 2); // => [2, 1]
fp.prepend([1], [2, 3]); // => [2, 3, 1]
fp.prepend([1])(0); // => [0, 1]
```

### Iterating with Keys

By default, `map`, `forEach`, and `reduce` in lodash/fp pass only one callback argument (capped). The functions below receive both `(value, key)`. The key is a `number` for arrays and a `string` for objects.

#### mapWithKey

**alias:** `mapWithIndex`

```js
const getKeys = fp.mapWithKey((v, k) => k);
getKeys([3, 4, 5]); // => [0, 1, 2]
getKeys({ a: 1, b: 2 }); // => ['a', 'b']
```

#### forEachWithKey

**alias:** `forEachWithIndex` — for side effects. Returns the input as-is.

```js
fp.forEachWithKey((v, k) => console.log(k, v), { a: 1 });
// a 1
// => { a: 1 }
```

#### reduceWithKey

**alias:** `reduceWithIndex`

```js
const collectKeys = fp.reduceWithKey((acc, v, k) => fp.concat(acc, k), []);
collectKeys([3, 4, 5]); // => [0, 1, 2]
collectKeys({ a: 1, b: 2 }); // => ['a', 'b']
```

### Misc

#### ap

Use it to **swap argument order** inside a `pipe` (inspired by the `ap` of an [applicative functor](https://github.com/monet/monet.js/blob/master/docs/MAYBE.md#ap)).

```js
const includesWithAp = fp.pipe(fp.includes, fp.ap('string'));
includesWithAp('i'); // => true  (fp.includes('i', 'string'))
```

## TypeScript

Callback parameter and return types are inferred through generics, and no `unknown`, `undefined`, or `never` appears in the public types.

```ts
import fpEx from 'lodash-fp-ex';

// return type: Promise<string[]>
const names = await fpEx.mapAsync(async (id: number) => `user-${id}`, [1, 2]);

// object keys are strings, and the return type is the key union: Promise<'a' | 'b'>
const k = await fpEx.findKeyAsync(async (v: number) => v > 1, { a: 1, b: 2 });

// pipeAsync: the resolved type of each step carries over to the next
const run = fpEx.pipeAsync(
  (a: number, b: number) => a + b, // (a, b) => number
  async (n: number) => String(n), //            number → string
  (s: string) => s.length, //                    string → number
);
// run: (a: number, b: number) => Promise<number>

// partial application is inferred too
const toStr = fpEx.mapAsync((v: number) => String(v));
await toStr([1, 2]); // string[]
```

> The `acc` of a `reduceAsync` callback has the resolved value type (`A`).

## Migration Notes

If you are upgrading from an earlier version, check the following.

- **`reduceAsync`**: the callback's `acc` is now the **resolved value, not a Promise**. Code that did `await accP` keeps working, but if you typed `acc` as `Promise<T>` in TypeScript, change it to `T`.
- **`findAsync`**: now **runs sequentially and stops at the first match**. An error thrown by the predicate is no longer swallowed into `undefined`; the result rejects.
- **`removeByIndex` / `removeLast`**: changed from deep cloning to **structural sharing** (new array, shared elements). The original array is not mutated.
- **`removeLast('abc')`**: a bug where strings were not truncated has been fixed; it now returns `'ab'`.
- **Package layout**: bundles moved to `dist/` (ESM `index.mjs`, CJS `index.cjs`, types `index.d.mts` / `index.d.cts`) and `exports` was added. Deep imports such as `lodash-fp-ex/index` no longer work.
- **tsconfig**: for type resolution, `moduleResolution` of `node16` / `nodenext` / `bundler` is recommended (the `types` condition of `exports` is used).

## Development

```bash
pnpm install
pnpm test           # unit + type tests (vp test run)
pnpm test:watch
pnpm typecheck      # tsc --noEmit
pnpm build          # vp pack → dist/
pnpm bench          # performance benchmark
pnpm bench:clone    # copy strategy benchmark
```

- Package manager: **pnpm**
- Bundling / testing: **Vite+** (`vp pack`, `vp test`)

## License

MIT
