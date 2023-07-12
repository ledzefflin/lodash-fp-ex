import fp from 'lodash/fp';
import { F } from 'ts-toolbelt';

/**
 * 대상 문자열이 json형식 문자열인지 여부 조회
 *
 * @param {string} jsonStr 조회 대상 문자열
 * @returns {boolean} json 문자열인지 여부
 */
const isJson = (jsonStr: string): boolean => {
  const composer = fp.pipe(fp.attempt, fp.isError);
  const result: boolean =
    fp.isString(jsonStr) && !composer(() => JSON.parse(jsonStr));

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
    fp.isNil(arg) || fp.isBoolean(arg) || fp.isNumber(arg) || fp.isString(arg);

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
  const composer = fp.pipe(isVal, not);
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
  fp.isFunction(fp.get('then', x)) && fp.isFunction(fp.get('catch', x));

/**
 * 대상 함수를 promise로 lift
 *
 * @param {(...args: any[]) => any} fn 대상 합수
 * @param  {any[]} args 함수 인자 목록
 * @returns {Promise<any>} Promise로 lift된 Promise 객체
 */
const fnPromisify = (
  fn: (...args: any[]) => any,
  ...args: any[]
): Promise<any> => {
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
  const cond = fp.cond([
    [fp.isFunction, () => fnPromisify(a, ...args)],
    [isPromise, (a: Promise<any>): Promise<any> => fp.identity(a)],
    [fp.T, (a) => Promise.resolve(a)],
  ]);
  const result = cond(a);

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
const andThen: TandThen = fp.curry(
  (
    successHandler: (response: any) => any,
    thenable: Promise<any>,
  ): Promise<any> => promisify(thenable).then(flatPromise(successHandler)),
);

type Totherwise = F.Curry<
  (
    failureHandler: (error: Error | any) => never | any,
    thenable: Promise<Error | any>,
  ) => Promise<never | any>
>;
/**
 * lodash 형태의 promise catch
 *
 * @param {(error:Error|any) => never | any} failureHandler error 처리 callback
 * @param {Promise<Error|any>} thenable error를 resolve 하는 promise
 * @return {Promise<never | any>} error 상태의 Promise 객체
 */
const otherwise: Totherwise = fp.curry(
  (
    failureHandler: (error: Error | any) => never | any,
    thenable: Promise<Error | any>,
  ): Promise<never | any> =>
    promisify(thenable).catch(flatPromise(failureHandler)),
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
const _finally: Tfinally = fp.curry(
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
  const composer = fp.pipe(fp.isEmpty, not);
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

type Tternary = F.Curry<
  <T>(
    evaluator: (arg: T) => boolean | any,
    trueHandler: (arg: T) => any,
    falseHandler: (arg: T) => any,
    arg: T,
  ) => any
>;
/**
 * 삼항식 helper 함수\
 * evaluator의 실행 결과가 true면 trueHandler(실행)반환, false면 falseHandler(실행)반환\
 * evaluator가 함수가 아니면 arg인자를 boolean으로 변환하여 반환된 값으로 trueHandler 또는 falseHandler 실행
 *
 * @deprecated
 * @param {(arg: any) => bool | any} evaluator 대상인자가 true 인지여부 조회 함수 또는 boolean을 반환하는 함수 또는 bool로 변환되는 아무값
 * @param {(arg: any) => any | any} trueHandler evaluator가 true를 반환하면,  실행되는 대상인자를 인자로 갖는 함수 또는 반환되는 아무값
 * @param {(arg: any) => any | any} falseHandler evaluator가 false를 반환하면, 실행되는 대상인자를 인자로 갖는 함수 또는 반환되는 아무값
 * @param {any} arg 대상인자
 * @returns {any} handler의 결과값
 */
const ternary: Tternary = fp.curry(
  <T>(
    evaluator: (arg: T) => boolean | any,
    trueHandler: (arg: T) => any | any,
    falseHandler: (arg: T) => any | any,
    arg: T,
  ): any => {
    const executor = fp.curry(
      (
        t: (arg: T) => any | any,
        f: (arg: T) => any | any,
        a: T,
        isTrue: boolean,
      ): any => {
        const result = isTrue
          ? fp.isFunction(t)
            ? t(a)
            : fp.identity(t)
          : fp.isFunction(f)
          ? f(a)
          : fp.identity(f);

        return result;
      },
    );
    const result = executor(
      trueHandler,
      falseHandler,
      arg,
      fp.isFunction(evaluator) ? evaluator(arg) : !!arg,
    );

    return result;
  },
);

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
const ifT: TifT = fp.curry(
  <T, R>(
    evaluator: (arg: T) => boolean | boolean,
    trueHandler: (arg: T) => R | R,
    arg: T,
  ): T | R => {
    const isValidEvaluator =
      fp.isFunction(evaluator) || fp.isBoolean(evaluator);

    if (isValidEvaluator) {
      // evaluator가 함수인 경우
      if (fp.isFunction(evaluator)) {
        if (fp.pipe(evaluator, fp.equals(true))(arg)) {
          return fp.isFunction(trueHandler) ? trueHandler(arg) : trueHandler;
        } else {
          return arg;
        }
      } else {
        // evaluator가 boolean인 경우
        if (evaluator) {
          return fp.isFunction(trueHandler) ? trueHandler(arg) : trueHandler;
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
const ifF: TifF = fp.curry(
  <T, R>(
    evaluator: (arg: T) => boolean | boolean,
    falseHandler: (arg: T) => R | R,
    arg: T,
  ): T | R => {
    const isValidEvaluator =
      fp.isFunction(evaluator) || fp.isBoolean(evaluator);

    if (isValidEvaluator) {
      // evaluator가 함수인 경우
      if (fp.isFunction(evaluator)) {
        if (fp.pipe(evaluator, fp.equals(false))(arg)) {
          return fp.isFunction(falseHandler) ? falseHandler(arg) : falseHandler;
        } else {
          return arg;
        }
      } else {
        // evaluator가 boolean인 경우
        if (evaluator) {
          return fp.isFunction(falseHandler) ? falseHandler(arg) : falseHandler;
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
const instanceOf: TinstanceOf = fp.curry(
  (t: any, a: any): boolean => a instanceof t,
);

/**
 * 대상 문자열을 pascalcase 문자열로 변환
 * @param {string} str 대상 문자열
 * @returns {string} pascal case로 변환된 문자열
 */
const pascalCase = (str: string): string => {
  const composer = fp.pipe(fp.camelCase, fp.upperFirst);
  const result = composer(str);

  return result;
};

type TmapAsync = F.Curry<
  <T, K extends keyof T, R>(
    asyncMapper: (arg: T[K], key: K) => Promise<R>,
    collection: T,
  ) => Promise<R[]>
>;

interface IFpFlatMapDeepEx extends fp.LodashFlatMapDeep, LodashConvertible {}
/**
 * (collection) fp.map의 비동기 함수\
 * mapper 함수로 비동기 함수를 받아서 처리해준다.
 *
 * @param {(a) => Promise<any>} asyncMapper 비동기 mapper
 * @param {object|any[]} collection 대상 object 또는 array
 * @returns {Promise<any[]>} 결과 array를 resolve 하는 promise
 */
const mapAsync: TmapAsync = fp.curry(
  async <T, K extends keyof T, R>(
    asyncMapper: (arg: T[K], key: K) => Promise<R>,
    collection: T,
  ): Promise<R[]> => {
    const composer = fp.pipe(
      (fp.flatMapDeep as IFpFlatMapDeepEx).convert({ cap: false })(
        fp.pipe(asyncMapper, promisify),
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
const forEachAsync = fp.curry(
  async <T extends object, K extends keyof T, R>(
    callbackAsync: (value: T[K], key: K) => Promise<R>,
    collection: T,
  ): Promise<R[]> => {
    const loopResults = [];
    const entries = fp.entries(collection) as [K, T[K]][];

    for (const entry of entries) {
      loopResults.push(
        await callbackAsync(
          entry[1],
          (fp.isArray(collection) ? fp.toNumber(entry[0]) : entry[0]) as K,
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
 * (collection) fp.filter의 비동기 함수\
 * 필터함수로 비동기 함수를 받아서 처리해준다.
 *
 * @param {(a) => Promise<bool>} asyncFilter 비동기 필터
 * @param {object|any[]} collection 대상 object 또는 array
 * @returns {Promise<any[]>} 결과 array를 resolve하는 promise
 */
const filterAsync: TfilterAsync = fp.curry(
  async <T, K extends keyof T, R>(
    asyncFilter: (arg: T[K], key: K) => Promise<boolean>,
    collection: T,
  ): Promise<R[]> => {
    const composer = fp.pipe(
      mapAsync(async (item: T[K], key: K) =>
        (await asyncFilter(item, key)) ? item : false,
      ),
      andThen((response) =>
        fp.filter(fp.pipe(fp.equals(false), not))(response),
      ),
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
 * (collection) fp.find의 비동기 함수
 * @param {(a) => Promise<bool>} asyncFilter 비동기 필터
 * @param {object|any[]} collection 대상 object 또는 array
 * @returns {Promise<any>} 필터된 단일 결과를 resolve하는 promise
 */
const findAsync: TfindAsync = fp.curry(
  async <T, K extends keyof T, R>(
    asyncFilter: (arg: T[K], key: K) => Promise<boolean>,
    collection: T,
  ): Promise<R> => {
    const composer = fp.pipe(
      filterAsync(asyncFilter),
      andThen((response: R[]): R | undefined =>
        fp.isEmpty(response) ? undefined : fp.head(response),
      ),
      otherwise(fp.always(undefined)),
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
const reduceAsync: TreduceAsync = fp.curry(
  async <T, K extends keyof T>(
    asyncFn: (acc: any, arg: T[K], key: K) => Promise<any>,
    initAcc: Promise<any> | any,
    collection: T,
  ): Promise<any> => {
    const initAccPromise: Promise<any> = await fp.pipe(promisify, (accP) =>
      Promise.resolve(accP),
    )(initAcc);
    const result = (fp.reduce as IFpReduceEx).convert({ cap: false })(
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
const key: Tkey = fp.curry((obj: object, value: any): string => {
  const composer = fp.pipe(
    fp.entries,
    fp.find(([k, val]) => fp.equals(value, val)),
    fp.head,
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
  const composer = fp.pipe(Object.freeze, fp.forOwn(freezeRecursively));
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
const transformObjectKey: TtransformObjectKey = fp.curry(
  (
    transformFn: (orignStr: string) => string,
    obj: Record<string, any>,
  ): Record<string, any> => {
    const convertRecursively = (
      obj: Record<string, any>,
    ): Record<string, any> => {
      const convertTo = (o: Record<string, any>): Record<string, any> => {
        const composer = fp.pipe(
          (fp.reduce as IFpReduceEx).convert({ cap: false })(
            (acc: Record<string, any>, v: any, k: string) => {
              const cond = (
                arg: Record<string, any> | any[] | any,
              ): Record<string, any> | any[] | any => {
                if (fp.isPlainObject(arg)) {
                  return convertTo(arg);
                } else if (fp.isArray(arg)) {
                  return fp.map(cond, arg);
                } else {
                  return fp.identity(arg);
                }
              };

              const transformedKey = transformFn(k);
              if (!fp.has(transformedKey, acc)) {
                const result = fp.set(transformedKey, cond(v), acc);
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
      fp.isObject(obj) || fp.isArray(obj) ? convertRecursively(obj) : obj;

    return result;
  },
);

/**
 * 대상 object의 property key문자열을 camelcase 문자열로 변환
 *
 * @param {object} obj 대상 객체
 * @returns {object} 속성명이 camel case로 변환된 객체
 */
const toCamelcase = transformObjectKey(fp.camelCase);

/**
 * 대상 object의 property key문자열을 snakecase 문자열로 변환
 *
 * @param {object} obj 대상 객체
 * @returns {object} 속성명이 snake case로 변환된 객체
 */
const toSnakecase = transformObjectKey(fp.snakeCase);

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
  fp.isString(dateStr) && !isNaN(Date.parse(dateStr));

type Tap = F.Curry<(arg: any, curried: Function) => any>;

/**
 * applicative functor pattern 구현체
 * (주로 fp.pipe함수에서 함수의 인자 순서를 변경하기 위해 사용)
 *
 * @param {any} arg 대입 인자
 * @param {function} curried currying된 함수
 * @returns {any} 결과값
 */
const ap: Tap = fp.curry((a: any, curried: Function) => curried(a));

/**
 * 대상 인자가 undefined 또는 null이 아닌지 여부 조회
 *
 * @param {any} arg 대상인자
 * @returns {boolean} 대상 인자가 undefined 또는 null이 아닌지 여부
 */
const isNotNil: (arg: any) => boolean = fp.pipe(fp.isNil, not);

type TnotIncludes = F.Curry<
  (arg: any, targetArray: any[] | Record<string, any> | string) => boolean
>;

/**
 * arr인자 배열에 a인자가 포함되지 않았는지 여부 조회
 * @param {any} a 대상 인자
 * @param {any[] | Record<string, any> | string} arr 대상 배열
 * @returns {boolean} arr 배열에 a인자가 포함되지 않았는지 여부
 */
const notIncludes: TnotIncludes = fp.curry(
  (arg: any, targetArray: any[] | Record<string, any> | string): boolean => {
    const result: boolean = !fp.includes(arg, targetArray);

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
const notEquals: TnotEquals = fp.curry((a: any, b: any): boolean => {
  const composer = fp.pipe(fp.equals(a), not);
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
const removeByIndex: TremoveByIndex = fp.curry(
  <TResult>(index: number | string, targetArray: TResult[]): TResult[] => {
    if (
      fp.isArray(targetArray) &&
      fp.pipe(
        fp.size,
        fp.curry((index: number | string, sz: number) => {
          const num = fp.toNumber(index);
          const isAccesable = fp.isNumber(num) && fp.lte(num, sz);

          return isAccesable;
        })(index),
      )(targetArray)
    ) {
      const cloned = fp.cloneDeep(targetArray);
      cloned.splice(fp.toNumber(index), 1);

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
  if (fp.isArray(target) || fp.isString(target)) {
    const result = fp.cloneDeep(target);
    fp.isArray(target)
      ? (result as any[]).pop()
      : (result as string).substring(0, fp.size(target) - 1);

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
const append = fp.concat;

type Tprepend = F.Curry<<T>(arr: T[], arg: T | T[]) => T[]>;

/**
 * array 인자의 (index상)앞쪽에 value인자를 추가
 *
 * @param {any[]} targetArray 병합대상 배열
 * @param {any|any[]} value 병합 인자
 * @returns {any[]} 병합된 배열
 */
const prepend: Tprepend = fp.curry(<T>(targetArray: T[], value: T | T[]): T[] =>
  fp.isArray(value)
    ? fp.concat(value, targetArray)
    : fp.concat([value], targetArray),
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

interface IFpMapEx extends fp.LodashMap, LodashConvertible {}

/**
 * key(index)를 포함한 fp.map
 * @param {(v, k) => any} f value, key(또는 index)를 인자로 갖는 callback
 * @param {object|any[]} a 대상 collection
 * @returns {any[]} 결과 배열
 */
const mapWithKey: TmapWithKey = fp.curry(
  <T, K extends keyof T, R>(
    iteratee: (value: T[K], key: K) => R,
    collection: T,
  ): R[] => (fp.map as IFpMapEx).convert({ cap: false })(iteratee, collection),
);

type TforEachWithKey = F.Curry<
  <T, K extends keyof T>(
    iteratee: (value: T[K], key: K) => T,
    collection: T,
  ) => T
>;
interface IFpForEachEx extends fp.LodashForEach, LodashConvertible {}
/**
 * key(index)를 포함한 fp.forEach
 * @param {(v, k) => any} f value, key(또는 index)를 인자로 갖는 callback
 * @param {object|any[]} a 대상 collection
 * @returns {void} 반환값 없음
 */
const forEachWithKey: TforEachWithKey = fp.curry(
  <T, K extends keyof T>(
    iteratee: (value: T[K], key: K) => T,
    collection: T,
  ): T =>
    (fp.forEach as IFpForEachEx).convert({ cap: false })(iteratee, collection),
);

type TreduceWithKey = F.Curry<
  <T, K extends keyof T, R>(
    iteratee: (acc: R, value: T[K], key: K) => R,
    acc: R,
    collection: T,
  ) => R
>;

interface IFpReduceEx extends fp.LodashReduce, LodashConvertible {}

/**
 * key(index)를 포함한 reduce
 *
 * @param {(acc, v, k) => any} f accumulator, value, key(또는 index)를 인자로 갖는 callback
 * @param {any} acc 누적기
 * @param {object|any[]} 대상 collection
 * @returns {any} 누적기
 */
const reduceWithKey: TreduceWithKey = fp.curry(
  <T, K extends keyof T, R>(
    iteratee: (acc: R, value: T[K], key: K) => R,
    acc: R,
    collection: T,
  ): R =>
    (fp.reduce as IFpReduceEx).convert({ cap: false })(
      iteratee,
      acc,
      collection,
    ),
);

/**
 * falsy 타입(0, -0, NaN, false, '')인지 여부 조회
 * @param {any} arg 조회 대상
 * @returns {boolean} falsy 타입(0, -0, NaN, false, '')인지 여부
 */
const isFalsy = (arg: any): boolean => {
  return fp.isNil(arg) || fp.some(fp.equals(arg), [0, -0, NaN, false, '']);
};

/**
 * truthy 타입 인지 여부 조회
 * (falsy타입(0, -0, NaN, false, '')이 아니면 truthy 타입)
 * @param {any} arg 조회 대상
 * @returns {boolean} truthy 타입 인지 여부
 */
const isTruthy = (arg: any): boolean => !isFalsy(arg);

/**
 * fp.getOr override
 *
 * fp.getOr의 반환값이 null인 경우, 기본값 반환되게 수정한 버전
 * circular dependency 때문에 closure로 작성
 */
const getOr = (({ curry, getOr }) => {
  const _getOr = curry((defaultValue: any, path: string, target: any) => {
    return fp.isNil(target) || fp.isNil(fp.get(path, target))
      ? defaultValue
      : fp.get(path, target);
  });
  return _getOr;
})(fp);

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
  removeByIdx: removeByIndex,
  removeLast,
  append,
  prepend,

  mapWithKey,
  mapWithIdx: mapWithKey,
  mapWithIndex: mapWithKey,
  forEachWithKey,
  forEachWithIdx: forEachWithKey,
  forEachWithIndex: forEachWithKey,
  reduceWithKey,
  reduceWithIdx: reduceWithKey,
  reduceWithIndex: reduceWithKey,
  isFalsy,
  isTruthy,

  getOr,
  delayAsync,
  sleep: delayAsync,
};
