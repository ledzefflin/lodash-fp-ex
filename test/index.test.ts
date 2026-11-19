import { describe, expect, it } from 'vite-plus/test';
import {
  camelCase,
  concat,
  equals,
  every,
  get,
  head,
  identity,
  includes,
  kebabCase,
  keys,
  map,
  pipe,
  reduce,
  snakeCase,
} from 'lodash/fp';
import * as lodashFp from 'lodash/fp';
import lodashFpEx from '../lib/index';

/** lodash/fp 에 mixin 해서 사용하는 실제 사용 방식 그대로 테스트 */
type MixinFp = typeof lodashFp & {
  mixin: (source: typeof lodashFpEx) => Record<string, Function>;
};
const { mixin } = lodashFp as MixinFp;
const fp = mixin(lodashFpEx);
const f = lodashFpEx;

const nums = [1, 2, 3, 4, 5];
const later = <T>(value: T, ms = 1): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));
const duplicatedKeyMessage = (transform: (s: string) => string, o: object) =>
  `${pipe(keys, head, transform)(o)} already exist. duplicated property name is not supported.`;

describe('mixin', () => {
  it('lodash/fp 에 모든 확장 함수가 추가된다', () => {
    const names = Object.keys(lodashFpEx);
    expect(names.length).toBeGreaterThan(0);
    names.forEach((name) =>
      expect(typeof fp[name]).toBe('function'),
    );
  });
});

describe('not / toBool / isFalsy / isTruthy', () => {
  it.each<[input: object | string | number | boolean | null | undefined, expected: boolean]>([
    [true, false],
    ['str', false],
    [{}, false],
    [false, true],
    [undefined, true],
    [null, true],
    [0, true],
  ])('not(%j) → %j', (input, expected) => {
    expect(f.not(input)).toBe(expected);
  });

  it.each<[input: number | null | undefined, expected: boolean]>([
    [1, true],
    [0, false],
    [null, false],
    [undefined, false],
  ])('toBool(%j) → %j', (input, expected) => {
    expect(f.toBool(input)).toBe(expected);
  });

  const falsies = [undefined, null, 0, -0, NaN, false, ''];
  const notFalsies = [[], '0', 'false', {}, () => {}];

  it('isFalsy: falsy 값은 true, 그 외는 false', () => {
    expect(every(f.isFalsy, falsies)).toBe(true);
    expect(some_(f.isFalsy, notFalsies)).toBe(false);
  });

  it('isTruthy: isFalsy 의 반대', () => {
    expect(some_(f.isTruthy, falsies)).toBe(false);
    expect(every(f.isTruthy, notFalsies)).toBe(true);
  });
});

/** lodash some 대신 테스트 가독성을 위한 헬퍼 */
function some_<T>(predicate: (v: T) => boolean, list: T[]): boolean {
  return list.some(predicate);
}

