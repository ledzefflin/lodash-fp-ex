import {
  concat,
  isNil,
  isString,
  isBoolean,
  attempt,
  isNumber,
  isError,
  pipe,
  get,
  isFunction,
  isPlainObject,
  isArray,
  curry,
  isEmpty,
  equals,
  upperFirst,
  camelCase,
  entries,
  toNumber,
  map,
  reduce,
  find,
  forOwn,
  has,
  set,
  isObject,
  includes,
  snakeCase,
  forEach,
  getOr as _getOr,
  isArrayLike,
  keys,
} from 'lodash/fp';
import type {
  LodashMap,
  LodashForEach,
  LodashReduce,
  LodashConcat,
} from 'lodash/fp';

/** 배열이면 요소 타입, 객체면 속성값 타입 추론 */
type ValueOf<T> = T extends readonly (infer V)[] ? V : T[keyof T];
/** 배열이면 number, 객체면 string 키 타입 추론 */
type KeyOf<T> = T extends readonly any[] ? number : Extract<keyof T, string>;
/** 배열 또는 객체 collection */
type Collection<V> = readonly V[] | { readonly [key: string]: V };
/** 동기 값 또는 Promise */
type MaybePromise<T> = T | Promise<T>;
/** 일반 객체 */
type Dict<V = any> = Record<string, V>;

/**
 * 대상 문자열이 json형식 문자열인지 여부 조회
 *
 * @param {string} jsonStr 조회 대상 문자열
 * @returns {boolean} json 문자열인지 여부
 */
const isJson = (jsonStr: string): boolean =>
  isString(jsonStr) && !isError(attempt(() => JSON.parse(jsonStr)));

/**
 * 원시 타입(primitive) 인지 여부 조회
 * null, undefined, Boolean, Number, String
 *
 * @param {any} arg 조회 대상
 * @returns {boolean} 원시 타입(primitive) 인지 여부
 */
const isVal = <T>(arg: T): boolean => {
  const result: boolean =
    isNil(arg) || isBoolean(arg) || isNumber(arg) || isString(arg);

  return result;
};

/**
 * 참조 타입(reference) 인지 여부 조회
 * Array, Object, Function
 *
 * @param {any} arg 조회 대상
 * @returns {boolean} 참조 타입(reference) 인지 여부
 */
const isRef = <T>(arg: T): boolean => !isVal(arg);

/**
 * 대상 인자가 promise(thenable)인지 여부 조회
 *
 * @param {any} x 조회 대상
 * @return {boolean} 대상 인자가 promise(thenable)인지 여부
 */
const isPromise = <T>(x: T): boolean =>
  isFunction(get('then', x)) && isFunction(get('catch', x));

/**
 * 대상 함수를 promise로 lift
 *
 * @param {(...args: any[]) => any} fn 대상 합수
 * @param  {any[]} args 함수 인자 목록
 * @returns {Promise<any>} Promise로 lift된 Promise 객체
 */
