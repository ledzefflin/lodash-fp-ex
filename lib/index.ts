import fp from 'lodash/fp';
import { F } from 'ts-toolbelt';

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

type Tthen = F.Curry<
  <T>(fn: (response: T) => any, thenable: Promise<T>) => Promise<any>
>;
/**
 * lodash 형태의 promise then
 *
 * @param {(response:any) => any} successHandler 응답값 처리 callback
 * @param {Promise<any>} thenable resolve 대상 Promise 객체
 * @returns {Promise<any>} fullfilled 상태의 Promise 객체
 */
const then: Tthen = fp.curry(
  <T>(
    successHandler: (response: T) => any,
    thenable: Promise<T>,
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
    trueHandler: (arg: T) => any | any,
    falseHandler: (arg: T) => any | any,
    arg: T,
  ) => any
>;
/**
 * 삼항식 helper 함수\
 * (isTrue가 true면 t(실행)반환, false면 f(실행)반환)
 *
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
      fp.isFunction(evaluator) ? evaluator(arg) : !!evaluator,
    );

    return result;
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
  <T, TResult>(
    asyncMapper: (arg: T) => Promise<TResult>,
    collection: ArrayLike<T> | any,
  ) => Promise<TResult[]>
>;
/**
 * (collection) fp.map의 비동기 함수\
 * mapper 함수로 비동기 함수를 받아서 처리해준다.
 *
 * @param {(a) => Promise<any>} asyncMapper 비동기 mapper
 * @param {object|any[]} collection 대상 object 또는 array
 * @returns {Promise<any[]>} 결과 array를 resolve 하는 promise
 */
const mapAsync: TmapAsync = fp.curry(
  async <T, TResult>(
    asyncMapper: (arg: T) => Promise<TResult>,
    collection: ArrayLike<T> | any,
  ): Promise<TResult[]> => {
    const composer = fp.pipe(
      fp.flatMapDeep(fp.pipe(asyncMapper, promisify)),
      async (a: Promise<any>[]) => await Promise.all(a),
    );
    const result = await composer(collection);

    return result;
  },
);
