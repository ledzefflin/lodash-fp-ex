import { describe, expectTypeOf, it } from 'vite-plus/test';
import fp from '../lib/index';

describe('타입 추론', () => {
  it('mapAsync: mapper 반환 타입으로 결과 배열 타입 추론', () => {
    expectTypeOf(fp.mapAsync(async (v: number) => String(v), [1, 2])).toEqualTypeOf<
      Promise<string[]>
    >();
    expectTypeOf(
      fp.mapAsync((v: number, k: string) => v + k.length, { a: 1 }),
    ).toEqualTypeOf<Promise<number[]>>();
  });

  it('mapAsync: 부분 적용', () => {
    const toStr = fp.mapAsync((v: number) => String(v));
    expectTypeOf(toStr([1, 2])).toEqualTypeOf<Promise<string[]>>();
  });

  it('filterAsync / findAsync: 요소 타입 보존', () => {
    expectTypeOf(
      fp.filterAsync(async (v: { id: number }) => v.id > 0, [{ id: 1 }]),
    ).toEqualTypeOf<Promise<{ id: number }[]>>();
    expectTypeOf(fp.findAsync(async (v: string) => v === 'a', ['a'])).toEqualTypeOf<
      Promise<string>
    >();
  });

  it('reduceAsync: 누적기 타입 추론', () => {
    expectTypeOf(
      fp.reduceAsync(async (acc: number, v: number) => acc + v, 0, [1]),
    ).toEqualTypeOf<Promise<number>>();
  });

  it('key: 객체의 key 유니온 반환', () => {
    expectTypeOf(fp.key({ a: 1, b: 2 }, 1)).toEqualTypeOf<'a' | 'b'>();
  });

  it('removeLast / prepend: 요소 타입 보존', () => {
    expectTypeOf(fp.removeLast('abc')).toEqualTypeOf<string>();
    expectTypeOf(fp.removeLast([1, 2])).toEqualTypeOf<number[]>();
    expectTypeOf(fp.prepend([1], 0)).toEqualTypeOf<number[]>();
  });

  it('deepFreeze: Readonly 반환', () => {
    expectTypeOf(fp.deepFreeze({ a: 1 })).toEqualTypeOf<Readonly<{ a: number }>>();
  });

  it('andThen / otherwise / finally', () => {
    expectTypeOf(fp.andThen((x: number) => String(x), Promise.resolve(1))).toEqualTypeOf<
      Promise<string>
    >();
    expectTypeOf(fp.finally(() => {}, Promise.resolve(1))).toEqualTypeOf<Promise<number>>();
  });

  it('promisify: 함수 반환값을 Awaited 로 풀어낸다', () => {
    expectTypeOf(fp.promisify((a: number, b: number) => a + b, 1, 2)).toEqualTypeOf<
      Promise<number>
    >();
    expectTypeOf(fp.promisify(Promise.resolve('x'))).toEqualTypeOf<Promise<string>>();
  });

  it('mapWithKey: 배열은 number, 객체는 string key', () => {
    expectTypeOf(fp.mapWithKey((v: number, k: number) => v + k, [1])).toEqualTypeOf<
      number[]
    >();
  });
});
