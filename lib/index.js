import fp from 'lodash/fp';

/**
 * 대상 인자가 promise(thenable)인지 여부 조회
 *
 * @param {any} x 조회 대상
 * @return {boolean} 대상 인자가 promise(thenable)인지 여부
 */
const isPromise = (x) => fp.isFunction(fp.get('then', x)) && fp.isFunction(fp.get('catch', x));

/**
 * 대상 함수를 promise로 lift
 *
 * @param {function} fn 대상 합수
 * @param  {...any} args 함수 인자 목록
 * @returns {Promise<any>} Promise로 lift된 Promise 객체
 */
const fnPromisify = (fn, ...args) => {
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
 * @param {...any} args 대상 인자 a가 함수인 경우, 함수의 인자목록
 * @return {Promise<any>} Promise로 lift된 Promise 객채
 */
const promisify = (a, ...args) => {
  const cond = fp.cond([
    [fp.isFunction, () => fnPromisify(a, ...args)],
    [isPromise, fp.identity],
    [fp.T, (a) => Promise.resolve(a)]
  ]);
  const result = cond(a);

  return result;
};

/**
 * promise가 또다른 promise를 resolve하는 경우, promise의 중첩을 제거하기 위한 helper 함수
 *
 * @param {Promise<any>} thenable Promise 객체
 * @return {Promise<any>} 중첩 제거된 Promise 객체
 */
const flatPromise = (thenable) =>
  isPromise(thenable) ? thenable.then((x) => flatPromise(x)) : thenable;

/**
 * lodash 형태의 promise then
 *
 * @param {(response) => any} fn 응답값 처리 callback
 * @param {Promise<any>} thenable resolve 대상 Promise 객체
 * @returns {Promise<any>} fullfilled 상태의 Promise 객체
 */
const then = fp.curry((fn, thenable) => promisify(thenable).then(flatPromise(fn)));

/**
 * lodash 형태의 promise catch
 *
 * @param {(error) => never} fn error 처리 callback
 * @param {Promise<error>} thenable error를 resolve 하는 promise
 * @return {Promise<never>} error 상태의 Promise 객체
 */
const otherwise = fp.curry((fn, thenable) => promisify(thenable).catch(flatPromise(fn)));

/**
 * lodash 형태의 promise finally
 *
 * @param {() => any} fn Promise 상태와 무관하게 실행되는 callback
 * @param {Promise<any>} thenable Promise 객체
 * @return {void} 반환값 없음
 */
const _finally = fp.curry((fn, thenable) => promisify(thenable).finally(flatPromise(fn)));

/**
 * invert boolean
 * @param {any} x 대상
 * @return {boolean} not 연산된 값
 */
const not = (x) => !x;

/**
 * 대상이 비어있지 않은지 여부
 * (주의: 숫자타입은 항상 true를 반환)
 *
 * @param {any} a 대상
 * @returns {boolean} 비어 있는지 여부
 */
const isNotEmpty = fp.pipe(fp.isEmpty, not);

/**
 * 대상 인자를 boolean 타입으로 변환\
 *
 * @param {any} a 대상
 * @returns {boolean} 변환된 boolean 타입 값
 */
const toBool = (a) => !!a;

/**
 * 삼항식 helper 함수\
 * (isTrue가 true면 t(실행)반환, false면 f(실행)반환)
 *
 * @param {function} evaluator 대상인자가 true 인지여부 조회 함수 또는 boolean을 반환하는 함수
 * @param {function} trueHandler evaluator가 true를 반환하면,  실행되는 대상인자를 인자로 갖는 함수
 * @param {function} falseHandler evaluator가 false를 반환하면, 실행되는 대상인자를 인자로 갖는 함수
 * @param {function|any} a 대상인자
 * @returns {any} handler의 결과값
 */
const ternary = fp.curry((evaluator, trueHandler, falseHandler, a) => {
  const executor = fp.curry((t, f, a, isTrue) => {
    const result = isTrue ? (fp.isFunction(t) ? t(a) : t) : fp.isFunction(f) ? f(a) : f;
    return result;
  });
  const getEvaluator = (fn) => (fp.isNil(fn) ? fp.identity : fn);
  const result = executor(trueHandler, falseHandler, a, getEvaluator(evaluator)(a));

  return result;
});

/**
 * a인자가 t타입인지 여부 조회
 * @param {any} t 조회 대상 type
 * @param {any} a 조회 대상
 * @returns {boolean} a인자가 t타입인지 여부
 */
const instanceOf = fp.curry((t, a) => a instanceof t);

/**
 * 대상 문자열을 pascalcase 문자열로 변환
 * @param {string} a 대상 문자열
 * @returns {string} pascal case로 변환된 문자열
 */
const pascalCase = fp.pipe(fp.camelCase, fp.upperFirst);

/**
 * (collection) fp.map의 비동기 함수\
 * mapper 함수로 비동기 함수를 받아서 처리해준다.
 *
 * @param {(a) => Promise<any>} asyncMapper 비동기 mapper
 * @param {object|any[]} collection 대상 object 또는 array
 * @returns {Promise<any[]>} 결과 array를 resolve 하는 promise
 */
const mapAsync = fp.curry(async (asyncMapper, collection) => {
  const composer = fp.pipe(
    fp.flatMapDeep(fp.pipe(asyncMapper, promisify)),
    async (a) => await Promise.all(a)
  );
  const result = await composer(collection);

  return result;
});

/**
 * (collection) fp.filter의 비동기 함수\
 * 필터함수로 비동기 함수를 받아서 처리해준다.
 *
 * @param {(a) => Promise<bool>} asyncFilter 비동기 필터
 * @param {object|any[]} collection 대상 object 또는 array
 * @returns {Promise<any[]>} 결과 array를 resolve하는 promise
 */
const filterAsync = fp.curry(async (asyncFilter, arr) => {
  const composer = fp.pipe(
    mapAsync(async (item) => ((await asyncFilter(item)) ? item : false)),
    then(fp.filter(fp.pipe(fp.equals(false), not)))
  );
  const result = await composer(arr);

  return result;
});
/**
 * (collection) fp.find의 비동기 함수
 * @param {(a) => Promise<bool>} asyncFn 비동기 필터
 * @param {object|any[]} collection 대상 object 또는 array
 * @returns {Promise<any>} 필터된 단일 결과를 resolve하는 promise
 */
const findAsync = fp.curry(async (asyncFn, arr) => {
  const composer = fp.pipe(
    mapAsync(asyncFn),
    then(fp.indexOf(true)),
    then((idx) => fp.get(`[${idx}]`, arr)),
    otherwise(fp.always(undefined))
  );
  const result = await composer(arr);

  return result;
});

/**
 * asyncFn의 시작은 await accPromise가 되어야 한다.\
 * 순차적으로 실행된다.\
 * (ex 300ms이 걸리는 5개의 promise가 있다면, 최소 1500ms+alpah의 시간이 소요된다.\
 * 상기의 mapAsync의 경우 300+alpah의 시간만 소요된다.(Promise.all과 Promise.resolve의 차이))
 *
 * @param {(acc, v) => Promise<any>} asyncFn 비동기 iterator
 * @param {Promise<any>} initAcc 초기 누적기를 반환하는 promise
 * @param {object|any[]} dest 대상 객체 또는 배열
 * @returns {Promise<any>} 결과 Promise
 */
const reduceAsync = fp.curry((asyncFn, initAcc, dest) => {
  const initAccPromise = Promise.resolve(initAcc);
  const result = fp.reduce(asyncFn, initAccPromise, dest);
  return result;
});

/**
 * 비동기 forEach
 * 실행함수로 비동기 함수를 받아서 처리해준다
 * 순차실행
 *
 * @param {(a) => Promise<any>} cb 비동기 iterator
 * @param {object|any[]} collection 대상 객체 또는 배열
 * @returns {Promise<any[]>} 결과 Promise
 */
const forEachAsync = fp.curry(async (cb, collection) => {
  const loopResults = [];
  const iterator = fp.entries(collection);

  for (const e of iterator) {
    loopResults.push(await cb(e[1], e[0]));
  }

  return loopResults;
});

/**
 * value로 object key 조회
 *
 * @param {object} a 대상 객체
 * @param {string} v 조회 대상 key (속성명)
 * @returns {any} 속성명에 해당하는 값
 */
const key = fp.curry((a, v) => {
  const composer = fp.pipe(
    fp.entries,
    fp.find(([k, val]) => fp.equals(v, val)),
    fp.head
  );
  const result = composer(a);

  return result;
});

/**
 * 대상 문자열이 json형식 문자열인지 여부 조회
 *
 * @param {string} a 조회 대상 문자열
 * @returns {boolean} json 문자열인지 여부
 */
const isJson = (a) => {
  const composer = fp.pipe(fp.attempt, fp.isError);
  return fp.isString(a) && !composer(() => JSON.parse(a));
};

/**
 * shallow freeze 보완
 * (대상 object의 refence 타입의 properties까지 object.freeze 처리)
 * @param {object} obj 대상 객체
 * @returns {object} frozen 처리된 객체
 */
const deepFreeze = (obj) => {
  const freezeRecursively = (v) => (isRef(v) && !Object.isFrozen(v) ? deepFreeze(v) : v);
  const composer = fp.pipe(Object.freeze, fp.forOwn(freezeRecursively));
  const result = composer(obj);

  return result;
};

/**
 * 대상 객체의 속성명을 transformFn의 결과값으로 변환
 *
 * @param {(a) => string} transformFn 변환함수
 * @param {object} dest 대상 객체
 * @returns {object} 속성명이 변환된 객체
 */
const transformObjectKey = fp.curry((transformFn, dest) => {
  const convertRecursively = (dest) => {
    const convertTo = (o) => {
      const composer = fp.pipe(
        fp.entries,
        fp.reduce((acc, [k, v]) => {
          const cond = fp.cond([
            [fp.isPlainObject, convertTo],
            [fp.isArray, (v) => v.map(cond)],
            [fp.T, (a) => a]
          ]);
          const transformedKey = transformFn(k);
          if (!fp.has(transformedKey, acc)) {
            acc[transformedKey] = cond(v);
            return acc;
          } else {
            throw new Error(
              `${transformedKey} already exist. duplicated property name is not supported.`
            );
          }
        }, {})
      );
      const result = composer(o);
      return result;
    };
    const result = convertTo(dest);
    return result;
  };

  const result = fp.isObject(dest) || fp.isArray(dest) ? convertRecursively(dest) : dest;

  return result;
});

/**
 * 대상 object의 property key문자열을 camelcase 문자열로 변환
 *
 * @param {object} a 대상 객체
 * @returns {object} 속성명이 camel case로 변환된 객체
 */
const toCamelcase = transformObjectKey(fp.camelCase);

/**
 * 대상 object의 property key문자열을 snakecase 문자열로 변환
 *
 * @param {object} a 대상 객체
 * @returns {object} 속성명이 snake case로 변환된 객체
 */
const toSnakecase = transformObjectKey(fp.snakeCase);
const toPascalcase = transformObjectKey(pascalCase);

/**
 * date형식 문자열 여부 조회
 * @param {string} str date형식 문자열
 * @returns {boolean} date형식 문자열 여부
 */
const isDatetimeString = (str) => isNaN(str) && !isNaN(Date.parse(str));
/**
 * applicative functor pattern 구현체
 * (주로 fp.pipe함수에서 함수의 인자 순서를 변경하기 위해 사용)
 *
 * @param {any} a 대입 인자
 * @param {function} curried currying된 함수
 * @returns {any} 결과값
 */
const ap = fp.curry((a, curried) => curried(a));

/**
 * 대상 인자가 undefined 또는 null이 아닌지 여부 조회
 *
 * @param {any} a 대상인자
 * @returns {boolean} 대상 인자가 undefined 또는 null이 아닌지 여부
 */
const isNotNil = fp.pipe(fp.isNil, not);

/**
 * a인자를 인자로, evaluator함수 실행,
 * true면 trueHandler에 a인자 대입
 * false면 a 반환
 *
 * @param {(a) => boolean} evaluator a를 인자로 하는 평가함수
 * @param {(a) => any} trueHandler evaluator의 결과가 true인 경우, a를 인자로 실행되는 callback
 * @param {any} a 대상 인자
 * @returns {any} evaluator가 true를 반환하는 경우, trueHandler의 결과값, false인 경우 a 반환
 */
const ifT = fp.curry((evaluator, trueHandler, a) => {
  const isValidParams = fp.every(fp.isFunction, [evaluator, trueHandler]);

  if (isValidParams) {
    return fp.pipe(evaluator, fp.equals(true))(a) ? trueHandler(a) : a;
  } else {
    throw new Error('invalid parameter(s)');
  }
});

/**
 * a인자를 인자로, evaluator함수 실행,
 * false면 falseHandler에 a인자 대입
 * true면 a 반환
 *
 * @param {(a) => boolean} evaluator a를 인자로 하는 평가함수
 * @param {(a) => any} falseHandler evaluator의 결과가 false인 경우, a를 인자로 실행되는 callback
 * @param {any} a 대상 인자
 * @returns {any} evaluator가 false를 반환하는 경우, falseHandler의 결과값, true경우 a 반환
 */
const ifF = fp.curry((evaluator, falseHandler, a) => {
  const isValidParams = fp.every(fp.isFunction, [evaluator, falseHandler]);

  if (isValidParams) {
    return fp.pipe(evaluator, fp.equals(false))(a) ? falseHandler(a) : a;
  } else {
    throw new Error('invalid parameter(s)');
  }
});

/**
 * arr인자 배열에 a인자가 포함되지 않았는지 여부 조회
 * @param {any} a 대상 인자
 * @param {any[]} arr 대상 배열
 * @returns {boolean} arr 배열에 a인자가 포함되지 않았는지 여부
 */
const notIncludes = fp.curry((a, arr) => {
  const composer = fp.pipe(fp.includes, ap(arr), not);
  const result = composer(a);

  return result;
});

/**
 * a인자와 b인자가 다른지 여부 (deep equal) 조회
 * @param {any} a 비교 인자
 * @param {any} b 비교 인자
 * @returns {boolean} a인자와 b인자가 다른지 여부 (deep equal)
 */
const notEquals = fp.curry((a, b) => fp.pipe(fp.equals(a), not)(b));

/**
 * arr인자의 idx인자의 index에 해당하는 요소 제거
 * @param {number|string} idx numeric 타입 색인값
 * @param {any[]} arr 대상 배열
 * @returns {any[]} index에 해당하는 요소 제거된 배열
 */
const removeByIndex = fp.curry((idx, arr) => {
  if (fp.isArray(arr)) {
    const cloned = fp.cloneDeep(arr);
    cloned.splice(fp.toNumber(idx), 1);

    return cloned;
  }
  return arr;
});

/**
 * 인자의 마지막 요소 제거 (immutable)
 *
 * @param {string|any[]} arr 문자열 또는 배열의 마지막 요소 제거
 * @returns 마지막 요소 제거된 인자
 */
const removeLast = (a) => {
  const nextA = fp.cloneDeep(a);
  if (fp.isArray(a)) {
    nextA.pop();
  }
  if (fp.isString(a)) {
    return nextA.substring(0, fp.size(a) - 1);
  }
  return nextA;
};

/**
 * fp.concat alias
 *
 * @param {any[]} array 병합대상 배열
 * @param {any|any[]} a 병합 인자
 * @returns {any[]} 병합된 배열
 */
const append = fp.concat;

/**
 * array 인자의 (index상)앞쪽에 value인자를 추가
 *
 * @param {any[]} array 병합대상 배열
 * @param {any|any[]} value 병합 인자
 * @returns {any[]} 병합된 배열
 */
const prepend = fp.curry((array, value) =>
  fp.isArray(value) ? fp.concat(value, array) : fp.concat([value], array)
);

/**
 * key(index)를 포함한 fp.map
 * @param {(v, k) => any} f value, key(또는 index)를 인자로 갖는 callback
 * @param {object|any[]} a 대상 collection
 * @returns {any[]} 결과 배열
 */
const mapWithKey = fp.curry((f, a) => fp.map.convert({ cap: false })(f, a));

/**
 * key(index)를 포함한 fp.forEach
 * @param {(v, k) => any} f value, key(또는 index)를 인자로 갖는 callback
 * @param {object|any[]} a 대상 collection
 * @returns {void} 반환값 없음
 */
const forEachWithKey = fp.curry((f, a) => fp.forEach.convert({ cap: false })(f, a));

/**
 * key(index)를 포함한 reduce
 *
 * @param {(acc, v, k) => any} f accumulator, value, key(또는 index)를 인자로 갖는 callback
 * @param {any} acc 누적기
 * @param {object|any[]} 대상 collection
 * @returns {any} 누적기
 */
const reduceWithKey = fp.curry((f, acc, a) => fp.reduce.convert({ cap: false })(f, acc, a));

/**
 * 원시 타입(primitive) 인지 여부 조회
 * null, undefined, Boolean, Number, String
 *
 * @param {any} a 조회 대상
 * @returns {boolean} 원시 타입(primitive) 인지 여부
 */
const isVal = (a) => fp.isNil(a) || fp.isBoolean(a) || fp.isNumber(a) || fp.isString(a);

/**
 * 참조 타입(reference) 인지 여부 조회
 * Array, Object, Function
 *
 * @param {any} a 조회 대상
 * @returns {boolean} 참조 타입(reference) 인지 여부
 */
const isRef = fp.pipe(isVal, not);

/**
 * falsy 타입(0, -0, NaN, false, '')인지 여부 조회
 * @param {any} a 조회 대상
 * @returns {boolean} falsy 타입(0, -0, NaN, false, '')인지 여부
 */
const isFalsy = (a) => {
  return fp.isNil(a) || fp.some(fp.equals(a), [0, -0, NaN, false, '']);
};

/**
 * truthy 타입 인지 여부 조회
 * (falsy타입(0, -0, NaN, false, '')이 아니면 truthy 타입)
 * @param {any} a 조회 대상
 * @returns {boolean} truthy 타입 인지 여부
 */
const isTruthy = (a) => !isFalsy(a);

/**
 * fp.getOr override
 *
 * fp.getOr의 반환값이 null인 경우, 기본값 반환되게 수정한 버전
 * circular dependency 때문에 closure로 작성
 */
const getOr = (({ curry, getOr }) => {
  const _getOr = curry((defaultValue, path, target) => {
    const val = fp.get(path, target);
    return fp.isNil(val) ? defaultValue : val;
  });
  return _getOr;
})(fp);

export default {
  mapAsync,
  filterAsync,
  reduceAsync,
  findAsync,
  forEachAsync,
  promisify,
  then,
  andThen: then,
  otherwise,
  catch: otherwise,
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

  ternary,
  ifT,
  ifF,

  // array
  removeByIndex,
  removeByIdx: removeByIndex,
  removeLast,
  append,
  prepend,

  mapWithKey,
  mapWithIdx: mapWithKey,
  forEachWithKey,
  forEachWithIdx: forEachWithKey,
  reduceWithKey,
  reduceWithIdx: reduceWithKey,
  isFalsy,
  isTruthy,

  getOr
};