const fnPromisify = <T>(
  fn: (...args: any[]) => T,
  ...args: any[]
): Promise<T> => {
  return new Promise((resolve, reject) => {
    try {
      resolve(fn(...args));
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * 대상 인자를 promise로 wrapping (lift)
 *
 * @param {any} a 대상 인자
 * @param {any[]} args 대상 인자 a가 함수인 경우, 함수의 인자목록
 * @return {Promise<any>} Promise로 lift된 Promise 객채
 */
function promisify<A extends any[], R>(
  fn: (...args: A) => R,
  ...args: A
): Promise<Awaited<R>>;
function promisify<R>(a: MaybePromise<R>): Promise<Awaited<R>>;
function promisify(a: any, ...args: any[]): Promise<any> {
  if (isFunction(a)) {
    return fnPromisify(a, ...args);
  }

  return isPromise(a) ? a : Promise.resolve(a);
}

/**
 * promise가 또다른 promise를 resolve하는 경우, promise의 중첩을 제거하기 위한 helper 함수
 *
 * @param {Promise<any> | any} thenable Promise 객체
 * @return {Promise<any> | any} 중첩 제거된 Promise 객체
 */
const flatPromise = (thenable: Promise<any> | any): Promise<any> | any =>
  isPromise(thenable) ? thenable.then((x: any) => flatPromise(x)) : thenable;

type TandThen = {
  <T, R>(
    successHandler: (response: T) => MaybePromise<R>,
    thenable: MaybePromise<T>,
  ): Promise<R>;
  <T, R>(
    successHandler: (response: T) => MaybePromise<R>,
  ): (thenable: MaybePromise<T>) => Promise<R>;
};
/**
 * lodash 형태의 promise then
 *
 * @param {(response:any) => any} successHandler 응답값 처리 callback
 * @param {Promise<any>} thenable resolve 대상 Promise 객체
 * @returns {Promise<any>} fullfilled 상태의 Promise 객체
 */
const andThen: TandThen = curry(
  <T, R>(
    successHandler: (response: T) => MaybePromise<R>,
    thenable: MaybePromise<T>,
  ): Promise<R> => promisify(thenable).then(flatPromise(successHandler)),
);

type Totherwise = {
  <E extends Error, T, R>(
    failureHandler: (error: E) => MaybePromise<R>,
    thenable: MaybePromise<T>,
  ): Promise<T | R>;
  <E extends Error, R>(
    failureHandler: (error: E) => MaybePromise<R>,
  ): <T>(thenable: MaybePromise<T>) => Promise<T | R>;
};
/**
 * lodash 형태의 promise catch
 *
 * @param {(error:Error|any) =>  any} failureHandler error 처리 callback
 * @param {Promise<Error|any>} thenable error를 resolve 하는 promise
 * @return {Promise<any>} error 상태의 Promise 객체
 */
const otherwise: Totherwise = curry(
  <E extends Error, T, R>(
    failureHandler: (error: E) => MaybePromise<R>,
    thenable: MaybePromise<T>,
  ): Promise<T | R> =>
    promisify(thenable).then(null, flatPromise(failureHandler)),
);

type Tfinally = {
  <T>(
    callback: () => MaybePromise<void>,
    thenable: MaybePromise<T>,
  ): Promise<T>;
  (
    callback: () => MaybePromise<void>,
  ): <T>(thenable: MaybePromise<T>) => Promise<T>;
};

/**
 * lodash 형태의 promise finally
 *
 * @param {(...args: any[]) => any} callback Promise 상태와 무관하게 실행되는 callback
 * @param {Promise<any>} thenable Promise 객체
 * @return {Promise<any>} Promise 객체
 */
const _finally: Tfinally = curry(
  <T>(
    callback: () => MaybePromise<void>,
    thenable: MaybePromise<T>,
  ): Promise<T> => promisify(thenable).finally(flatPromise(callback)),
);

type AsyncStep<A, B> = (arg: A) => MaybePromise<B>;

type TpipeAsync = {
  <A extends any[], B>(f1: (...args: A) => MaybePromise<B>): (
    ...args: A
  ) => Promise<B>;
  <A extends any[], B, C>(
    f1: (...args: A) => MaybePromise<B>,
    f2: AsyncStep<B, C>,
  ): (...args: A) => Promise<C>;
  <A extends any[], B, C, D>(
    f1: (...args: A) => MaybePromise<B>,
    f2: AsyncStep<B, C>,
    f3: AsyncStep<C, D>,
  ): (...args: A) => Promise<D>;
  <A extends any[], B, C, D, E>(
    f1: (...args: A) => MaybePromise<B>,
    f2: AsyncStep<B, C>,
    f3: AsyncStep<C, D>,
    f4: AsyncStep<D, E>,
  ): (...args: A) => Promise<E>;
  <A extends any[], B, C, D, E, F>(
    f1: (...args: A) => MaybePromise<B>,
    f2: AsyncStep<B, C>,
    f3: AsyncStep<C, D>,
    f4: AsyncStep<D, E>,
    f5: AsyncStep<E, F>,
  ): (...args: A) => Promise<F>;
  <A extends any[], B, C, D, E, F, G>(
    f1: (...args: A) => MaybePromise<B>,
    f2: AsyncStep<B, C>,
    f3: AsyncStep<C, D>,
    f4: AsyncStep<D, E>,
    f5: AsyncStep<E, F>,
    f6: AsyncStep<F, G>,
  ): (...args: A) => Promise<G>;
  <A extends any[], B, C, D, E, F, G, H>(
    f1: (...args: A) => MaybePromise<B>,
    f2: AsyncStep<B, C>,
    f3: AsyncStep<C, D>,
    f4: AsyncStep<D, E>,
    f5: AsyncStep<E, F>,
    f6: AsyncStep<F, G>,
    f7: AsyncStep<G, H>,
  ): (...args: A) => Promise<H>;
  <A extends any[], B, C, D, E, F, G, H, I>(
    f1: (...args: A) => MaybePromise<B>,
    f2: AsyncStep<B, C>,
    f3: AsyncStep<C, D>,
    f4: AsyncStep<D, E>,
    f5: AsyncStep<E, F>,
    f6: AsyncStep<F, G>,
    f7: AsyncStep<G, H>,
    f8: AsyncStep<H, I>,
  ): (...args: A) => Promise<I>;
};

/**
 * lodash pipe의 비동기 버전\
 * 각 함수는 동기/비동기 모두 가능하며, 이전 함수가 반환한 값(Promise는 resolve된 값)을 다음 함수의 인자로 전달한다.\
 * 첫 번째 함수만 여러 개의 인자를 받을 수 있고, 반환값은 항상 Promise 이다.\
 * 중간에 에러가 발생하면 이후 함수는 실행되지 않고 reject 된다.
 *
 * @param {...Function} fns 순차 실행될 함수 목록
 * @returns {(...args) => Promise<any>} 합성된 비동기 함수
 */
const pipeAsync: TpipeAsync = (
  first: (...args: any[]) => any,
  ...rest: ((arg: any) => any)[]
) => {
  return (...args: any[]): Promise<any> =>
    rest.reduce(
      (accP: Promise<any>, fn) => accP.then(fn),
      fnPromisify(first, ...args),
    );
};

/**
 * invert boolean
 * @param {any} x 대상
 * @return {boolean} not 연산된 값
 */
const not = <T>(x: T): boolean => !x;

/**
 * 대상이 비어있지 않은지 여부
 * (주의: 숫자타입은 항상 false를 반환)
 *
 * @param {any} a 대상
 * @returns {boolean} 비어 있는지 여부
 */
const isNotEmpty = <T>(a: T): boolean => !isEmpty(a);

/**
 * 대상 인자를 boolean 타입으로 변환\
 *
 * @param {any} a 대상
 * @returns {boolean} 변환된 boolean 타입 값
 */
const toBool = <T>(arg: T): boolean => !!arg;

type TifT = {
  <T, R>(
    evaluator: ((arg: T) => boolean) | boolean,
    trueHandler: ((arg: T) => R) | R,
    arg: T,
  ): T | R;
  <T, R>(
    evaluator: ((arg: T) => boolean) | boolean,
    trueHandler: ((arg: T) => R) | R,
  ): (arg: T) => T | R;
};

/**
 * a인자를 인자로, evaluator함수 실행,
 * true면 trueHandler에 a인자 대입
 * false면 a 반환
 *
 * @deprecated
 * @param {(a) => boolean} evaluator a를 인자로 하는 평가함수
 * @param {(a) => any} trueHandler evaluator의 결과가 true인 경우, a를 인자로 실행되는 callback
 * @param {any} a 대상 인자
 * @returns {any} evaluator가 true를 반환하는 경우, trueHandler의 결과값, false인 경우 a 반환
 */
const ifT: TifT = curry(
  <T, R>(
    evaluator: (arg: T) => boolean | boolean,
    trueHandler: (arg: T) => R | R,
    arg: T,
  ): T | R => {
    const isValidEvaluator = isFunction(evaluator) || isBoolean(evaluator);

    if (isValidEvaluator) {
      // evaluator가 함수인 경우
      if (isFunction(evaluator)) {
        if (evaluator(arg) === true) {
          return isFunction(trueHandler) ? trueHandler(arg) : trueHandler;
        } else {
          return arg;
        }
      } else {
        // evaluator가 boolean인 경우
        if (evaluator) {
          return isFunction(trueHandler) ? trueHandler(arg) : trueHandler;
        } else {
          return arg;
        }
      }
    } else {
      throw new Error('invalid parameter(s)');
    }
  },
);

type TifF = {
  <T, R>(
    evaluator: ((arg: T) => boolean) | boolean,
    falseHandler: ((arg: T) => R) | R,
    arg: T,
  ): T | R;
  <T, R>(
    evaluator: ((arg: T) => boolean) | boolean,
    falseHandler: ((arg: T) => R) | R,
  ): (arg: T) => T | R;
};

/**
 * a인자를 인자로, evaluator함수 실행,
 * false면 falseHandler에 a인자 대입
 * true면 a 반환
 *
 * @deprecated
 * @param {(a) => boolean} evaluator a를 인자로 하는 평가함수
 * @param {(a) => any} falseHandler evaluator의 결과가 false인 경우, a를 인자로 실행되는 callback
 * @param {any} a 대상 인자
 * @returns {any} evaluator가 false를 반환하는 경우, falseHandler의 결과값, true경우 a 반환
 */
const ifF: TifF = curry(
  <T, R>(
    evaluator: (arg: T) => boolean | boolean,
    falseHandler: (arg: T) => R | R,
    arg: T,
  ): T | R => {
    const isValidEvaluator = isFunction(evaluator) || isBoolean(evaluator);

    if (isValidEvaluator) {
      // evaluator가 함수인 경우
      if (isFunction(evaluator)) {
        if (evaluator(arg) === false) {
          return isFunction(falseHandler) ? falseHandler(arg) : falseHandler;
        } else {
          return arg;
        }
      } else {
        // evaluator가 boolean인 경우
        if (evaluator) {
          return isFunction(falseHandler) ? falseHandler(arg) : falseHandler;
        } else {
          return arg;
        }
      }
    } else {
      throw new Error('invalid parameter(s)');
    }
  },
);

type Ctor = abstract new (...args: any[]) => object;
type TinstanceOf = {
  <C extends Ctor, T>(t: C, arg: T): boolean;
  <C extends Ctor>(t: C): <T>(arg: T) => boolean;
};
/**
 * a인자가 t타입인지 여부 조회
 * @param {any} t 조회 대상 type
 * @param {any} a 조회 대상
 * @returns {boolean} a인자가 t타입인지 여부
 */
const instanceOf: TinstanceOf = curry(
  <C extends abstract new (...args: any[]) => object, T>(
    t: C,
    a: T,
  ): boolean => a instanceof t,
);

/**
 * 대상 문자열을 pascalcase 문자열로 변환
 * @param {string} str 대상 문자열
 * @returns {string} pascal case로 변환된 문자열
 */
const pascalCase = (str: string): string => {
  const composer = pipe(camelCase, upperFirst);
  const result = composer(str);

  return result;
};

/**
 * collection(배열/유사배열/객체)을 [key, value] 목록으로 변환\
 * 배열(유사배열)의 key는 number, 객체의 key는 string
 */
const toEntries = <T extends object>(
  collection: T,
): [KeyOf<T>, ValueOf<T>][] => {
  if (isArray(collection)) {
    const list: [number, ValueOf<T>][] = new Array(collection.length);
    for (let i = 0; i < collection.length; i++) {
      list[i] = [i, collection[i]];
    }
    return list as [KeyOf<T>, ValueOf<T>][];
  }

  const isIndexed = isArrayLike(collection);

  return (entries(collection) as [string, ValueOf<T>][]).map(([k, v]) => [
    (isIndexed ? toNumber(k) : k) as KeyOf<T>,
    v,
  ]);
};

/** 내부용 mapAsync 구현 (curry 래핑 없이 직접 호출) */
const mapAsyncImpl = <T extends object, R>(
  asyncMapper: (value: ValueOf<T>, key: KeyOf<T>) => MaybePromise<R>,
  collection: T,
): Promise<R[]> =>
  Promise.all(
    toEntries(collection).map(([k, v]) => promisify(asyncMapper(v, k))),
  ) as Promise<R[]>;

type TmapAsync = {
  <T extends object, R>(
    asyncMapper: (value: ValueOf<T>, key: KeyOf<T>) => MaybePromise<R>,
    collection: T,
  ): Promise<R[]>;
  <V, K extends string | number, R>(
    asyncMapper: (value: V, key: K) => MaybePromise<R>,
  ): (collection: Collection<V>) => Promise<R[]>;
};

/**
 * (collection) map의 비동기 함수\
 * mapper 함수로 비동기 함수를 받아서 처리해준다.
 *
 * @param {(a) => Promise<any>} asyncMapper 비동기 mapper
 * @param {object|any[]} collection 대상 object 또는 array
 * @returns {Promise<any[]>} 결과 array를 resolve 하는 promise
 */
const mapAsync: TmapAsync = curry(
  async <T extends object, R>(
    asyncMapper: (value: ValueOf<T>, key: KeyOf<T>) => MaybePromise<R>,
    collection: T,
  ): Promise<R[]> => mapAsyncImpl(asyncMapper, collection),
);

type TforEachAsync = {
  <T extends object, R>(
    callbackAsync: (value: ValueOf<T>, key: KeyOf<T>) => MaybePromise<R>,
    collection: T,
  ): Promise<R[]>;
  <V, K extends string | number, R>(
    callbackAsync: (value: V, key: K) => MaybePromise<R>,
  ): (collection: Collection<V>) => Promise<R[]>;
};
/**
 * 비동기 forEach
 * 실행함수로 비동기 함수를 받아서 처리해준다
 * 순차실행
 *
 * @param {(value: any, key: number | string) => Promise<any>} callbackAsync 비동기 iterator
 * @param {object|any[]} collection 대상 객체 또는 배열
 * @returns {Promise<any[]>} 결과 Promise
 */
const forEachAsync: TforEachAsync = curry(
  async <T extends object, R>(
    callbackAsync: (value: ValueOf<T>, key: KeyOf<T>) => MaybePromise<R>,
    collection: T,
  ): Promise<R[]> => {
    const loopResults: R[] = [];

    for (const [k, v] of toEntries(collection)) {
      loopResults.push(await callbackAsync(v, k));
    }

    return loopResults;
  },
);

type TfilterAsync = {
  <T extends object>(
    asyncFilter: (value: ValueOf<T>, key: KeyOf<T>) => MaybePromise<boolean>,
    collection: T,
  ): Promise<ValueOf<T>[]>;
  <V, K extends string | number>(
    asyncFilter: (value: V, key: K) => MaybePromise<boolean>,
  ): (collection: Collection<V>) => Promise<V[]>;
};
/**
 * (collection) filter의 비동기 함수\
 * 필터함수로 비동기 함수를 받아서 처리해준다.
 *
 * @param {(a) => Promise<bool>} asyncFilter 비동기 필터
 * @param {object|any[]} collection 대상 object 또는 array
 * @returns {Promise<any[]>} 결과 array를 resolve하는 promise
 */
const filterAsyncImpl = async <T extends object>(
  asyncFilter: (value: ValueOf<T>, key: KeyOf<T>) => MaybePromise<boolean>,
  collection: T,
): Promise<ValueOf<T>[]> => {
  const entryList = toEntries(collection);
  const flags = await Promise.all(
    entryList.map(([k, v]) => promisify(asyncFilter(v, k))),
  );
  const result = entryList.reduce<ValueOf<T>[]>((acc, [_k, v], i) => {
    if (flags[i]) {
      acc.push(v);
    }
    return acc;
  }, []);

  return result;
};

const filterAsync: TfilterAsync = curry(filterAsyncImpl);

type TfindAsync = {
  <T extends object>(
    asyncFilter: (value: ValueOf<T>, key: KeyOf<T>) => MaybePromise<boolean>,
    collection: T,
  ): Promise<ValueOf<T> | undefined>;
  <V, K extends string | number>(
    asyncFilter: (value: V, key: K) => MaybePromise<boolean>,
  ): (collection: Collection<V>) => Promise<V | undefined>;
};

/**
 * (collection) find의 비동기 함수\
 * 순차적으로 실행되며, 처음으로 true를 반환한 요소에서 즉시 중단한다.\
 * (이후 요소의 asyncFilter는 호출되지 않는다)
 *
 * @param {(a) => Promise<bool>} asyncFilter 비동기 필터
 * @param {object|any[]} collection 대상 object 또는 array
 * @returns {Promise<any>} 필터된 단일 결과를 resolve하는 promise (일치 항목이 없으면 undefined)
 */
const findAsync: TfindAsync = curry(
  async <T extends object>(
    asyncFilter: (value: ValueOf<T>, key: KeyOf<T>) => MaybePromise<boolean>,
    collection: T,
  ): Promise<ValueOf<T> | undefined> => {
    for (const [k, v] of toEntries(collection)) {
      if (await asyncFilter(v, k)) {
        return v;
      }
    }

    return undefined;
  },
);

type TsomeAsync = {
  <T extends object>(
    asyncPredicate: (
      value: ValueOf<T>,
      key: KeyOf<T>,
    ) => MaybePromise<boolean>,
    collection: T,
  ): Promise<boolean>;
  <V, K extends string | number>(
    asyncPredicate: (value: V, key: K) => MaybePromise<boolean>,
  ): (collection: Collection<V>) => Promise<boolean>;
};

/**
 * (collection) some의 비동기 함수\
 * 순차적으로 실행되며, 처음으로 true를 반환한 요소에서 즉시 중단(true)한다.\
 * 빈 collection 은 false 를 반환한다.
 *
 * @param {(value, key) => Promise<bool>|bool} asyncPredicate 비동기 조건 함수
 * @param {object|any[]} collection 대상 object 또는 array
 * @returns {Promise<boolean>} 하나라도 조건을 만족하는지 여부
 */
const someAsync: TsomeAsync = curry(
  async <T extends object>(
    asyncPredicate: (
      value: ValueOf<T>,
      key: KeyOf<T>,
    ) => MaybePromise<boolean>,
    collection: T,
  ): Promise<boolean> => {
    for (const [k, v] of toEntries(collection)) {
      if (await asyncPredicate(v, k)) {
        return true;
      }
    }

    return false;
  },
);

type TeveryAsync = {
  <T extends object>(
    asyncPredicate: (
      value: ValueOf<T>,
      key: KeyOf<T>,
    ) => MaybePromise<boolean>,
    collection: T,
  ): Promise<boolean>;
  <V, K extends string | number>(
    asyncPredicate: (value: V, key: K) => MaybePromise<boolean>,
  ): (collection: Collection<V>) => Promise<boolean>;
};

/**
 * (collection) every의 비동기 함수\
 * 순차적으로 실행되며, 처음으로 false를 반환한 요소에서 즉시 중단(false)한다.\
 * 빈 collection 은 true 를 반환한다.
 *
 * @param {(value, key) => Promise<bool>|bool} asyncPredicate 비동기 조건 함수
 * @param {object|any[]} collection 대상 object 또는 array
 * @returns {Promise<boolean>} 모든 요소가 조건을 만족하는지 여부
 */
const everyAsync: TeveryAsync = curry(
  async <T extends object>(
    asyncPredicate: (
      value: ValueOf<T>,
      key: KeyOf<T>,
    ) => MaybePromise<boolean>,
    collection: T,
  ): Promise<boolean> => {
    for (const [k, v] of toEntries(collection)) {
      if (!(await asyncPredicate(v, k))) {
        return false;
      }
    }

    return true;
  },
);

type TfindIndexAsync = {
  <V>(
    asyncPredicate: (value: V, index: number) => MaybePromise<boolean>,
    array: readonly V[],
  ): Promise<number>;
  <V>(
    asyncPredicate: (value: V, index: number) => MaybePromise<boolean>,
  ): (array: readonly V[]) => Promise<number>;
};

/**
 * (array) findIndex의 비동기 함수\
 * 순차적으로 실행되며, 처음으로 true를 반환한 요소의 index 에서 즉시 중단한다.\
 * 일치하는 요소가 없으면 lodash findIndex 와 동일하게 -1 을 반환한다.
 *
 * @param {(value, index) => Promise<bool>|bool} asyncPredicate 비동기 조건 함수
 * @param {any[]} array 대상 배열
 * @returns {Promise<number>} 일치하는 첫 요소의 index (없으면 -1)
 */
const findIndexAsync: TfindIndexAsync = curry(
  async <V>(
    asyncPredicate: (value: V, index: number) => MaybePromise<boolean>,
    array: readonly V[],
  ): Promise<number> => {
    for (const [i, v] of toEntries(array)) {
      if (await asyncPredicate(v as V, i as number)) {
        return i as number;
      }
    }

    return -1;
  },
);

type TfindKeyAsync = {
  <T extends object>(
    asyncPredicate: (
      value: ValueOf<T>,
      key: KeyOf<T>,
    ) => MaybePromise<boolean>,
    object: T,
  ): Promise<KeyOf<T> | undefined>;
  <V, K extends string>(
    asyncPredicate: (value: V, key: K) => MaybePromise<boolean>,
  ): (object: { readonly [key: string]: V }) => Promise<K | undefined>;
};

/**
 * (object) findKey의 비동기 함수\
 * 순차적으로 실행되며, 처음으로 true를 반환한 요소의 key 에서 즉시 중단한다.\
 * 일치하는 요소가 없으면 lodash findKey 와 동일하게 undefined 를 반환한다.
 *
 * @param {(value, key) => Promise<bool>|bool} asyncPredicate 비동기 조건 함수
 * @param {object} object 대상 객체
 * @returns {Promise<string>} 일치하는 첫 요소의 key (없으면 undefined)
 */
const findKeyAsync: TfindKeyAsync = curry(
  async <T extends object>(
    asyncPredicate: (
      value: ValueOf<T>,
      key: KeyOf<T>,
    ) => MaybePromise<boolean>,
    object: T,
  ): Promise<KeyOf<T> | undefined> => {
    for (const [k, v] of toEntries(object)) {
      if (await asyncPredicate(v, k)) {
        return k;
      }
    }

    return undefined;
  },
);

type TreduceAsync = {
  <T extends object, A>(
    asyncFn: (acc: A, value: ValueOf<T>, key: KeyOf<T>) => MaybePromise<A>,
    initAcc: MaybePromise<A>,
    collection: T,
  ): Promise<A>;
  <V, K extends string | number, A>(
    asyncFn: (acc: A, value: V, key: K) => MaybePromise<A>,
    initAcc: MaybePromise<A>,
  ): (collection: Collection<V>) => Promise<A>;
};

/**
 * (collection) reduce의 비동기 함수\
 * lodash reduce와 동일한 인자(acc, value, key)로 동작하며, 순차적으로 실행된다.\
 * asyncFn은 동기/비동기 값을 모두 반환할 수 있고, acc는 항상 resolve된 값이 전달된다.\
 * (ex 300ms이 걸리는 5개의 promise가 있다면, 최소 1500ms+alpah의 시간이 소요된다.\
 * 상기의 mapAsync의 경우 300+alpah의 시간만 소요된다.(Promise.all과 Promise.resolve의 차이))
 *
 * @param {(acc, value, key) => Promise<any>|any} asyncFn 비동기 iterator
 * @param {Promise<any>|any} initAcc 초기 누적기 또는 초기 누적기를 resolve하는 promise
 * @param {object|any[]} collection 대상 객체 또는 배열
 * @returns {Promise<any>} 최종 누적기를 resolve하는 promise
 */
const reduceAsync: TreduceAsync = curry(
  async <T extends object, A>(
    asyncFn: (acc: A, value: ValueOf<T>, key: KeyOf<T>) => MaybePromise<A>,
    initAcc: MaybePromise<A>,
    collection: T,
  ): Promise<A> => {
    const result: Promise<A> = toEntries(collection).reduce(
      (accP: Promise<A>, [k, v]) => accP.then((acc) => asyncFn(acc, v, k)),
      Promise.resolve(initAcc),
    );

    return result;
  },
);

type Tkey = {
  <T extends object>(obj: T, value: ValueOf<T>): KeyOf<T> | undefined;
  <T extends object>(
    obj: T,
  ): (value: ValueOf<T>) => KeyOf<T> | undefined;
};

/**
 * value로 object key 조회
 *
 * @param {object} obj 대상 객체
 * @param {string} value 조회 대상 값
 * @returns {string} 속성명
 */
const key: Tkey = curry(
  (obj: Dict, value: any): string | undefined =>
    find((k: string) => equals(value, obj[k]), keys(obj)),
);

/**
 * shallow freeze 보완
 * (대상 object의 refence 타입의 properties까지 object.freeze 처리)
 * @param {object} obj 대상 객체
 * @returns {object} frozen 처리된 객체
 */
const deepFreeze = <T extends object>(obj: T): Readonly<T> => {
  Object.freeze(obj);
  forOwn((v: any) => {
    if (isRef(v) && !Object.isFrozen(v)) {
      deepFreeze(v);
    }
  }, obj);

  return obj;
};

/** lodash path 로 해석될 수 있는 문자 / prototype 오염 방지 대상 */
const PATH_CHARS = /[.[\]]|^(?:__proto__|constructor|prototype)$/;
const hasOwn = (o: object, k: string): boolean =>
  Object.prototype.hasOwnProperty.call(o, k);

type TtransformObjectKey = {
  <T extends object>(
    transformFn: (originStr: string) => string,
    obj: T,
  ): Dict;
  (transformFn: (originStr: string) => string): <T extends object>(
    obj: T,
  ) => Dict;
};

/**
 * 대상 객체의 속성명을 transformFn의 결과값으로 변환
 *
 * @param {(orignStr) => string} transformFn 변환함수
 * @param {object} obj 대상 객체
 * @returns {object} 속성명이 변환된 객체
 */
const transformObjectKey: TtransformObjectKey = curry(
  <T extends object>(
    transformFn: (originStr: string) => string,
    obj: T,
  ): Dict => {
    const convertValue = (arg: any): any => {
      if (isPlainObject(arg)) {
        return convertTo(arg);
      }
      return isArray(arg) ? arg.map(convertValue) : arg;
    };
    // 내부 누적 객체는 함수 안에서만 변경되므로 외부에서는 불변(순수)으로 동작한다.
    // (lodash/fp set 은 호출마다 전체를 복제하여 O(n^2) 이므로 사용하지 않는다)
    const convertTo = (o: Record<string, any>): Record<string, any> => {
      let acc: Record<string, any> = {};

      for (const k of Object.keys(o)) {
        const transformedKey = transformFn(k);
        const isLiteralKey = !PATH_CHARS.test(transformedKey);

        if (isLiteralKey ? hasOwn(acc, transformedKey) : has(transformedKey, acc)) {
          throw new Error(
            `${transformedKey} already exist. duplicated property name is not supported.`,
          );
        }

        if (isLiteralKey) {
          acc[transformedKey] = convertValue(o[k]);
        } else {
          // 'a.b', 'a[0]' 처럼 path 로 해석되는 key 는 기존 lodash set 동작 유지
          acc = set(transformedKey, convertValue(o[k]), acc);
        }
      }

      return acc;
    };
    const convertRecursively = convertTo;

    const result: Dict =
      isObject(obj) || isArray(obj) ? convertRecursively(obj) : obj;

    return result;
  },
);

/**
 * 대상 object의 property key문자열을 camelcase 문자열로 변환
 *
 * @param {object} obj 대상 객체
 * @returns {object} 속성명이 camel case로 변환된 객체
 */
const toCamelcase = transformObjectKey(camelCase);

/**
 * 대상 object의 property key문자열을 snakecase 문자열로 변환
 *
 * @param {object} obj 대상 객체
 * @returns {object} 속성명이 snake case로 변환된 객체
 */
const toSnakecase = transformObjectKey(snakeCase);

/**
 * 대상 object의 property key문자열을 camelcase 문자열로 변환
 *
 * @param {object} obj 대상 객체
 * @returns {object} 속성명이 camel case로 변환된 객체
 */
const toPascalcase = transformObjectKey(pascalCase);

/**
 * date형식 문자열 여부 조회
 * @param {string} dateStr date형식 문자열
 * @returns {boolean} date형식 문자열 여부
 */
const isDatetimeString = (dateStr: string): boolean =>
  isString(dateStr) && !isNaN(Date.parse(dateStr));

type Tap = {
  <A, R>(arg: A, curried: (arg: A) => R): R;
  <A>(arg: A): <R>(curried: (arg: A) => R) => R;
};

/**
 * applicative functor pattern 구현체
 * (주로 pipe함수에서 함수의 인자 순서를 변경하기 위해 사용)
 *
 * @param {any} arg 대입 인자
 * @param {function} curried currying된 함수
 * @returns {any} 결과값
 */
const ap: Tap = curry(<A, R>(a: A, curried: (arg: A) => R): R => curried(a));

/**
 * 대상 인자가 undefined 또는 null이 아닌지 여부 조회
 *
 * @param {any} arg 대상인자
 * @returns {boolean} 대상 인자가 undefined 또는 null이 아닌지 여부
 */
const isNotNil: <T>(arg: T) => boolean = pipe(isNil, not);

type TnotIncludes = {
  <T extends object | string>(arg: ValueOf<T>, target: T): boolean;
  <V>(arg: V): (target: Collection<V> | string) => boolean;
};

/**
 * arr인자 배열에 a인자가 포함되지 않았는지 여부 조회
 * @param {any} a 대상 인자
 * @param {any[] | Record<string, any> | string} arr 대상 배열
 * @returns {boolean} arr 배열에 a인자가 포함되지 않았는지 여부
 */
const notIncludes: TnotIncludes = curry(
  <T extends object | string>(arg: ValueOf<T>, target: T): boolean => {
    const result: boolean = !includes(arg, target as Dict);

    return result;
  },
);

type TnotEquals = {
  <A, B = A>(a: A, b: B): boolean;
  <A>(a: A): <B = A>(b: B) => boolean;
};

/**
 * a인자와 b인자가 다른지 여부 (deep equal) 조회
 * @param {any} a 비교 인자
 * @param {any} b 비교 인자
 * @returns {boolean} a인자와 b인자가 다른지 여부 (deep equal)
 */
const notEquals: TnotEquals = curry(
  <A, B>(a: A, b: B): boolean => !equals(a, b),
);

type TremoveByIndex = {
  <R>(index: number | string, targetArray: R[]): R[];
  (index: number | string): <R>(targetArray: R[]) => R[];
};
/**
 * arr인자의 idx인자의 index에 해당하는 요소 제거
 * @param {number|string} index numeric 타입 색인값
 * @param {any[]} targetArray 대상 배열
 * @returns {any[]} index에 해당하는 요소 제거된 배열
 */
const removeByIndex: TremoveByIndex = curry(
  <TResult>(index: number | string, targetArray: TResult[]): TResult[] => {
    const num = toNumber(index);

    if (isArray(targetArray) && num <= targetArray.length) {
      // 구조 공유(structural sharing): 새 배열만 만들고 요소는 원본과 공유한다.
      // 원본 배열은 변경되지 않는다.
      const remains = targetArray.slice();
      remains.splice(num, 1);

      return remains;
    }
    return targetArray;
  },
);

function removeLast(target: string): string;
function removeLast<T>(target: T[]): T[];

/**
 * 인자의 마지막 요소 제거 (immutable)
 *
 * @param {string|any[]} target 문자열 또는 배열의 마지막 요소 제거
 * @returns 마지막 요소 제거된 인자
 */
function removeLast<T>(target: string | T[]): string | T[] {
  if (isString(target)) {
    return target.slice(0, -1);
  }
  if (isArray(target)) {
    // 새 배열만 만들고 요소는 원본과 공유 (원본 배열은 변경되지 않는다)
    return target.slice(0, -1);
  }

  return target;
}

/**
 * fp.concat alias
 *
 * @param {any[]} array 병합대상 배열
 * @param {any|any[]} a 병합 인자
 * @returns {any[]} 병합된 배열
 */
const append: LodashConcat = concat;

type Tprepend = {
  <T>(targetArray: T[], value: T | T[]): T[];
  <T>(targetArray: T[]): (value: T | T[]) => T[];
};

/**
 * array 인자의 (index상)앞쪽에 value인자를 추가
 *
 * @param {any[]} targetArray 병합대상 배열
 * @param {any|any[]} value 병합 인자
 * @returns {any[]} 병합된 배열
 */
const prepend: Tprepend = curry(<T>(targetArray: T[], value: T | T[]): T[] =>
  isArray(value) ? concat(value, targetArray) : concat([value], targetArray),
);

type TmapWithKey = {
  <T extends object, R>(
    iteratee: (value: ValueOf<T>, key: KeyOf<T>) => R,
    collection: T,
  ): R[];
  <V, K extends string | number, R>(
    iteratee: (value: V, key: K) => R,
  ): (collection: Collection<V>) => R[];
};

interface LodashConvertible {
  convert(options: { cap: boolean }): (...args: any[]) => any;
}

interface IFpMapEx extends LodashMap, LodashConvertible {}
/** convert 는 호출마다 새 함수를 생성하므로 모듈 로드 시 1회만 수행 */
const mapUncapped = (map as IFpMapEx).convert({ cap: false });

/**
 * key(index)를 포함한 map
 * @param {(v, k) => any} f value, key(또는 index)를 인자로 갖는 callback
 * @param {object|any[]} a 대상 collection
 * @returns {any[]} 결과 배열
 */
const mapWithKey: TmapWithKey = curry(
  <T extends object, R>(
    iteratee: (value: ValueOf<T>, key: KeyOf<T>) => R,
    collection: T,
  ): R[] => mapUncapped(iteratee, collection),
);

type TforEachWithKey = {
  <T extends object>(
    iteratee: (value: ValueOf<T>, key: KeyOf<T>) => boolean | void,
    collection: T,
  ): T;
  <V, K extends string | number>(
    iteratee: (value: V, key: K) => boolean | void,
  ): <C extends Collection<V>>(collection: C) => C;
};
interface IFpForEachEx extends LodashForEach, LodashConvertible {}
const forEachUncapped = (forEach as IFpForEachEx).convert({ cap: false });
/**
 * key(index)를 포함한 forEach
 * @param {(v, k) => any} f value, key(또는 index)를 인자로 갖는 callback
 * @param {object|any[]} a 대상 collection
 * @returns {void} 반환값 없음
 */
const forEachWithKey: TforEachWithKey = curry(
  <T extends object>(
    iteratee: (value: ValueOf<T>, key: KeyOf<T>) => boolean | void,
    collection: T,
  ): T =>
    forEachUncapped(iteratee, collection),
);

type TreduceWithKey = {
  <T extends object, R>(
    iteratee: (acc: R, value: ValueOf<T>, key: KeyOf<T>) => R,
    acc: R,
    collection: T,
  ): R;
  <V, K extends string | number, R>(
    iteratee: (acc: R, value: V, key: K) => R,
    acc: R,
  ): (collection: Collection<V>) => R;
};

interface IFpReduceEx extends LodashReduce, LodashConvertible {}
const reduceUncapped = (reduce as IFpReduceEx).convert({ cap: false });

/**
 * key(index)를 포함한 reduce
 *
 * @param {(acc, v, k) => any} f accumulator, value, key(또는 index)를 인자로 갖는 callback
 * @param {any} acc 누적기
 * @param {object|any[]} 대상 collection
 * @returns {any} 누적기
 */
const reduceWithKey: TreduceWithKey = curry(
  <T extends object, R>(
    iteratee: (acc: R, value: ValueOf<T>, key: KeyOf<T>) => R,
    acc: R,
    collection: T,
  ): R =>
    reduceUncapped(iteratee, acc, collection),
);

/**
 * falsy 타입(0, -0, NaN, false, '')인지 여부 조회
 * @param {any} arg 조회 대상
 * @returns {boolean} falsy 타입(0, -0, NaN, false, '')인지 여부
 */
const isFalsy = <T>(arg: T): boolean =>
  isNil(arg) ||
  (arg as unknown) === 0 ||
  (arg as unknown) === '' ||
  (arg as unknown) === false ||
  Number.isNaN(arg);

/**
 * truthy 타입 인지 여부 조회
 * (falsy타입(0, -0, NaN, false, '')이 아니면 truthy 타입)
 * @param {any} arg 조회 대상
 * @returns {boolean} truthy 타입 인지 여부
 */
const isTruthy = <T>(arg: T): boolean => !isFalsy(arg);

/**
 * getOr override
 *
 * getOr의 반환값이 null인 경우, 기본값 반환되게 수정한 버전
 * circular dependency 때문에 closure로 작성
 */
const getOr = (({ curry, _getOr }) => {
  const __getOr = curry(
    <T extends object, K extends keyof T>(
      defaultValue: T[K],
      path: string,
      target: T,
    ) => {
      const value = isNil(target) ? target : get(path, target);

      return isNil(value) ? defaultValue : value;
    },
  );
  return __getOr as typeof _getOr;
})({ curry, _getOr });

/**
 * ms 시간동안 대기
 *
 * @param ms 대기시간
 * @returns Promise
 */
const delayAsync = async (ms: number): Promise<void> => {
  const exe = (): Promise<void> =>
    new Promise((resolve) => setTimeout(() => resolve(), ms));
  const result = await exe();

  return result;
};

export default {
  mapAsync,
  filterAsync,
  reduceAsync,
  findAsync,
  findIndexAsync,
  findKeyAsync,
  someAsync,
  everyAsync,
  forEachAsync,
  pipeAsync,
  promisify,
  andThen,
  otherwise,
  finally: _finally,

  isPromise,
  isNotEmpty,
  isNotNil,
  isJson,
  notEquals,
  isNotEqual: notEquals,
  isVal,
  isPrimitive: isVal,
  isRef,
  isReference: isRef,
  not,
  notIncludes,
  toBool,

  deepFreeze,
  key,
  keyByVal: key,

  // string
  transformObjectKey,
  toCamelcase,
  toCamelKey: toCamelcase,
  toSnakecase,
  toSnakeKey: toSnakecase,
  toPascalcase,
  pascalCase,
  isDatetimeString,

  ap,
  instanceOf,

  // array
  removeByIndex,
  removeLast,
  append,
  prepend,

  mapWithKey,
  mapWithIndex: mapWithKey,
  forEachWithKey,
  forEachWithIndex: forEachWithKey,
  reduceWithKey,
  reduceWithIndex: reduceWithKey,
  isFalsy,
  isTruthy,

  getOr,
  delayAsync,
  sleep: delayAsync,
};
