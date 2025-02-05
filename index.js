"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _getOr3 = _interopRequireDefault(require("lodash/fp/getOr"));
var _some2 = _interopRequireDefault(require("lodash/fp/some"));
var _forEach2 = _interopRequireDefault(require("lodash/fp/forEach"));
var _cloneDeep2 = _interopRequireDefault(require("lodash/fp/cloneDeep"));
var _lte2 = _interopRequireDefault(require("lodash/fp/lte"));
var _snakeCase2 = _interopRequireDefault(require("lodash/fp/snakeCase"));
var _size2 = _interopRequireDefault(require("lodash/fp/size"));
var _includes2 = _interopRequireDefault(require("lodash/fp/includes"));
var _isObject2 = _interopRequireDefault(require("lodash/fp/isObject"));
var _set2 = _interopRequireDefault(require("lodash/fp/set"));
var _has2 = _interopRequireDefault(require("lodash/fp/has"));
var _forOwn2 = _interopRequireDefault(require("lodash/fp/forOwn"));
var _find2 = _interopRequireDefault(require("lodash/fp/find"));
var _reduce2 = _interopRequireDefault(require("lodash/fp/reduce"));
var _always2 = _interopRequireDefault(require("lodash/fp/always"));
var _head2 = _interopRequireDefault(require("lodash/fp/head"));
var _filter2 = _interopRequireDefault(require("lodash/fp/filter"));
var _map2 = _interopRequireDefault(require("lodash/fp/map"));
var _toNumber2 = _interopRequireDefault(require("lodash/fp/toNumber"));
var _entries2 = _interopRequireDefault(require("lodash/fp/entries"));
var _flatMapDeep2 = _interopRequireDefault(require("lodash/fp/flatMapDeep"));
var _camelCase2 = _interopRequireDefault(require("lodash/fp/camelCase"));
var _upperFirst2 = _interopRequireDefault(require("lodash/fp/upperFirst"));
var _equals2 = _interopRequireDefault(require("lodash/fp/equals"));
var _isEmpty2 = _interopRequireDefault(require("lodash/fp/isEmpty"));
var _curry2 = _interopRequireDefault(require("lodash/fp/curry"));
var _identity2 = _interopRequireDefault(require("lodash/fp/identity"));
var _isArray2 = _interopRequireDefault(require("lodash/fp/isArray"));
var _isPlainObject2 = _interopRequireDefault(require("lodash/fp/isPlainObject"));
var _T2 = _interopRequireDefault(require("lodash/fp/T"));
var _cond2 = _interopRequireDefault(require("lodash/fp/cond"));
var _isFunction2 = _interopRequireDefault(require("lodash/fp/isFunction"));
var _get2 = _interopRequireDefault(require("lodash/fp/get"));
var _pipe2 = _interopRequireDefault(require("lodash/fp/pipe"));
var _isError2 = _interopRequireDefault(require("lodash/fp/isError"));
var _isNumber2 = _interopRequireDefault(require("lodash/fp/isNumber"));
var _attempt2 = _interopRequireDefault(require("lodash/fp/attempt"));
var _isBoolean2 = _interopRequireDefault(require("lodash/fp/isBoolean"));
var _isString2 = _interopRequireDefault(require("lodash/fp/isString"));
var _isNil2 = _interopRequireDefault(require("lodash/fp/isNil"));
var _concat2 = _interopRequireDefault(require("lodash/fp/concat"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * 대상 문자열이 json형식 문자열인지 여부 조회
 *
 * @param {string} jsonStr 조회 대상 문자열
 * @returns {boolean} json 문자열인지 여부
 */
const isJson = jsonStr => {
  const composer = (0, _pipe2.default)(_attempt2.default, _isError2.default);
  const result = (0, _isString2.default)(jsonStr) && !composer(() => JSON.parse(jsonStr));
  return result;
};

/**
 * 원시 타입(primitive) 인지 여부 조회
 * null, undefined, Boolean, Number, String
 *
 * @param {any} arg 조회 대상
 * @returns {boolean} 원시 타입(primitive) 인지 여부
 */
const isVal = arg => {
  const result = (0, _isNil2.default)(arg) || (0, _isBoolean2.default)(arg) || (0, _isNumber2.default)(arg) || (0, _isString2.default)(arg);
  return result;
};

/**
 * 참조 타입(reference) 인지 여부 조회
 * Array, Object, Function
 *
 * @param {any} arg 조회 대상
 * @returns {boolean} 참조 타입(reference) 인지 여부
 */
const isRef = arg => {
  const composer = (0, _pipe2.default)(isVal, not);
  const result = composer(arg);
  return result;
};

/**
 * 대상 인자가 promise(thenable)인지 여부 조회
 *
 * @param {any} x 조회 대상
 * @return {boolean} 대상 인자가 promise(thenable)인지 여부
 */
const isPromise = x => (0, _isFunction2.default)((0, _get2.default)('then', x)) && (0, _isFunction2.default)((0, _get2.default)('catch', x));

/**
 * 대상 함수를 promise로 lift
 *
 * @param {(...args: any[]) => any} fn 대상 합수
 * @param  {any[]} args 함수 인자 목록
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
 * @param {any[]} args 대상 인자 a가 함수인 경우, 함수의 인자목록
 * @return {Promise<any>} Promise로 lift된 Promise 객채
 */
const promisify = (a, ...args) => {
  const conditional = (0, _cond2.default)([[_isFunction2.default, () => fnPromisify(a, ...args)], [isPromise, a => (0, _identity2.default)(a)], [_T2.default, a => Promise.resolve(a)]]);
  const result = conditional(a);
  return result;
};

/**
 * promise가 또다른 promise를 resolve하는 경우, promise의 중첩을 제거하기 위한 helper 함수
 *
 * @param {Promise<any> | any} thenable Promise 객체
 * @return {Promise<any> | any} 중첩 제거된 Promise 객체
 */
const flatPromise = thenable => isPromise(thenable) ? thenable.then(x => flatPromise(x)) : thenable;
/**
 * lodash 형태의 promise then
 *
 * @param {(response:any) => any} successHandler 응답값 처리 callback
 * @param {Promise<any>} thenable resolve 대상 Promise 객체
 * @returns {Promise<any>} fullfilled 상태의 Promise 객체
 */
const andThen = (0, _curry2.default)((successHandler, thenable) => promisify(thenable).then(flatPromise(successHandler)));
/**
 * lodash 형태의 promise catch
 *
 * @param {(error:Error|any) =>  any} failureHandler error 처리 callback
 * @param {Promise<Error|any>} thenable error를 resolve 하는 promise
 * @return {Promise<any>} error 상태의 Promise 객체
 */
const otherwise = (0, _curry2.default)((failureHandler, thenable) => promisify(thenable).then(null, flatPromise(failureHandler)));
/**
 * lodash 형태의 promise finally
 *
 * @param {(...args: any[]) => any} callback Promise 상태와 무관하게 실행되는 callback
 * @param {Promise<any>} thenable Promise 객체
 * @return {Promise<any>} Promise 객체
 */
const _finally = (0, _curry2.default)((callback, thenable) => promisify(thenable).finally(flatPromise(callback)));

/**
 * invert boolean
 * @param {any} x 대상
 * @return {boolean} not 연산된 값
 */
const not = x => !x;

/**
 * 대상이 비어있지 않은지 여부
 * (주의: 숫자타입은 항상 false를 반환)
 *
 * @param {any} a 대상
 * @returns {boolean} 비어 있는지 여부
 */
const isNotEmpty = a => {
  const composer = (0, _pipe2.default)(_isEmpty2.default, not);
  const result = composer(a);
  return result;
};

/**
 * 대상 인자를 boolean 타입으로 변환\
 *
 * @param {any} a 대상
 * @returns {boolean} 변환된 boolean 타입 값
 */
const toBool = arg => !!arg;
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
const ifT = (0, _curry2.default)((evaluator, trueHandler, arg) => {
  const isValidEvaluator = (0, _isFunction2.default)(evaluator) || (0, _isBoolean2.default)(evaluator);
  if (isValidEvaluator) {
    // evaluator가 함수인 경우
    if ((0, _isFunction2.default)(evaluator)) {
      if ((0, _pipe2.default)(evaluator, (0, _equals2.default)(true))(arg)) {
        return (0, _isFunction2.default)(trueHandler) ? trueHandler(arg) : trueHandler;
      } else {
        return arg;
      }
    } else {
      // evaluator가 boolean인 경우
      if (evaluator) {
        return (0, _isFunction2.default)(trueHandler) ? trueHandler(arg) : trueHandler;
      } else {
        return arg;
      }
    }
  } else {
    throw new Error('invalid parameter(s)');
  }
});
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
const ifF = (0, _curry2.default)((evaluator, falseHandler, arg) => {
  const isValidEvaluator = (0, _isFunction2.default)(evaluator) || (0, _isBoolean2.default)(evaluator);
  if (isValidEvaluator) {
    // evaluator가 함수인 경우
    if ((0, _isFunction2.default)(evaluator)) {
      if ((0, _pipe2.default)(evaluator, (0, _equals2.default)(false))(arg)) {
        return (0, _isFunction2.default)(falseHandler) ? falseHandler(arg) : falseHandler;
      } else {
        return arg;
      }
    } else {
      // evaluator가 boolean인 경우
      if (evaluator) {
        return (0, _isFunction2.default)(falseHandler) ? falseHandler(arg) : falseHandler;
      } else {
        return arg;
      }
    }
  } else {
    throw new Error('invalid parameter(s)');
  }
});
/**
 * a인자가 t타입인지 여부 조회
 * @param {any} t 조회 대상 type
 * @param {any} a 조회 대상
 * @returns {boolean} a인자가 t타입인지 여부
 */
const instanceOf = (0, _curry2.default)((t, a) => a instanceof t);

/**
 * 대상 문자열을 pascalcase 문자열로 변환
 * @param {string} str 대상 문자열
 * @returns {string} pascal case로 변환된 문자열
 */
const pascalCase = str => {
  const composer = (0, _pipe2.default)(_camelCase2.default, _upperFirst2.default);
  const result = composer(str);
  return result;
};
/**
 * (collection) map의 비동기 함수\
 * mapper 함수로 비동기 함수를 받아서 처리해준다.
 *
 * @param {(a) => Promise<any>} asyncMapper 비동기 mapper
 * @param {object|any[]} collection 대상 object 또는 array
 * @returns {Promise<any[]>} 결과 array를 resolve 하는 promise
 */
const mapAsync = (0, _curry2.default)(async (asyncMapper, collection) => {
  const composer = (0, _pipe2.default)(_flatMapDeep2.default.convert({
    cap: false
  })((0, _pipe2.default)(asyncMapper, promisify)), async a => await Promise.all(a));
  const result = await composer(collection);
  return result;
});
/**
 * 비동기 forEach
 * 실행함수로 비동기 함수를 받아서 처리해준다
 * 순차실행
 *
 * @param {(value: any, key: number | string) => Promise<any>} callbackAsync 비동기 iterator
 * @param {object|any[]} collection 대상 객체 또는 배열
 * @returns {Promise<any[]>} 결과 Promise
 */
const forEachAsync = (0, _curry2.default)(async (callbackAsync, collection) => {
  const loopResults = [];
  const entryList = (0, _entries2.default)(collection);
  for (const entry of entryList) {
    loopResults.push(await callbackAsync(entry[1], (0, _isArray2.default)(collection) ? (0, _toNumber2.default)(entry[0]) : entry[0]));
  }
  return loopResults;
});
/**
 * (collection) filter의 비동기 함수\
 * 필터함수로 비동기 함수를 받아서 처리해준다.
 *
 * @param {(a) => Promise<bool>} asyncFilter 비동기 필터
 * @param {object|any[]} collection 대상 object 또는 array
 * @returns {Promise<any[]>} 결과 array를 resolve하는 promise
 */
const filterAsync = (0, _curry2.default)(async (asyncFilter, collection) => {
  const composer = (0, _pipe2.default)(mapAsync(async (item, key) => (await asyncFilter(item, key)) ? item : false), andThen(response => (0, _filter2.default)((0, _pipe2.default)((0, _equals2.default)(false), not))(response)));
  const result = await composer(collection);
  return result;
});
/**
 * (collection) find의 비동기 함수
 * @param {(a) => Promise<bool>} asyncFilter 비동기 필터
 * @param {object|any[]} collection 대상 object 또는 array
 * @returns {Promise<any>} 필터된 단일 결과를 resolve하는 promise
 */
const findAsync = (0, _curry2.default)(async (asyncFilter, collection) => {
  const composer = (0, _pipe2.default)(filterAsync(asyncFilter), andThen(response => (0, _isEmpty2.default)(response) ? undefined : (0, _head2.default)(response)), otherwise((0, _always2.default)(undefined)));
  const result = await composer(collection);
  return result;
});
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
const reduceAsync = (0, _curry2.default)(async (asyncFn, initAcc, collection) => {
  const initAccPromise = await (0, _pipe2.default)(promisify, accP => Promise.resolve(accP))(initAcc);
  const result = _reduce2.default.convert({
    cap: false
  })(asyncFn, initAccPromise, collection);
  return result;
});
/**
 * value로 object key 조회
 *
 * @param {object} obj 대상 객체
 * @param {string} value 조회 대상 값
 * @returns {string} 속성명
 */
const key = (0, _curry2.default)((obj, value) => {
  const composer = (0, _pipe2.default)(_entries2.default, (0, _find2.default)(([k, val]) => (0, _equals2.default)(value, val)), _head2.default);
  const result = composer(obj);
  return result;
});

/**
 * shallow freeze 보완
 * (대상 object의 refence 타입의 properties까지 object.freeze 처리)
 * @param {object} obj 대상 객체
 * @returns {object} frozen 처리된 객체
 */
const deepFreeze = obj => {
  const freezeRecursively = v => isRef(v) && !Object.isFrozen(v) ? deepFreeze(v) : v;
  const composer = (0, _pipe2.default)(Object.freeze, (0, _forOwn2.default)(freezeRecursively));
  const result = composer(obj);
  return result;
};
/**
 * 대상 객체의 속성명을 transformFn의 결과값으로 변환
 *
 * @param {(orignStr) => string} transformFn 변환함수
 * @param {object} obj 대상 객체
 * @returns {object} 속성명이 변환된 객체
 */
const transformObjectKey = (0, _curry2.default)((transformFn, obj) => {
  const convertRecursively = obj => {
    const convertTo = o => {
      const composer = (0, _pipe2.default)(_reduce2.default.convert({
        cap: false
      })((acc, v, k) => {
        const conditional = arg => {
          if ((0, _isPlainObject2.default)(arg)) {
            return convertTo(arg);
          } else if ((0, _isArray2.default)(arg)) {
            return (0, _map2.default)(conditional, arg);
          } else {
            return (0, _identity2.default)(arg);
          }
        };
        const transformedKey = transformFn(k);
        if (!(0, _has2.default)(transformedKey, acc)) {
          const result = (0, _set2.default)(transformedKey, conditional(v), acc);
          return result;
        } else {
          throw new Error(`${transformedKey} already exist. duplicated property name is not supported.`);
        }
      }, {}));
      const result = composer(o);
      return result;
    };
    const result = convertTo(obj);
    return result;
  };
  const result = (0, _isObject2.default)(obj) || (0, _isArray2.default)(obj) ? convertRecursively(obj) : obj;
  return result;
});

/**
 * 대상 object의 property key문자열을 camelcase 문자열로 변환
 *
 * @param {object} obj 대상 객체
 * @returns {object} 속성명이 camel case로 변환된 객체
 */
const toCamelcase = transformObjectKey(_camelCase2.default);

/**
 * 대상 object의 property key문자열을 snakecase 문자열로 변환
 *
 * @param {object} obj 대상 객체
 * @returns {object} 속성명이 snake case로 변환된 객체
 */
const toSnakecase = transformObjectKey(_snakeCase2.default);

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
const isDatetimeString = dateStr => (0, _isString2.default)(dateStr) && !isNaN(Date.parse(dateStr));
/**
 * applicative functor pattern 구현체
 * (주로 pipe함수에서 함수의 인자 순서를 변경하기 위해 사용)
 *
 * @param {any} arg 대입 인자
 * @param {function} curried currying된 함수
 * @returns {any} 결과값
 */
const ap = (0, _curry2.default)((a, curried) => curried(a));

/**
 * 대상 인자가 undefined 또는 null이 아닌지 여부 조회
 *
 * @param {any} arg 대상인자
 * @returns {boolean} 대상 인자가 undefined 또는 null이 아닌지 여부
 */
const isNotNil = (0, _pipe2.default)(_isNil2.default, not);
/**
 * arr인자 배열에 a인자가 포함되지 않았는지 여부 조회
 * @param {any} a 대상 인자
 * @param {any[] | Record<string, any> | string} arr 대상 배열
 * @returns {boolean} arr 배열에 a인자가 포함되지 않았는지 여부
 */
const notIncludes = (0, _curry2.default)((arg, targetArray) => {
  const result = !(0, _includes2.default)(arg, targetArray);
  return result;
});
/**
 * a인자와 b인자가 다른지 여부 (deep equal) 조회
 * @param {any} a 비교 인자
 * @param {any} b 비교 인자
 * @returns {boolean} a인자와 b인자가 다른지 여부 (deep equal)
 */
const notEquals = (0, _curry2.default)((a, b) => {
  const composer = (0, _pipe2.default)((0, _equals2.default)(a), not);
  const result = composer(b);
  return result;
});
/**
 * arr인자의 idx인자의 index에 해당하는 요소 제거
 * @param {number|string} index numeric 타입 색인값
 * @param {any[]} targetArray 대상 배열
 * @returns {any[]} index에 해당하는 요소 제거된 배열
 */
const removeByIndex = (0, _curry2.default)((index, targetArray) => {
  if ((0, _isArray2.default)(targetArray) && (0, _pipe2.default)(_size2.default, (0, _curry2.default)((index, sz) => {
    const num = (0, _toNumber2.default)(index);
    const isAccesable = (0, _isNumber2.default)(num) && (0, _lte2.default)(num, sz);
    return isAccesable;
  })(index))(targetArray)) {
    const cloned = (0, _cloneDeep2.default)(targetArray);
    cloned.splice((0, _toNumber2.default)(index), 1);
    return cloned;
  }
  return targetArray;
});
/**
 * 인자의 마지막 요소 제거 (immutable)
 *
 * @param {string|any[]} target 문자열 또는 배열의 마지막 요소 제거
 * @returns 마지막 요소 제거된 인자
 */
function removeLast(target) {
  if ((0, _isArray2.default)(target) || (0, _isString2.default)(target)) {
    const result = (0, _cloneDeep2.default)(target);
    (0, _isArray2.default)(target) ? result.pop() : result.substring(0, (0, _size2.default)(target) - 1);
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
const append = _concat2.default;
/**
 * array 인자의 (index상)앞쪽에 value인자를 추가
 *
 * @param {any[]} targetArray 병합대상 배열
 * @param {any|any[]} value 병합 인자
 * @returns {any[]} 병합된 배열
 */
const prepend = (0, _curry2.default)((targetArray, value) => (0, _isArray2.default)(value) ? (0, _concat2.default)(value, targetArray) : (0, _concat2.default)([value], targetArray));
/**
 * key(index)를 포함한 map
 * @param {(v, k) => any} f value, key(또는 index)를 인자로 갖는 callback
 * @param {object|any[]} a 대상 collection
 * @returns {any[]} 결과 배열
 */
const mapWithKey = (0, _curry2.default)((iteratee, collection) => _map2.default.convert({
  cap: false
})(iteratee, collection));
/**
 * key(index)를 포함한 forEach
 * @param {(v, k) => any} f value, key(또는 index)를 인자로 갖는 callback
 * @param {object|any[]} a 대상 collection
 * @returns {void} 반환값 없음
 */
const forEachWithKey = (0, _curry2.default)((iteratee, collection) => _forEach2.default.convert({
  cap: false
})(iteratee, collection));
/**
 * key(index)를 포함한 reduce
 *
 * @param {(acc, v, k) => any} f accumulator, value, key(또는 index)를 인자로 갖는 callback
 * @param {any} acc 누적기
 * @param {object|any[]} 대상 collection
 * @returns {any} 누적기
 */
const reduceWithKey = (0, _curry2.default)((iteratee, acc, collection) => _reduce2.default.convert({
  cap: false
})(iteratee, acc, collection));

/**
 * falsy 타입(0, -0, NaN, false, '')인지 여부 조회
 * @param {any} arg 조회 대상
 * @returns {boolean} falsy 타입(0, -0, NaN, false, '')인지 여부
 */
const isFalsy = arg => {
  return (0, _isNil2.default)(arg) || (0, _some2.default)((0, _equals2.default)(arg), [0, -0, NaN, false, '']);
};

/**
 * truthy 타입 인지 여부 조회
 * (falsy타입(0, -0, NaN, false, '')이 아니면 truthy 타입)
 * @param {any} arg 조회 대상
 * @returns {boolean} truthy 타입 인지 여부
 */
const isTruthy = arg => !isFalsy(arg);

/**
 * getOr override
 *
 * getOr의 반환값이 null인 경우, 기본값 반환되게 수정한 버전
 * circular dependency 때문에 closure로 작성
 */
const getOr = (({
  curry,
  _getOr
}) => {
  const __getOr = curry((defaultValue, path, target) => {
    return (0, _isNil2.default)(target) || (0, _isNil2.default)((0, _get2.default)(path, target)) ? defaultValue : (0, _get2.default)(path, target);
  });
  return __getOr;
})({
  curry: _curry2.default,
  _getOr: _getOr3.default
});

/**
 * ms 시간동안 대기
 *
 * @param ms 대기시간
 * @returns Promise
 */
const delayAsync = async ms => {
  const exe = () => new Promise(resolve => setTimeout(() => resolve(), ms));
  const result = await exe();
  return result;
};
var _default = exports.default = {
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
  sleep: delayAsync
};