describe('type predicates', () => {
  it('isNotEmpty: 비어있지 않은 컬렉션만 true (숫자는 항상 false)', () => {
    expect(f.isNotEmpty([1])).toBe(true);
    expect(f.isNotEmpty({ a: 1 })).toBe(true);
    expect(f.isNotEmpty('a')).toBe(true);
    [[], {}, 1, '', null, undefined].forEach((v) =>
      expect(f.isNotEmpty(v)).toBe(false),
    );
  });

  it('isNotNil', () => {
    [null, undefined].forEach((v) => expect(f.isNotNil(v)).toBe(false));
    [1, {}, () => 1].forEach((v) => expect(f.isNotNil(v)).toBe(true));
  });

  it('isJson', () => {
    expect(f.isJson('{ "test": "value" }')).toBe(true);
    expect(f.isJson('test')).toBe(false);
    expect(f.isJson({ test: 'value' } as never)).toBe(false);
  });

  it('isVal / isPrimitive', () => {
    [null, undefined, false, 1, 'string'].forEach((v) =>
      expect(f.isVal(v)).toBe(true),
    );
    [[], {}, () => {}].forEach((v) => expect(f.isVal(v)).toBe(false));
    expect(f.isPrimitive).toBe(f.isVal);
  });

  it('isRef / isReference', () => {
    [null, undefined, false, 1, 'string'].forEach((v) =>
      expect(f.isRef(v)).toBe(false),
    );
    [[], {}, () => {}].forEach((v) => expect(f.isRef(v)).toBe(true));
    expect(f.isReference).toBe(f.isRef);
  });

  it('isPromise', () => {
    expect(f.isPromise(Promise.resolve(1))).toBe(true);
    [() => 1, '1', 1, null, undefined].forEach((v) =>
      expect(f.isPromise(v)).toBe(false),
    );
  });

  it('isDatetimeString', () => {
    const valid = [
      'Aug 9, 1995',
      'Wed, 09 Aug 1995 00:00:00 GMT',
      '2021/03/14',
      '2021-03-14',
      '2021-03-14 14:21:00',
      '06 Mar 2017 21:22:23 Z',
      'Mon, 06 Mar 2017 21:22:23 +0000',
    ];
    const invalid = ['21:22:23', '20210314'];
    expect(every(f.isDatetimeString, valid)).toBe(true);
    expect(some_(f.isDatetimeString, invalid)).toBe(false);
  });

  it('instanceOf', () => {
    class Car {
      constructor(public make: string) {}
    }
    class C {}
    class D {}
    const auto = new Car('Honda');

    expect(f.instanceOf(Car, auto)).toBe(true);
    expect(f.instanceOf(Object, auto)).toBe(true);
    expect(f.instanceOf(C, new C())).toBe(true);
    expect(f.instanceOf(C, new D())).toBe(false);
    expect(f.instanceOf(String, 'string')).toBe(false);
    expect(f.instanceOf(String, new String('string'))).toBe(true);
    // 부분 적용
    expect(f.instanceOf(C)(new C())).toBe(true);
  });
});

describe('equality / inclusion', () => {
  it('notEquals / isNotEqual: deep 비교의 반대', () => {
    expect(f.notEquals({ a: 1 }, { a: 1 })).toBe(false);
    expect(f.notEquals([1, 2, 3], [1, 2, 3])).toBe(false);
    expect(f.isNotEqual([1, 2, 3], [2, 3, 4])).toBe(true);
    expect(f.isNotEqual('string', 'number')).toBe(true);
    expect(f.isNotEqual(1)(2)).toBe(true);
  });

  it('notIncludes: includes 의 반대 (배열/문자열/객체)', () => {
    expect(f.notIncludes(1, [1, 2, 3])).toBe(false);
    expect(f.notIncludes(4, [1, 2, 3])).toBe(true);
    expect(f.notIncludes('s', 'string')).toBe(false);
    expect(f.notIncludes(1, { a: 1, b: 2 })).toBe(false);
  });
});

