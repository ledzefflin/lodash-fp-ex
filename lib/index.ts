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
  cond,
  T,
  isPlainObject,
  isArray,
  identity,
  curry,
  isEmpty,
  equals,
  upperFirst,
  camelCase,
  flatMapDeep,
  entries,
  toNumber,
  map,
  filter,
  head,
  always,
  reduce,
  find,
  forOwn,
  has,
  set,
  isObject,
  includes,
  size,
  snakeCase,
  lte,
  cloneDeep,
  forEach,
  some,
  getOr as _getOr,
} from 'lodash/fp';
import type {
  LodashFlatMapDeep,
  LodashMap,
  LodashForEach,
  LodashReduce,
  LodashConcat,
} from 'lodash/fp';
import { F } from 'ts-toolbelt';

/**
 * 대상 문자열이 json형식 문자열인지 여부 조회
 *
 * @param {string} jsonStr 조회 대상 문자열
 * @returns {boolean} json 문자열인지 여부
 */
const isJson = (jsonStr: string): boolean => {
  const composer = pipe(attempt, isError);
  const result: boolean =
    isString(jsonStr) && !composer(() => JSON.parse(jsonStr));

  return result;
};

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
const isRef = <T>(arg: T): boolean => {
  const composer = pipe(isVal, not);
  const result = composer(arg);

  return result;
};

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
const promisify = (a: any, ...args: any[]): Promise<any> => {
  const conditional = cond([
    [isFunction, () => fnPromisify(a, ...args)],
    [isPromise, (a: Promise<any>): Promise<any> => identity(a)],
    [T, (a) => Promise.resolve(a)],
  ]);
  const result = conditional(a);

  return result;
};

/**
 * promise가 또다른 promise를 resolve하는 경우, promise의 중첩을 제거하기 위한 helper 함수
 *
 * @param {Promise<any> | any} thenable Promise 객체
 * @return {Promise<any> | any} 중첩 제거된 Promise 객체
 */
const flatPromise = (thenable: Promise<any> | any): Promise<any> | any =>
  isPromise(thenable) ? thenable.then((x: any) => flatPromise(x)) : thenable;

type TandThen = F.Curry<
  (fn: (response: any) => any, thenable: Promise<any>) => Promise<any>
>;
/**
 * lodash 형태의 promise then
 *
 * @param {(response:any) => any} successHandler 응답값 처리 callback
 * @param {Promise<any>} thenable resolve 대상 Promise 객체
 * @returns {Promise<any>} fullfilled 상태의 Promise 객체
 */
const andThen: TandThen = curry(
  (
    successHandler: (response: any) => any,
    thenable: Promise<any>,
  ): Promise<any> => promisify(thenable).then(flatPromise(successHandler)),
);

type Totherwise = F.Curry<
  (
    failureHandler: (error: Error | any) => any,
    thenable: Promise<Error | any>,
  ) => Promise<any>
>;
/**
 * lodash 형태의 promise catch
 *
 * @param {(error:Error|any) =>  any} failureHandler error 처리 callback
 * @param {Promise<Error|any>} thenable error를 resolve 하는 promise
 * @return {Promise<any>} error 상태의 Promise 객체
 */
const otherwise: Totherwise = curry(
  (
    failureHandler: (error: Error | any) => any,
    thenable: Promise<Error | any>,
  ) => promisify(thenable).then(null, flatPromise(failureHandler)),
);

type Tfinally = F.Curry<
  (callback: (...args: any[]) => any, thenable: Promise<any>) => Promise<any>
>;

/**
 * lodash 형태의 promise finally
 *
 * @param {(...args: any[]) => any} callback Promise 상태와 무관하게 실행되는 callback
 * @param {Promise<any>} thenable Promise 객체
 * @return {Promise<any>} Promise 객체
 */
const _finally: Tfinally = curry(
  (callback: (...args: any[]) => any, thenable: Promise<any>): Promise<any> =>
    promisify(thenable).finally(flatPromise(callback)),
);

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
const isNotEmpty = (a: any): boolean => {
  const composer = pipe(isEmpty, not);
  const result = composer(a);

  return result;
};

