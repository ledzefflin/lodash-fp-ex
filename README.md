# lodash-fp-ex

**한국어** | [English](./README.en.md)

`lodash/fp`에 **mixin**해서 쓰는 확장 함수 모음입니다.
비동기 컬렉션 함수(`mapAsync`, `findAsync`, `pipeAsync` …), Promise를 `pipe`에 끼워 넣는 헬퍼(`andThen`, `otherwise`, `finally`), 자주 쓰는 검사·변환 함수를 제공합니다.

- 모든 함수는 **자동 커링**됩니다 (`pipe`/`flow`에 그대로 연결 가능)
- 입력을 변경하지 않는 **불변(immutable)** 동작
- TypeScript **제네릭 추론** 지원 — 콜백 인자/반환 타입이 자동으로 추론되고, 공개 타입에 `unknown`/`never`가 노출되지 않습니다 (결과가 없을 수 있는 함수는 `| undefined` 명시)
- ESM / CommonJS 모두 지원, `lodash`는 peerDependency

## 목차

- [설치](#설치)
- [사용법](#사용법)
- [한눈에 보기](#한눈에-보기)
- [먼저 알아두세요 (유의사항)](#먼저-알아두세요-유의사항)
- [실전 유스케이스](#실전-유스케이스)
- [API 레퍼런스](#api-레퍼런스)
  - [비동기 컬렉션](#비동기-컬렉션)
  - [Promise 헬퍼](#promise-헬퍼)
  - [타입 검사 / 불리언](#타입-검사--불리언)
  - [객체](#객체)
  - [문자열](#문자열)
  - [배열](#배열)
  - [key와 함께 순회](#key와-함께-순회)
  - [기타](#기타)
- [TypeScript](#typescript)
- [마이그레이션 노트](#마이그레이션-노트)
- [개발](#개발)

## 설치

```bash
pnpm add lodash lodash-fp-ex
```

- `lodash`(^4.17.21)는 peerDependency 입니다.
- Node.js `^22.18 || ^24.11 || >=26` 에서 개발/테스트합니다.

## 사용법

### 1. lodash/fp에 mixin (권장)

```js
import fp from 'lodash/fp';
import lodashFpEx from 'lodash-fp-ex';

fp.mixin(lodashFpEx);

// 이제 fp.mapAsync, fp.pipeAsync ... 를 fp 함수처럼 사용
const ids = await fp.pipe(fp.map(fp.get('id')), fp.uniq)(users);
```

CommonJS:

```js
const fp = require('lodash/fp');
const lodashFpEx = require('lodash-fp-ex');

fp.mixin(lodashFpEx);
```

### 2. mixin 없이 직접 사용

```js
import fpEx from 'lodash-fp-ex';

await fpEx.mapAsync(fetchUser, [1, 2, 3]);
```

> **TypeScript 사용자**: `@types/lodash`에는 `fp.mixin` 타입이 없고 mixin 후 추가된 함수의 타입도 알 수 없습니다.
> 타입 추론을 온전히 활용하려면 **2번(직접 import)** 방식을 권장합니다.

## 한눈에 보기

| 분류 | 함수 |
| --- | --- |
| 비동기 컬렉션 | [`mapAsync`](#mapasync) · [`filterAsync`](#filterasync) · [`reduceAsync`](#reduceasync) · [`forEachAsync`](#foreachasync) · [`findAsync`](#findasync) · [`findIndexAsync`](#findindexasync) · [`findKeyAsync`](#findkeyasync) · [`someAsync`](#someasync) · [`everyAsync`](#everyasync) |
| Promise 헬퍼 | [`pipeAsync`](#pipeasync) · [`promisify`](#promisify) · [`andThen`](#andthen) · [`otherwise`](#otherwise) · [`finally`](#finally) · [`delayAsync`](#delayasync)(`sleep`) |
| 타입 검사 / 불리언 | [`isPromise`](#ispromise) · [`isNotEmpty`](#isnotempty) · [`isNotNil`](#isnotnil) · [`isJson`](#isjson) · [`isDatetimeString`](#isdatetimestring) · [`isVal`](#isval)(`isPrimitive`) · [`isRef`](#isref)(`isReference`) · [`isFalsy`](#isfalsy) · [`isTruthy`](#istruthy) · [`instanceOf`](#instanceof) · [`not`](#not) · [`toBool`](#tobool) · [`notEquals`](#notequals)(`isNotEqual`) · [`notIncludes`](#notincludes) |
| 객체 | [`key`](#key)(`keyByVal`) · [`deepFreeze`](#deepfreeze) · [`transformObjectKey`](#transformobjectkey) · [`toCamelcase`](#tocamelcase)(`toCamelKey`) · [`toSnakecase`](#tosnakecase)(`toSnakeKey`) · [`toPascalcase`](#topascalcase) · [`getOr`](#getor) |
| 문자열 | [`pascalCase`](#pascalcase) |
| 배열 | [`removeByIndex`](#removebyindex) · [`removeLast`](#removelast) · [`append`](#append) · [`prepend`](#prepend) |
| key와 함께 순회 | [`mapWithKey`](#mapwithkey)(`mapWithIndex`) · [`forEachWithKey`](#foreachwithkey)(`forEachWithIndex`) · [`reduceWithKey`](#reducewithkey)(`reduceWithIndex`) |
| 기타 | [`ap`](#ap) |

## 먼저 알아두세요 (유의사항)

### 병렬 vs 순차 실행

비동기 함수는 실행 방식이 다릅니다. 용도에 맞게 고르세요.

| 실행 방식 | 함수 | 특징 |
| --- | --- | --- |
| **병렬** (`Promise.all`) | `mapAsync`, `filterAsync` | 모든 요소를 한꺼번에 시작. 가장 빠르지만 요소가 많으면 동시 요청이 몰립니다 |
| **순차** | `forEachAsync`, `reduceAsync`, `findAsync`, `findIndexAsync`, `findKeyAsync`, `someAsync`, `everyAsync`, `pipeAsync` | 앞 요소가 끝나야 다음 요소를 시작. `find*`/`some`/`every`는 **결과가 정해지면 즉시 중단**하여 나머지는 호출하지 않습니다 |

> 예: 요소 4개, 각 50ms. `mapAsync` ≈ 50ms, `forEachAsync` ≈ 200ms.

`mapAsync`로 수천 개의 API를 호출하면 서버/네트워크에 부하가 몰릴 수 있습니다. 이럴 땐 청크로 나누어 `reduceAsync`/`forEachAsync`로 순차 처리하세요 ([유스케이스 참고](#4-대량-요청을-나누어-순차-처리)).

### 일치하는 항목이 없을 때의 반환값

lodash와 동일하게 동작합니다.

| 함수 | 없을 때 |
| --- | --- |
| `findAsync` | `undefined` |
| `findKeyAsync` | `undefined` |
| `findIndexAsync` | `-1` |
| `key` | `undefined` |
| `someAsync` / `everyAsync` (빈 컬렉션) | `false` / `true` |

타입에도 `undefined`가 포함되어 있습니다(예: `findAsync`는 `Promise<V | undefined>`). 결과를 쓰기 전에 `isNotNil` 등으로 확인해야 TypeScript 가 `undefined` 처리를 강제해 줍니다.

### 에러 처리

- 콜백에서 던진 에러(동기 `throw`, `reject`)는 **반환된 Promise의 reject**로 전달됩니다.
- `pipeAsync`는 중간에 실패하면 **이후 단계를 실행하지 않습니다**.
- `findAsync`는 필터에서 에러가 나면 reject 합니다 (조용히 `undefined`로 삼키지 않습니다).

### 불변성

- 배열/객체 함수는 **원본을 변경하지 않고 새 값을 반환**합니다.
- `removeByIndex`, `removeLast`는 새 배열을 만들지만 **요소는 원본과 같은 참조를 공유**합니다 (구조 공유 — 깊은 복사보다 훨씬 빠릅니다). 반환된 배열의 요소 객체를 직접 수정하면 원본의 요소도 바뀌므로, 요소를 고칠 때는 새 객체를 만드세요.
- `transformObjectKey` 계열은 항상 새 객체를 반환합니다.

### 커링

`promisify`, `removeLast`, `pipeAsync`, `delayAsync`를 제외한 인자 2개 이상 함수는 모두 커링됩니다.

```js
const double = fp.mapAsync(async (v) => v * 2); // 부분 적용
await double([1, 2, 3]); // [2, 4, 6]
```

### getOr 의 차이

`fp.getOr`와 달리 값이 `undefined`뿐 아니라 **`null`이어도 기본값**을 반환합니다 ([getOr](#getor) 참고).

## 실전 유스케이스

### 1. 여러 API를 병렬로 호출하고 응답 키를 camelCase로 변환

```js
import fp from 'lodash/fp';
import lodashFpEx from 'lodash-fp-ex';
fp.mixin(lodashFpEx);

const fetchUser = (id) => fetch(`/api/users/${id}`).then((r) => r.json());

// 병렬 호출 → snake_case 응답을 camelCase 로 일괄 변환
const loadUsers = fp.pipeAsync(
  fp.mapAsync(fetchUser), // 병렬
  fp.map(fp.toCamelcase), // { user_name } → { userName }
);

const users = await loadUsers([1, 2, 3]);
```

### 2. Vue 컴포저블에서 로딩 상태와 에러 처리

`andThen` / `otherwise` / `finally` 는 `pipe` 안에서 `then/catch/finally`처럼 동작합니다.

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

### 3. 비동기 검증 파이프라인 (`everyAsync` / `someAsync`)

```js
const validators = [
  async (form) => (await isEmailAvailable(form.email)) === true,
  async (form) => form.password.length >= 8,
  async (form) => (await isBlocked(form.ip)) === false,
];

// 앞의 검증이 실패하면 나머지 검증은 호출하지 않습니다 (순차 + 단락)
const isValid = await fp.everyAsync((validate) => validate(form), validators);

// 하나라도 통과하면 즉시 true
const hasPermission = await fp.someAsync(
  (role) => checkPermission(user, role),
  ['admin', 'editor', 'viewer'],
);
```

### 4. 대량 요청을 나누어 순차 처리

```js
const chunks = fp.chunk(50, ids); // 50개씩 묶기

// 청크는 순차, 청크 안의 요청은 병렬 → 서버 부하를 제한
const results = await fp.reduceAsync(
  async (acc, chunk) => fp.concat(acc, await fp.mapAsync(fetchUser, chunk)),
  [],
  chunks,
);
```

### 5. 사용 가능한 첫 서버 찾기 (`findAsync`, `findKeyAsync`)

```js
const mirrors = ['https://a.example.com', 'https://b.example.com', 'https://c.example.com'];

// 처음으로 응답한 서버에서 멈춥니다 (나머지는 호출하지 않음)
const alive = await fp.findAsync(
  (url) => fetch(`${url}/health`).then((r) => r.ok).catch(() => false),
  mirrors,
);

// 객체에서는 key를 찾을 수 있습니다
const region = await fp.findKeyAsync(
  (url) => isHealthy(url),
  { seoul: 'https://kr.example.com', tokyo: 'https://jp.example.com' },
);
// => 'seoul' | 'tokyo' (없으면 undefined)
```

### 6. 배열에서 조건을 만족하는 위치 찾기 (`findIndexAsync`)

```js
const idx = await fp.findIndexAsync(
  async (task) => (await getStatus(task.id)) === 'failed',
  tasks,
);
// idx === -1 이면 실패한 작업 없음
const rest = idx === -1 ? tasks : fp.removeByIndex(idx, tasks);
```

### 7. 응답 객체를 안전하게 고정 (`deepFreeze`)

```js
const config = fp.deepFreeze(await loadConfig());
// 이후 config.a.b.c = 1 같은 변경 시도는 무시되거나(strict mode에서는 에러) 차단됩니다
```

## API 레퍼런스

표기: `T extends object`는 배열 또는 객체. 콜백의 `key`는 **배열이면 `number`, 객체이면 `string`** 입니다.

### 비동기 컬렉션

#### mapAsync

**병렬** 실행(`Promise.all`). 결과 순서는 입력 순서와 같습니다.

```ts
mapAsync<T extends object, R>(
  asyncMapper: (value: ValueOf<T>, key: KeyOf<T>) => R | Promise<R>,
  collection: T,
): Promise<R[]>
```

```js
const arr = [1, 2, 3, 4, 5];
await fp.mapAsync(async (v) => v * 2, arr); // 약 한 번의 지연 시간
// => [2, 4, 6, 8, 10]

await fp.mapAsync(async (v, k) => `${k}:${v}`, { a: 1, b: 2 });
// => ['a:1', 'b:2']
```

#### filterAsync

**병렬** 실행. `true`를 반환한 요소만 남깁니다 (원래 순서 유지).

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

**순차** 실행. lodash `reduce`와 같은 인자 `(acc, value, key)`로 동작하며, `acc`는 항상 **resolve된 값**입니다.

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

await fp.reduceAsync((acc, v) => acc + v, 0, [1, 2, 3]); // 동기 콜백도 가능
// => 6
```

#### forEachAsync

**순차** 실행. 콜백의 반환값을 모아 배열로 반환합니다.

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

**순차** 실행. 처음으로 `true`를 반환한 요소에서 **즉시 중단**합니다. 없으면 `undefined`.

```ts
findAsync<T extends object>(
  asyncFilter: (value: ValueOf<T>, key: KeyOf<T>) => boolean | Promise<boolean>,
  collection: T,
): Promise<ValueOf<T> | undefined>
```

```js
const users = [{ name: 'hi' }, { name: 'hello' }, { name: 'alo' }];
await fp.findAsync(async (u) => u.name === 'hello', users);
// => { name: 'hello' }
```

#### findIndexAsync

**순차** 실행. 처음 일치한 요소의 index. 없으면 `-1`. **배열 전용**입니다.

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

**순차** 실행. 처음 일치한 요소의 key. 없으면 `undefined`. **객체 전용**입니다.

```ts
findKeyAsync<T extends object>(
  asyncPredicate: (value: ValueOf<T>, key: KeyOf<T>) => boolean | Promise<boolean>,
  object: T,
): Promise<KeyOf<T> | undefined>
```

```js
await fp.findKeyAsync(async (v) => v === 2, { a: 1, b: 2, c: 3 });
// => 'b'
```

#### someAsync

**순차** 실행. 하나라도 `true`면 즉시 `true`. 빈 컬렉션은 `false`.

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

**순차** 실행. 하나라도 `false`면 즉시 `false`. 빈 컬렉션은 `true`.

```ts
everyAsync<T extends object>(
  asyncPredicate: (value: ValueOf<T>, key: KeyOf<T>) => boolean | Promise<boolean>,
  collection: T,
): Promise<boolean>
```

```js
await fp.everyAsync(async (v) => v > 0, [1, 2, 3]); // => true
await fp.everyAsync(async (v) => v < 3, [1, 2, 3]); // => false (3에서 중단)
```

### Promise 헬퍼

#### pipeAsync

`lodash/fp`의 `pipe`의 **비동기 버전**. 동기/비동기 함수를 섞어서 연결할 수 있고, 이전 단계가 반환한 Promise는 **resolve된 값이 다음 함수로 전달**됩니다. 결과는 항상 Promise.

- 첫 번째 함수만 여러 인자를 받을 수 있습니다.
- 중간에 에러가 나면 이후 함수는 실행되지 않고 reject 됩니다.
- 타입은 최대 8개 함수까지 단계별로 추론됩니다.

```ts
pipeAsync<A extends any[], B, C>(
  f1: (...args: A) => B | Promise<B>,
  f2: (arg: B) => C | Promise<C>,
): (...args: A) => Promise<C>
// ... f8 까지 오버로드
```

```js
const run = fp.pipeAsync(
  (a, b) => a + b, // 동기
  async (n) => n * 2, // 비동기
  (n) => `v${n}`,
);

await run(1, 2); // => 'v6'
```

`andThen`을 반복해서 끼우는 것보다 읽기 쉽습니다.

```js
// before
fp.pipe(fetchUser, fp.andThen(getPosts), fp.andThen(fp.map(fp.get('title'))));
// after
fp.pipeAsync(fetchUser, getPosts, fp.map(fp.get('title')));
```

#### promisify

값/함수/Promise를 Promise로 감쌉니다. **커링되지 않습니다** (첫 인자가 함수일 때만 나머지 인자를 함수에 전달).

```ts
promisify<A extends any[], R>(fn: (...args: A) => R, ...args: A): Promise<Awaited<R>>
promisify<R>(value: R | Promise<R>): Promise<Awaited<R>>
```

```js
await fp.promisify(128); // => 128
await fp.promisify((a, b) => a + b, 64, 64); // => 128
await fp.promisify(Promise.resolve(128)); // => 128
await fp.promisify(() => { throw new Error('x'); }); // reject
```

#### andThen

`Promise.then`을 `pipe`에서 쓸 수 있게 한 함수. 값이 Promise가 아니어도 동작합니다.

```ts
andThen<T, R>(successHandler: (response: T) => R | Promise<R>, thenable: T | Promise<T>): Promise<R>
```

```js
const composer = fp.pipe(fetchNumber, fp.andThen((x) => x / 2));
await composer(128);
```

#### otherwise

`Promise.catch`를 `pipe`에서 쓸 수 있게 한 함수. 핸들러의 반환값이 결과가 됩니다.

```ts
otherwise<E extends Error, T, R>(failureHandler: (error: E) => R | Promise<R>, thenable: T | Promise<T>): Promise<T | R>
```

```js
const safe = fp.pipe(riskyJob, fp.otherwise((e) => ({ error: e.message })));
await safe(); // 실패 시 { error: '...' }
```

#### finally

`Promise.finally`를 `pipe`에서 쓸 수 있게 한 함수. 성공/실패와 무관하게 실행되며 **결과값을 바꾸지 않습니다**.

```ts
finally<T>(callback: () => void | Promise<void>, thenable: T | Promise<T>): Promise<T>
```

```js
await fp.pipe(job, fp.finally(() => (loading = false)))();
```

#### delayAsync

**alias:** `sleep` — 지정한 ms 만큼 대기합니다.

```ts
delayAsync(ms: number): Promise<void>
```

```js
await fp.delayAsync(300);
```

### 타입 검사 / 불리언

#### isPromise

```ts
isPromise<T>(x: T): boolean
```

`then`과 `catch`가 모두 함수인 값만 `true` 입니다.

```js
fp.isPromise(Promise.resolve(1)); // => true
fp.isPromise(() => 1); // => false
```

#### isNotEmpty

`lodash.isEmpty`의 반대. **숫자는 항상 `false`** 입니다 (`isEmpty(1)`이 `true` 이므로).

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

JSON 문자열인지 확인합니다. 문자열이 아니면 `false`.

```js
fp.isJson('{ "test": "value" }'); // => true
fp.isJson('test'); // => false
fp.isJson({ test: 'value' }); // => false
```

#### isDatetimeString

`Date.parse`로 해석 가능한 문자열인지 확인합니다.

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

**alias:** `isReference` — `isVal`의 반대 (배열, 객체, 함수)

```js
fp.isRef({}); // => true
fp.isRef('str'); // => false
```

#### isFalsy

falsy(`0`, `-0`, `NaN`, `false`, `''`, `null`, `undefined`) 이면 `true`. 빈 배열/객체는 falsy 가 **아닙니다**.

```js
fp.isFalsy(''); // => true
fp.isFalsy([]); // => false
fp.isFalsy('0'); // => false
```

#### isTruthy

`isFalsy`의 반대.

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
fp.instanceOf(String, 'string'); // => false (원시값)
fp.instanceOf(String, new String('string')); // => true
fp.filter(fp.instanceOf(Car), vehicles); // 커링
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

> 문자열 `'false'`는 `true` 로 변환됩니다 (비어있지 않은 문자열).

#### notEquals

**alias:** `isNotEqual` — `lodash.isEqual`(깊은 비교)의 반대.

```js
fp.notEquals({ a: 1 }, { a: 1 }); // => false
fp.notEquals([1, 2, 3], [2, 3, 4]); // => true
```

#### notIncludes

`lodash.includes`의 반대. 배열, 문자열, 객체(값)를 지원합니다.

```js
fp.notIncludes(1, [1, 2, 3]); // => false
fp.notIncludes('s', 'string'); // => false
fp.notIncludes(1, { a: 1, b: 2 }); // => false
fp.notIncludes(9, [1, 2, 3]); // => true
```

### 객체

#### key

**alias:** `keyByVal` — 값(깊은 비교)으로 key 를 찾습니다. 값이 여러 개면 **처음** 일치하는 key, 없으면 `undefined`.

```ts
key<T extends object>(obj: T, value: ValueOf<T>): KeyOf<T> | undefined
```

```js
fp.key({ a: 1, b: 1 }, 1); // => 'a'
fp.key({ a: { b: { k: 1 } } }, { b: { k: 1 } }); // => 'a'
fp.key({ a: 1 }, 2); // => undefined
```

#### deepFreeze

중첩된 객체/배열/함수까지 재귀적으로 `Object.freeze` 합니다. 입력 객체 자체를 freeze 하여 반환합니다.

```js
const frozen = fp.deepFreeze({ a: { b: [], c: () => {} } });
Object.isFrozen(frozen.a); // => true
Object.isFrozen(frozen.a.b); // => true
```

> 순환 참조 객체와 이미 freeze 된 하위 객체는 건너뜁니다. 대규모 객체에서는 비용이 있으니 한 번만 호출하세요.

#### transformObjectKey

모든 key를 변환 함수로 바꿉니다. **중첩 객체와 배열 안의 객체까지** 재귀적으로 변환하고, 변환 후 key가 **중복되면 에러**를 던집니다.

```ts
transformObjectKey<T extends object>(transformFn: (originStr: string) => string, obj: T): Record<string, any>
```

```js
fp.transformObjectKey(fp.kebabCase, { objKey: { nestedKey: [{ anotherKey: 3 }] } });
// => { 'obj-key': { 'nested-key': [{ 'another-key': 3 }] } }

fp.transformObjectKey(fp.kebabCase, { 'obj-key': 1, obj_key: 2 });
// => Error: obj-key already exist. duplicated property name is not supported.
```

> 변환 결과 key 가 `a.b` 처럼 lodash path 로 해석되면 중첩 객체로 만들어집니다.

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

`lodash/fp`의 `getOr`를 덮어쓴 버전. 경로의 값이 **`undefined` 뿐 아니라 `null` 이어도 기본값**을 반환합니다.

```js
fp.getOr('def', 'a.b', { a: { b: null } }); // => 'def'  (lodash/fp 는 null)
fp.getOr('def', 'a.b', { a: { b: 1 } }); // => 1
fp.getOr('def', 'a.b', null); // => 'def'
```

### 문자열

#### pascalCase

```js
fp.map(fp.pascalCase, ['__Foo_Bar__', 'FOO BAR', 'fooBar', 'foo_bar', 'foo-bar']);
// => ['FooBar', 'FooBar', 'FooBar', 'FooBar', 'FooBar']
```

### 배열

#### removeByIndex

index 의 요소를 제거한 **새 배열**을 반환합니다 (원본 불변, 요소는 구조 공유). 범위를 벗어나거나 숫자로 해석되지 않는 index 면 원본을 그대로 반환합니다. 음수는 뒤에서부터입니다.

```ts
removeByIndex<R>(index: number | string, targetArray: R[]): R[]
```

```js
const arr = [1, 2, 3];
fp.removeByIndex(1, arr); // => [1, 3]
arr; // => [1, 2, 3]
fp.removeByIndex(-1, arr); // => [1, 2]
fp.removeByIndex(99, arr); // => arr (그대로)
```

#### removeLast

배열 또는 문자열의 마지막 요소(글자)를 제거합니다. **커링되지 않습니다.**

```js
fp.removeLast([1, 2, 3]); // => [1, 2]
fp.removeLast('abc'); // => 'ab'
```

#### append

`fp.concat` 의 별칭. 요소 또는 배열을 뒤에 추가합니다.

```js
fp.append([1], 2); // => [1, 2]
fp.append([1], [2, 3]); // => [1, 2, 3]
```

#### prepend

요소 또는 배열을 **앞에** 추가합니다.

```js
fp.prepend([1], 2); // => [2, 1]
fp.prepend([1], [2, 3]); // => [2, 3, 1]
fp.prepend([1])(0); // => [0, 1]
```

### key와 함께 순회

lodash/fp 의 `map`, `forEach`, `reduce`는 기본적으로 콜백 인자가 1개(capped)입니다. 아래 함수는 `(value, key)`를 모두 받습니다. 배열의 key는 `number`, 객체는 `string` 입니다.

#### mapWithKey

**alias:** `mapWithIndex`

```js
const getKeys = fp.mapWithKey((v, k) => k);
getKeys([3, 4, 5]); // => [0, 1, 2]
getKeys({ a: 1, b: 2 }); // => ['a', 'b']
```

#### forEachWithKey

**alias:** `forEachWithIndex` — 부수효과용. 입력을 그대로 반환합니다.

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

### 기타

#### ap

`pipe` 안에서 **인자 순서를 바꿔** 적용할 때 사용합니다 ([applicative functor](https://github.com/monet/monet.js/blob/master/docs/MAYBE.md#ap) 의 `ap` 에서 영감).

```js
const includesWithAp = fp.pipe(fp.includes, fp.ap('string'));
includesWithAp('i'); // => true  (fp.includes('i', 'string'))
```

## TypeScript

콜백의 인자/반환 타입이 제네릭으로 자동 추론되며, 공개 타입에 `unknown`·`never`가 나타나지 않습니다. 결과가 없을 수 있는 함수(`findAsync`, `findKeyAsync`, `key`)만 반환 타입에 `| undefined`가 명시됩니다.

```ts
import fpEx from 'lodash-fp-ex';

// 반환 타입: Promise<string[]>
const names = await fpEx.mapAsync(async (id: number) => `user-${id}`, [1, 2]);

// 객체의 key 는 string, 반환 타입은 key 유니온: Promise<'a' | 'b' | undefined>
const k = await fpEx.findKeyAsync(async (v: number) => v > 1, { a: 1, b: 2 });

// pipeAsync: 각 단계의 resolve 된 타입이 이어집니다
const run = fpEx.pipeAsync(
  (a: number, b: number) => a + b, // (a, b) => number
  async (n: number) => String(n), //            number → string
  (s: string) => s.length, //                    string → number
);
// run: (a: number, b: number) => Promise<number>

// 부분 적용도 추론됩니다
const toStr = fpEx.mapAsync((v: number) => String(v));
await toStr([1, 2]); // string[]
```

> `reduceAsync`의 콜백 `acc` 는 resolve 된 값의 타입(`A`)입니다.

## 마이그레이션 노트

이전 버전에서 올라오는 경우 확인하세요.

- **`reduceAsync`**: 콜백의 `acc`가 이제 **Promise 가 아닌 resolve 된 값**입니다. `await accP`를 하던 코드는 그대로 동작하지만, TypeScript 에서 `acc`를 `Promise<T>`로 선언했다면 `T`로 바꿔야 합니다.
- **`findAsync` / `findKeyAsync` / `key` 타입**: 일치 항목이 없을 수 있으므로 반환 타입에 `| undefined`가 명시됩니다. TypeScript 에서 결과를 그대로 사용하던 코드는 `undefined` 처리를 추가해야 컴파일됩니다.
- **`findAsync`**: 이제 **순차 실행 + 첫 일치에서 중단**됩니다. 필터가 던진 에러는 `undefined`로 삼키지 않고 reject 합니다.
- **`removeByIndex` / `removeLast`**: 깊은 복사 대신 **구조 공유**(새 배열, 요소 공유)로 바뀌었습니다. 원본 배열은 변경되지 않습니다.
- **`removeLast('abc')`**: 이전에는 문자열이 잘리지 않던 버그가 수정되어 `'ab'`를 반환합니다.
- **패키지 구조**: 번들이 `dist/`(ESM `index.mjs`, CJS `index.cjs`, 타입 `index.d.mts`/`index.d.cts`)로 바뀌고 `exports`가 추가되었습니다. `lodash-fp-ex/index` 같은 깊은 경로 import 는 더 이상 되지 않습니다.
- **tsconfig**: 타입 해석에는 `moduleResolution`이 `node16`/`nodenext`/`bundler` 인 환경을 권장합니다 (`exports` 의 `types` 조건 사용).

## 개발

```bash
pnpm install
pnpm test           # 단위 + 타입 테스트 (vp test run)
pnpm test:watch
pnpm typecheck      # tsc --noEmit
pnpm build          # vp pack → dist/
pnpm bench          # 성능 벤치마크
pnpm bench:clone    # 복사 방식 비교 벤치마크
```

- 패키지 매니저: **pnpm**
- 번들/테스트: **Vite+** (`vp pack`, `vp test`)

## License

MIT