describe('promise helpers', () => {
  it('promisify: 값 / 함수 / Promise 를 Promise 로 lift', async () => {
    const results = await Promise.all([
      f.promisify(128),
      f.promisify((a: number, b: number) => a + b, 64, 64),
      f.promisify(Promise.resolve(128)),
    ]);
    expect(results).toEqual([128, 128, 128]);
    [() => 1, '1', 1, null, undefined].forEach((v) =>
      expect(f.promisify(v as never)).toBeInstanceOf(Promise),
    );
  });

  it('promisify: 함수가 throw 하면 reject', async () => {
    await expect(
      f.promisify(() => {
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');
  });

  it('andThen', async () => {
    const double = (a: number) => later(2 * a);
    const composed = pipe(double, f.andThen(identity));

    expect(await composed(64)).toBe(128);
    expect(await f.andThen(identity, double(64))).toBe(128);
    expect(await pipe(double, f.andThen((x: number) => x / 2))(128)).toBe(128);
  });

  describe('otherwise', () => {
    const squareOrFail = (a: number) =>
      new Promise<number>((resolve, reject) =>
        setTimeout(
          () => (a * a === a ? resolve(a) : reject(new Error('wrong'))),
          1,
        ),
      );
    const composed = pipe(squareOrFail, f.andThen(identity), f.otherwise(identity));

    it('reject 되면 에러를 handler 로 전달', async () => {
      const result = await composed(2);
      expect(result).toBeInstanceOf(Error);
      expect(get('message', result)).toBe('wrong');
    });

    it('resolve 되면 값을 그대로 전달', async () => {
      expect(await composed(1)).toBe(1);
    });
  });

  it('finally: 성공/실패와 무관하게 callback 실행', async () => {
    const calls: string[] = [];
    const fail = () => Promise.reject(new Error('x'));

    await pipe(
      () => later(1),
      f.finally(() => {
        calls.push('ok');
      }),
    )();
    await pipe(
      fail,
      f.otherwise(identity),
      f.finally(() => {
        calls.push('fail');
      }),
    )();

    expect(calls).toEqual(['ok', 'fail']);
  });

  it('delayAsync / sleep: 지정 시간 이후 resolve', async () => {
    const start = Date.now();
    await f.delayAsync(20);
    expect(Date.now() - start).toBeGreaterThanOrEqual(15);
    expect(f.sleep).toBe(f.delayAsync);
  });
});

describe('async collection helpers', () => {
  it('mapAsync: 배열/객체 + key 전달', async () => {
    const mapper = (v: number, k: number | string) => later(`${v}${k}`);
    expect(await f.mapAsync(mapper, nums)).toEqual([
      '10',
      '21',
      '32',
      '43',
      '54',
    ]);
    expect(await f.mapAsync(mapper, { a: 1, b: 2, c: 3 })).toEqual([
      '1a',
      '2b',
      '3c',
    ]);
  });

  it('mapAsync: 부분 적용 (curry)', async () => {
    const doubleAll = f.mapAsync((v: number) => later(v * 2));
    expect(await doubleAll(nums)).toEqual([2, 4, 6, 8, 10]);
  });

  it('mapAsync: 동기 mapper 도 허용', async () => {
    expect(await f.mapAsync((v: number) => v + 1, nums)).toEqual([2, 3, 4, 5, 6]);
  });

  it('mapAsync: 병렬 실행 (총 시간이 순차 합보다 짧다)', async () => {
    const start = Date.now();
    await f.mapAsync((v: number) => later(v, 30), nums);
    expect(Date.now() - start).toBeLessThan(120);
  });

  it('filterAsync', async () => {
    const odd = (v: number) => later(v % 2 !== 0);
    expect(await f.filterAsync(odd, nums)).toEqual([1, 3, 5]);
    expect(await f.filterAsync((_v: number, i: number) => later(i > 0), nums)).toEqual([2, 3, 4, 5]);
  });

  it('filterAsync: 값이 false 인 요소도 보존 (false 센티널 버그 방지)', async () => {
    expect(await f.filterAsync(() => later(true), [false, 0, '', 1])).toEqual([false, 0, '', 1]);
  });

  it('findAsync', async () => {
    const people = [
      { name: 'hi', age: 21 },
      { name: 'hello', age: 22 },
      { name: 'alo', age: 23 },
    ];
    const byName = (p: { name: string }) =>
      later(pipe(get('name'), equals('hello'))(p));

    expect(await f.findAsync(byName, people)).toEqual({ name: 'hello', age: 22 });
    expect(await f.findAsync((_v: number, i: number) => later(i === 3), nums)).toBe(4);
  });

  it('findAsync: 일치 항목이 없으면 undefined', async () => {
    expect(await f.findAsync((v: number) => later(v > 100), nums)).toBeUndefined();
  });

  it('reduceAsync: reduce 와 동일한 인자 (acc, value, key), 순차 누적', async () => {
    const doubled = await f.reduceAsync(
      async (acc: number[], v: number) => [...acc, await later(v * 2)],
      [] as number[],
      nums,
    );
    expect(doubled).toEqual([2, 4, 6, 8, 10]);

    const idxs = await f.reduceAsync(
      (acc: number[], _v: number, i: number) => (i > 0 ? [...acc, i] : acc),
      [] as number[],
      nums,
    );
    expect(idxs).toEqual([1, 2, 3, 4]);
  });

  it('reduceAsync: acc 는 resolve 된 값으로 전달 (Promise 아님)', async () => {
    const seen: boolean[] = [];
    await f.reduceAsync(
      async (acc: number, v: number) => {
        seen.push(f.isPromise(acc));
        return acc + v;
      },
      0,
      nums,
    );
    expect(seen).toEqual([false, false, false, false, false]);
  });

  it('reduceAsync: 초기값이 Promise 이거나 객체 collection 이어도 동작', async () => {
    expect(
      await f.reduceAsync(
        async (acc: string, v: number, k: string) => `${acc}${k}${v}`,
        later(''),
        { a: 1, b: 2 },
      ),
    ).toBe('a1b2');
  });

  it('reduceAsync: 순차 실행 (이전 단계가 끝나야 다음 단계 시작)', async () => {
    const order: number[] = [];
    await f.reduceAsync(
      async (acc: number, v: number) => {
        await later(null, 6 - v);
        order.push(v);
        return acc;
      },
      0,
      nums,
    );
    expect(order).toEqual(nums);
  });

  it('reduceAsync: 부분 적용 및 callback 에러는 reject', async () => {
    const sum = f.reduceAsync((acc: number, v: number) => acc + v, 0);
    expect(await sum(nums)).toBe(15);
    await expect(
      f.reduceAsync(
        async () => {
          throw new Error('boom');
        },
        0,
        nums,
      ),
    ).rejects.toThrow('boom');
  });

  it('forEachAsync: 순차 실행, 배열은 number key / 객체는 string key', async () => {
    expect(await f.forEachAsync((v: number, i: number) => later(i > 0 ? v * i : v), nums)).toEqual([1, 2, 6, 12, 20]);
    expect(await f.forEachAsync((_v: number, i: number) => later(i), nums)).toEqual([0, 1, 2, 3, 4]);
    expect(
      await f.forEachAsync((v: string, k: string) => later(`${v} ${k}`), {
        key: 'val',
        hello: 'world',
      }),
    ).toEqual(['val key', 'world hello']);
  });

  it('forEachAsync: 호출 순서가 보장된다', async () => {
    const order: number[] = [];
    await f.forEachAsync(async (v: number) => {
      await later(null, 6 - v);
      order.push(v);
    }, nums);
    expect(order).toEqual(nums);
  });
});

describe('object helpers', () => {
  it('key / keyByVal: 값으로 key 조회 (deep equal)', () => {
    expect(f.key({ a: 1 }, 1)).toBe('a');
    expect(f.keyByVal({ a: 1, b: 2 }, 2)).toBe('b');
    expect(f.key({ a: { b: { k: 1 } } }, { b: { k: 1 } })).toBe('a');
    expect(f.key({ a: { b: { k: 1 } } }, { b: { k: 2 } })).toBeUndefined();
  });

  it('deepFreeze: 중첩된 참조 타입까지 freeze', () => {
    const shallow = Object.freeze({ a: { b: [] as number[] } });
    const deep = f.deepFreeze({ a: { b: [] as number[], c: () => {} } });

    expect(Object.isFrozen(shallow)).toBe(true);
    expect(Object.isFrozen(shallow.a)).toBe(false);

    expect(Object.isFrozen(deep)).toBe(true);
    expect(Object.isFrozen(deep.a)).toBe(true);
    expect(Object.isFrozen(deep.a.b)).toBe(true);
    expect(Object.isFrozen(deep.a.c)).toBe(true);
  });

  describe('transformObjectKey', () => {
    it('중첩 객체/배열 안의 key 까지 변환', () => {
      expect(keys(f.transformObjectKey(kebabCase, { obj_key: 1 }))).toEqual(['obj-key']);
      expect(
        f.transformObjectKey(kebabCase, {
          objKey: { nestedKey: { anotherKey: [3] } },
        }),
      ).toEqual({ 'obj-key': { 'nested-key': { 'another-key': [3] } } });
      expect(
        f.transformObjectKey(kebabCase, { list: [{ itemKey: 1 }] }),
      ).toEqual({ list: [{ 'item-key': 1 }] });
    });

    it('원본 객체를 변경하지 않는다', () => {
      const origin = { obj_key: 1 };
      f.transformObjectKey(kebabCase, origin);
      expect(origin).toEqual({ obj_key: 1 });
    });

    it('변환 후 key 가 중복되면 에러', () => {
      const dup = { 'obj-key': 1, obj_key: 2 };
      expect(() => f.transformObjectKey(kebabCase, dup)).toThrow(
        duplicatedKeyMessage(kebabCase, dup),
      );
    });

    it('부분 적용 (curry)', () => {
      expect(f.transformObjectKey(snakeCase)({ objKey: 1 })).toEqual({ obj_key: 1 });
    });
  });

  type KeyCase = [
    name: string,
    convert: (o: object) => object,
    input: object,
    expectedKeys: string[],
    duplicated: object,
    transform: (s: string) => string,
  ];
  it.each<KeyCase>([
    ['toCamelKey / toCamelcase', f.toCamelKey, { obj_key: 1 }, ['objKey'], { 'obj-key': 1, obj_key: 2 }, camelCase],
    ['toSnakeKey / toSnakecase', f.toSnakeKey, { objKey: 1 }, ['obj_key'], { objKey: 1, 'obj key': 2 }, snakeCase],
  ])('%s', (_name, convert, input, expectedKeys, duplicated, transform) => {
    expect(keys(convert(input))).toEqual(expectedKeys);
    expect(() => convert(duplicated)).toThrow(duplicatedKeyMessage(transform, duplicated));
  });

  it('별칭은 동일한 함수를 가리킨다', () => {
    expect(f.toCamelcase).toBe(f.toCamelKey);
    expect(f.toSnakecase).toBe(f.toSnakeKey);
    expect(f.keyByVal).toBe(f.key);
  });

  it('toPascalcase', () => {
    expect(f.toPascalcase({ foo_bar: { baz_qux: 1 } })).toEqual({
      FooBar: { BazQux: 1 },
    });
  });

  it('pascalCase', () => {
    const results = map(f.pascalCase, [
      '__Foo_Bar__',
      'FOO BAR',
      'fooBar',
      'foo_bar',
      'foo-bar',
    ]);
    expect(every(equals('FooBar'), results)).toBe(true);
  });
});

describe('성능 개선 후 동작 동일성', () => {
  it('transformObjectKey: path 로 해석되는 key / prototype key 처리 유지', () => {
    expect(f.transformObjectKey((k) => `${k}.x`, { a: 1 })).toEqual({ a: { x: 1 } });
    const polluted = f.transformObjectKey(() => '__proto__', { a: { polluted: true } });
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect(Object.keys(polluted)).toEqual([]);
  });

  it('transformObjectKey: 최상위 배열 / 원시값', () => {
    expect(f.transformObjectKey(kebabCase, [{ aB: 1 }])).toEqual({ '0': { 'a-b': 1 } });
    expect(f.transformObjectKey(kebabCase, 1 as never)).toBe(1);
  });

  it('mapAsync / filterAsync / reduceAsync: 빈 컬렉션과 null', async () => {
    expect(await f.mapAsync((v: number) => v, [])).toEqual([]);
    expect(await f.mapAsync((v: number) => v, null as never)).toEqual([]);
    expect(await f.filterAsync(() => true, {})).toEqual([]);
    expect(await f.reduceAsync((a: number) => a, 7, [])).toBe(7);
  });

  it('mapAsync: mapper 가 동기 throw 하면 reject', async () => {
    await expect(
      f.mapAsync(() => {
        throw new Error('sync boom');
      }, [1]),
    ).rejects.toThrow('sync boom');
  });

  it('removeByIndex: 범위 밖/음수/NaN index', () => {
    const arr = [1, 2, 3];
    expect(f.removeByIndex(99, arr)).toBe(arr);
    expect(f.removeByIndex('x', arr)).toBe(arr);
    expect(f.removeByIndex(-1, arr)).toEqual([1, 2]);
    expect(f.removeByIndex(3, arr)).toEqual([1, 2, 3]);
  });

  it('isFalsy: bigint 0n 은 기존과 동일하게 false', () => {
    expect(f.isFalsy(BigInt(0))).toBe(false);
  });

  it('key: null / 일치 없음 은 undefined', () => {
    expect(f.key(null as never, 1 as never)).toBeUndefined();
  });

  it('deepFreeze: 이미 frozen 인 중첩 객체와 원시값', () => {
    const inner = Object.freeze({ x: [1] });
    const frozen = f.deepFreeze({ inner });
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(f.deepFreeze(1 as never)).toBe(1);
  });
});

describe('ap', () => {
  it('pipe 안에서 인자 순서를 바꿔 적용', () => {
    const includesWithAp = pipe(includes, f.ap('string'));
    const reduceWithAp = pipe(reduce, f.ap(['f', 'o', 'o']));

    expect(includesWithAp('i')).toBe(true);
    expect(reduceWithAp((acc: string, v: string) => `${acc}${v}`, '')).toBe('foo');
  });
});

describe('array helpers', () => {
  it('removeByIndex: 불변, 해당 index 제거', () => {
    const arr = [1, 2, 3];
    expect(f.removeByIndex(1, arr)).toEqual([1, 3]);
    expect(f.removeByIndex('0')(arr)).toEqual([2, 3]);
    expect(arr).toEqual([1, 2, 3]);
  });

  it('removeLast: 배열의 마지막 요소 제거 (불변)', () => {
    const arr = [1, 2, 3];
    expect(f.removeLast(arr)).toEqual([1, 2]);
    expect(arr).toEqual([1, 2, 3]);
  });

  it('removeLast: 문자열의 마지막 글자 제거', () => {
    expect(f.removeLast('abc')).toBe('ab');
    expect(f.removeLast('a')).toBe('');
    expect(f.removeLast('')).toBe('');
  });

  it('removeLast: 요소 객체도 원본과 분리된 복사본', () => {
    const origin = [{ a: 1 }, { a: 2 }];
    const result = f.removeLast(origin);
    expect(result).toEqual([{ a: 1 }]);
    expect(result[0]).not.toBe(origin[0]);
  });

  it('removeLast: 빈 배열은 그대로 빈 배열', () => {
    expect(f.removeLast([])).toEqual([]);
  });

  it('append: 불변, 요소/배열 모두 추가', () => {
    const arr = [1];
    expect(f.append(arr, 2)).toEqual([1, 2]);
    expect(f.append(arr, [2, 3, 4])).toEqual([1, 2, 3, 4]);
    expect(arr).toEqual([1]);
  });

  it('prepend: 불변, 앞쪽에 추가', () => {
    const arr = [1];
    expect(f.prepend(arr, 2)).toEqual([2, 1]);
    expect(f.prepend(arr, [2, 3, 4])).toEqual([2, 3, 4, 1]);
    expect(f.prepend(arr)(0)).toEqual([0, 1]);
    expect(arr).toEqual([1]);
  });
});

describe('WithKey helpers', () => {
  const arr = [3, 4, 5];

  it('mapWithKey / mapWithIndex', () => {
    const getKeys = f.mapWithKey((_v: number, k: number | string) => k);
    expect(getKeys(arr)).toEqual([0, 1, 2]);
    expect(getKeys({ a: 1, b: 2 })).toEqual(['a', 'b']);
    expect(f.mapWithIndex).toBe(f.mapWithKey);
  });

  it('forEachWithKey / forEachWithIndex: 대상을 그대로 반환', () => {
    const seen: (number | string)[] = [];
    const each = f.forEachWithKey((_v: number, k: number | string) => {
      seen.push(k);
    });
    expect(each(arr)).toEqual(arr);
    expect(each({ a: 1, b: 2 })).toEqual({ a: 1, b: 2 });
    expect(seen).toEqual([0, 1, 2, 'a', 'b']);
    expect(f.forEachWithIndex).toBe(f.forEachWithKey);
  });

  it('reduceWithKey / reduceWithIndex', () => {
    const collectKeys = f.reduceWithKey(
      (acc: (number | string)[], _v: number, k: number | string) => concat(acc, k),
      [],
    );
    expect(collectKeys(arr)).toEqual([0, 1, 2]);
    expect(collectKeys({ a: 1, b: 2 })).toEqual(['a', 'b']);
    expect(f.reduceWithIndex).toBe(f.reduceWithKey);
  });
});

describe('getOr', () => {
  it('값이 없거나 null 이면 기본값 반환', () => {
    expect(f.getOr('def', 'a.b', { a: { b: 1 } })).toBe(1);
    expect(f.getOr('def', 'a.b', { a: { b: null } })).toBe('def');
    expect(f.getOr('def', 'a.b', {})).toBe('def');
    expect(f.getOr('def', 'a.b', null as never)).toBe('def');
  });
});