/**
 * 대상 인자를 boolean 타입으로 변환\
 *
 * @param {any} a 대상
 * @returns {boolean} 변환된 boolean 타입 값
 */
const toBool = (arg: any): boolean => !!arg;

type TifT = F.Curry<
  <T, R>(
    evaluator: (arg: T) => boolean | boolean,
    trueHandler: (arg: T) => R | R,
    arg: T,
  ) => T | R
>;

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
        if (pipe(evaluator, equals(true))(arg)) {
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

type TifF = F.Curry<
  <T, R>(
    evaluator: (arg: T) => boolean | boolean,
    falseHandler: (arg: T) => R | R,
    arg: T,
  ) => T | R
>;

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
        if (pipe(evaluator, equals(false))(arg)) {
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

type TinstanceOf = F.Curry<<T>(t: any, arg: T) => boolean>;
/**
 * a인자가 t타입인지 여부 조회
 * @param {any} t 조회 대상 type
 * @param {any} a 조회 대상
 * @returns {boolean} a인자가 t타입인지 여부
 */
const instanceOf: TinstanceOf = curry(
  (t: any, a: any): boolean => a instanceof t,
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

type TmapAsync = F.Curry<
  <T, K extends keyof T, R>(
    asyncMapper: (arg: T[K], key: K) => Promise<R>,
    collection: T,
  ) => Promise<R[]>
>;

interface IFpFlatMapDeepEx extends LodashFlatMapDeep, LodashConvertible {}
/**
 * (collection) map의 비동기 함수\
 * mapper 함수로 비동기 함수를 받아서 처리해준다.
 *
 * @param {(a) => Promise<any>} asyncMapper 비동기 mapper
 * @param {object|any[]} collection 대상 object 또는 array
 * @returns {Promise<any[]>} 결과 array를 resolve 하는 promise
 */
const mapAsync: TmapAsync = curry(
  async <T, K extends keyof T, R>(
    asyncMapper: (arg: T[K], key: K) => Promise<R>,
    collection: T,
  ): Promise<R[]> => {
    const composer = pipe(
      (flatMapDeep as IFpFlatMapDeepEx).convert({ cap: false })(
        pipe(asyncMapper, promisify),
      ),
      async (a: Promise<R>[]) => await Promise.all(a),
    );
    const result = await composer(collection);

    return result;
  },
);

type TforEachAsync = F.Curry<
  <T, K extends keyof T, R>(
    callbackAsync: (value: T[K], key: K) => Promise<R>,
    collection: T,
  ) => Promise<R[]>
>;
/**
 * 비동기 forEach
 * 실행함수로 비동기 함수를 받아서 처리해준다
 * 순차실행
 *
 * @param {(value: any, key: number | string) => Promise<any>} callbackAsync 비동기 iterator
 * @param {object|any[]} collection 대상 객체 또는 배열
 * @returns {Promise<any[]>} 결과 Promise
 */
const forEachAsync = curry(
  async <T extends object, K extends keyof T, R>(
    callbackAsync: (value: T[K], key: K) => Promise<R>,
    collection: T,
  ): Promise<R[]> => {
    const loopResults: Awaited<R>[] = [];
    const entryList = entries(collection) as [K, T[K]][];

    for (const entry of entryList) {
      loopResults.push(
        await callbackAsync(
          entry[1],
          (isArray(collection) ? toNumber(entry[0]) : entry[0]) as K,
        ),
      );
    }

    return loopResults;
  },
);

type TfilterAsync = F.Curry<
  <T, K extends keyof T, R>(
    asyncFilter: (arg: T[K], key: K) => Promise<boolean>,
    collection: T,
  ) => Promise<R[]>
>;
/**
 * (collection) filter의 비동기 함수\
 * 필터함수로 비동기 함수를 받아서 처리해준다.
 *
 * @param {(a) => Promise<bool>} asyncFilter 비동기 필터
 * @param {object|any[]} collection 대상 object 또는 array
 * @returns {Promise<any[]>} 결과 array를 resolve하는 promise
 */
const filterAsync: TfilterAsync = curry(
  async <T, K extends keyof T, R>(
    asyncFilter: (arg: T[K], key: K) => Promise<boolean>,
    collection: T,
  ): Promise<R[]> => {
    const composer = pipe(
      mapAsync(async (item: T[K], key: K) =>
        (await asyncFilter(item, key)) ? item : false,
      ),
      andThen((response) => filter(pipe(equals(false), not))(response)),
    );
    const result = await composer(collection);

    return result;
  },
);

type TfindAsync = F.Curry<
  <T, K extends keyof T, R>(
    asyncFilter: (arg: T[K], key: K) => Promise<boolean>,
    collection: T,
  ) => Promise<R>
>;

/**
 * (collection) find의 비동기 함수
 * @param {(a) => Promise<bool>} asyncFilter 비동기 필터
 * @param {object|any[]} collection 대상 object 또는 array
 * @returns {Promise<any>} 필터된 단일 결과를 resolve하는 promise
 */
const findAsync: TfindAsync = curry(
  async <T, K extends keyof T, R>(
    asyncFilter: (arg: T[K], key: K) => Promise<boolean>,
    collection: T,
  ): Promise<R> => {
    const composer = pipe(
      filterAsync(asyncFilter),
      andThen((response: R[]): R | undefined =>
        isEmpty(response) ? undefined : head(response),
      ),
      otherwise(always(undefined)),
    );
    const result = await composer(collection);

    return result;
  },
);

type TreduceAsync = F.Curry<
  <T, K extends keyof T>(
    asyncFn: (acc: any, arg: T[K], key: K) => Promise<any>,
    initAcc: Promise<any> | any,
    collection: T,
  ) => Promise<any>
>;

/**
 * asyncFn의 시작은 await accPromise가 되어야 한다.\
 * 순차적으로 실행된다.\
 * (ex 300ms이 걸리는 5개의 promise가 있다면, 최소 1500ms+alpah의 시간이 소요된다.\
 * 상기의 mapAsync의 경우 300+alpah의 시간만 소요된다.(Promise.all과 Promise.resolve의 차이))
 *
 * @param {(acc:any, v:any) => Promise<any>} asyncFn 비동기 iterator
 * @param {Promise<any>|any} initAcc 초기 누적기를 반환하는 promise 또는 누적기
 * @param {object|any[]} collection 대상 객체 또는 배열
 * @returns {Promise<any>} 결과 Promise
 */
const reduceAsync: TreduceAsync = curry(
  async <T, K extends keyof T>(
    asyncFn: (acc: any, arg: T[K], key: K) => Promise<any>,
    initAcc: Promise<any> | any,
    collection: T,
  ): Promise<any> => {
    const initAccPromise: Promise<any> = await pipe(promisify, (accP) =>
      Promise.resolve(accP),
    )(initAcc);
    const result = (reduce as IFpReduceEx).convert({ cap: false })(
      asyncFn,
      initAccPromise,
      collection,
    );

    return result;
  },
);

type Tkey = F.Curry<(obj: Record<string, any>, value: any) => string>;

/**
 * value로 object key 조회
 *
 * @param {object} obj 대상 객체
 * @param {string} value 조회 대상 값
 * @returns {string} 속성명
 */
const key: Tkey = curry((obj: object, value: any): string => {
  const composer = pipe(
    entries,
    find(([k, val]) => equals(value, val)),
    head,
  );
  const result = composer(obj);

  return result;
});

/**
 * shallow freeze 보완
 * (대상 object의 refence 타입의 properties까지 object.freeze 처리)
 * @param {object} obj 대상 객체
 * @returns {object} frozen 처리된 객체
 */
const deepFreeze = (obj: Record<string, any>): Record<string, any> => {
  const freezeRecursively = (v: any) =>
    isRef(v) && !Object.isFrozen(v) ? deepFreeze(v) : v;
  const composer = pipe(Object.freeze, forOwn(freezeRecursively));
  const result = composer(obj);

  return result;
};

type TtransformObjectKey = F.Curry<
  (
    transformFn: (orignStr: string) => string,
    obj: Record<string, any>,
  ) => Record<string, any>
>;

/**
 * 대상 객체의 속성명을 transformFn의 결과값으로 변환
 *
 * @param {(orignStr) => string} transformFn 변환함수
 * @param {object} obj 대상 객체
 * @returns {object} 속성명이 변환된 객체
 */
const transformObjectKey: TtransformObjectKey = curry(
  (
    transformFn: (orignStr: string) => string,
    obj: Record<string, any>,
  ): Record<string, any> => {
    const convertRecursively = (
      obj: Record<string, any>,
    ): Record<string, any> => {
      const convertTo = (o: Record<string, any>): Record<string, any> => {
        const composer = pipe(
          (reduce as IFpReduceEx).convert({ cap: false })(
            (acc: Record<string, any>, v: any, k: string) => {
              const conditional = (
                arg: Record<string, any> | any[] | any,
              ): Record<string, any> | any[] | any => {
                if (isPlainObject(arg)) {
                  return convertTo(arg);
                } else if (isArray(arg)) {
                  return map(conditional, arg);
                } else {
                  return identity(arg);
                }
              };

              const transformedKey = transformFn(k);
              if (!has(transformedKey, acc)) {
                const result = set(transformedKey, conditional(v), acc);
                return result;
              } else {
                throw new Error(
                  `${transformedKey} already exist. duplicated property name is not supported.`,
                );
              }
            },
            {},
          ),
        );
        const result = composer(o);
        return result;
      };
      const result = convertTo(obj);

      return result;
    };

    const result =
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

type Tap = F.Curry<(arg: any, curried: Function) => any>;

/**
 * applicative functor pattern 구현체
 * (주로 pipe함수에서 함수의 인자 순서를 변경하기 위해 사용)
 *
 * @param {any} arg 대입 인자
 * @param {function} curried currying된 함수
 * @returns {any} 결과값
 */
const ap: Tap = curry((a: any, curried: Function) => curried(a));

/**
 * 대상 인자가 undefined 또는 null이 아닌지 여부 조회
 *
 * @param {any} arg 대상인자
 * @returns {boolean} 대상 인자가 undefined 또는 null이 아닌지 여부
 */
const isNotNil: (arg: any) => boolean = pipe(isNil, not);

type TnotIncludes = F.Curry<
  (arg: any, targetArray: any[] | Record<string, any> | string) => boolean
>;

/**
 * arr인자 배열에 a인자가 포함되지 않았는지 여부 조회
 * @param {any} a 대상 인자
 * @param {any[] | Record<string, any> | string} arr 대상 배열
 * @returns {boolean} arr 배열에 a인자가 포함되지 않았는지 여부
 */
const notIncludes: TnotIncludes = curry(
  (arg: any, targetArray: any[] | Record<string, any> | string): boolean => {
    const result: boolean = !includes(arg, targetArray);

    return result;
  },
);

type TnotEquals = F.Curry<(a: any, b: any) => boolean>;

/**
 * a인자와 b인자가 다른지 여부 (deep equal) 조회
 * @param {any} a 비교 인자
 * @param {any} b 비교 인자
 * @returns {boolean} a인자와 b인자가 다른지 여부 (deep equal)
 */
const notEquals: TnotEquals = curry((a: any, b: any): boolean => {
  const composer = pipe(equals(a), not);
  const result = composer(b);

  return result;
});

type TremoveByIndex = F.Curry<
  <R>(index: number | string, targetArray: R[]) => R[]
>;
/**
 * arr인자의 idx인자의 index에 해당하는 요소 제거
 * @param {number|string} index numeric 타입 색인값
 * @param {any[]} targetArray 대상 배열
 * @returns {any[]} index에 해당하는 요소 제거된 배열
 */
const removeByIndex: TremoveByIndex = curry(
  <TResult>(index: number | string, targetArray: TResult[]): TResult[] => {
    if (
      isArray(targetArray) &&
      pipe(
        size,
        curry((index: number | string, sz: number) => {
          const num = toNumber(index);
          const isAccesable = isNumber(num) && lte(num, sz);

          return isAccesable;
        })(index),
      )(targetArray)
    ) {
      const cloned = cloneDeep(targetArray);
      cloned.splice(toNumber(index), 1);

      return cloned;
    }
    return targetArray;
  },
);

function removeLast(target: string): string;
function removeLast(target: any[]): any[];

/**
 * 인자의 마지막 요소 제거 (immutable)
 *
 * @param {string|any[]} target 문자열 또는 배열의 마지막 요소 제거
 * @returns 마지막 요소 제거된 인자
 */
function removeLast(target: string | any[]): string | any[] {
  if (isArray(target) || isString(target)) {
    const result = cloneDeep(target);
    isArray(target)
      ? (result as any[]).pop()
      : (result as string).substring(0, size(target) - 1);

    return result;
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

type Tprepend = F.Curry<<T>(arr: T[], arg: T | T[]) => T[]>;

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

type TmapWithKey = F.Curry<
  <T, K extends keyof T, R>(
    iteratee: (value: T[K], key: K) => R,
    collection: T,
  ) => R[]
>;

interface LodashConvertible {
  convert(options: { cap: boolean }): (...args: any[]) => any;
}

interface IFpMapEx extends LodashMap, LodashConvertible {}

/**
 * key(index)를 포함한 map
 * @param {(v, k) => any} f value, key(또는 index)를 인자로 갖는 callback
 * @param {object|any[]} a 대상 collection
 * @returns {any[]} 결과 배열
 */
const mapWithKey: TmapWithKey = curry(
  <T, K extends keyof T, R>(
    iteratee: (value: T[K], key: K) => R,
    collection: T,
  ): R[] => (map as IFpMapEx).convert({ cap: false })(iteratee, collection),
);

type TforEachWithKey = F.Curry<
  <T, K extends keyof T>(
    iteratee: (value: T[K], key: K) => T,
    collection: T,
  ) => T
>;
interface IFpForEachEx extends LodashForEach, LodashConvertible {}
/**
 * key(index)를 포함한 forEach
 * @param {(v, k) => any} f value, key(또는 index)를 인자로 갖는 callback
 * @param {object|any[]} a 대상 collection
 * @returns {void} 반환값 없음
 */
const forEachWithKey: TforEachWithKey = curry(
  <T, K extends keyof T>(
    iteratee: (value: T[K], key: K) => T,
    collection: T,
  ): T =>
    (forEach as IFpForEachEx).convert({ cap: false })(iteratee, collection),
);

type TreduceWithKey = F.Curry<
  <T, K extends keyof T, R>(
    iteratee: (acc: R, value: T[K], key: K) => R,
    acc: R,
    collection: T,
  ) => R
>;

interface IFpReduceEx extends LodashReduce, LodashConvertible {}

/**
 * key(index)를 포함한 reduce
 *
 * @param {(acc, v, k) => any} f accumulator, value, key(또는 index)를 인자로 갖는 callback
 * @param {any} acc 누적기
 * @param {object|any[]} 대상 collection
 * @returns {any} 누적기
 */
const reduceWithKey: TreduceWithKey = curry(
  <T, K extends keyof T, R>(
    iteratee: (acc: R, value: T[K], key: K) => R,
    acc: R,
    collection: T,
  ): R =>
    (reduce as IFpReduceEx).convert({ cap: false })(iteratee, acc, collection),
);

/**
 * falsy 타입(0, -0, NaN, false, '')인지 여부 조회
 * @param {any} arg 조회 대상
 * @returns {boolean} falsy 타입(0, -0, NaN, false, '')인지 여부
 */
const isFalsy = (arg: any): boolean => {
  return isNil(arg) || some(equals(arg), [0, -0, NaN, false, '']);
};

/**
 * truthy 타입 인지 여부 조회
 * (falsy타입(0, -0, NaN, false, '')이 아니면 truthy 타입)
 * @param {any} arg 조회 대상
 * @returns {boolean} truthy 타입 인지 여부
 */
const isTruthy = (arg: any): boolean => !isFalsy(arg);

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
      return isNil(target) || isNil(get(path, target))
        ? defaultValue
        : get(path, target);
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
  forEachAsync,
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
