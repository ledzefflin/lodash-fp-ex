"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fp = _interopRequireDefault(require("lodash/fp"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const lodash = (() => {
  /**
   * 대상 인자가 promise(thenable)인지 여부
   * @param {*} x
   */
  const isPromise = x => _fp.default.isFunction(_fp.default.get('then', x)) && _fp.default.isFunction(_fp.default.get('catch', x));

  const fnPromisify = (fn, ...args) => new Promise((resolve, reject) => fn(...args, (error, value) => _fp.default.isNil(error) ? resolve(value) : reject(error)));
  /**
   * 대상 인자를 promise로 wrapping
   */


  const promisify = _fp.default.cond([[_fp.default.isFunction, (fn, ...args) => fnPromisify(fn, ...args)], [isPromise, _fp.default.identity], [_fp.default.T, x => Promise.resolve(x)]]);
  /**
   * promise가 또다른 promise를 resolve하는 경우, promise의 중첩을 제거하기 위한 helper 함수
   *
   * @param {*} thenable
   */


  const flatPromise = thenable => isPromise(thenable) ? thenable.then(x => flatPromise(x)) : thenable;
  /**
   * lodash 형태의 promise then
   */


  const then = _fp.default.curry((fn, thenable) => promisify(thenable).then(flatPromise(fn)));
  /**
   * lodash 형태의 promise catch
   */


  const otherwise = _fp.default.curry((fn, thenable) => promisify(thenable).catch(flatPromise(fn)));
  /**
   * lodash 형태의 promise finally
   */


  const _finally = _fp.default.curry((fn, thenable) => promisify(thenable).finally(flatPromise(fn)));
  /**
   * invert boolean
   * @param {*} x
   */


  const not = x => !x;
  /**
   * 대상이 비어있지 않은지 여부
   */


  const isNotEmpty = _fp.default.pipe(_fp.default.isEmpty, not);
  /**
   * 대상 인자를 boolean 타입으로 변환
   * (예외)'true'문자열이면 true, 'false'문자열이면 false)
   *
   * @param {*} a
   */


  const toBool = a => _fp.default.cond([[_fp.default.equals('true'), _fp.default.T], [_fp.default.equals('false'), _fp.default.F], [_fp.default.T, a => !!a]])(a);
  /**
   * 삼항식 helper 함수
   * (isTrue가 true면 t(실행)반환, false면 f(실행)반환)
   */


  const ternary = _fp.default.curry((t, f, isTrue) => {
    if (isTrue) {
      return _fp.default.isFunction(t) ? t() : t;
    } else {
      return _fp.default.isFunction(f) ? f() : f;
    }
  });
  /**
   * a인자가 t타입인지 여부
   */


  const instanceOf = _fp.default.curry((t, a) => a instanceof t);
  /**
   * 대상 문자열을 pascalcase 문자열로 변환
   */


  const pascalCase = _fp.default.pipe(_fp.default.camelCase, _fp.default.upperFirst);
  /**
   * (collection) _.map의 비동기 함수
   */


  const mapAsync = _fp.default.curry( /*#__PURE__*/function () {
    var _ref = _asyncToGenerator(function* (asyncFn, arr) {
      return yield Promise.all(_fp.default.flatMapDeep(asyncFn, arr));
    });

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
  /**
   * (collection) _.filter의 비동기 함수
   */


  const filterAsync = _fp.default.curry( /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(function* (asyncFn, arr) {
      return yield Promise.all(_fp.default.filter(asyncFn, arr));
    });

    return function (_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }());
  /**
   * (collection) _.find의 비동기 함수
   */


  const findAsync = _fp.default.curry( /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator(function* (asyncFn, arr) {
      const composer = _fp.default.pipe(mapAsync(asyncFn), then(_fp.default.indexOf(true)), then(idx => _fp.default.get(`[${idx}]`, arr)), otherwise(_fp.default.always(undefined)));

      const result = yield composer(arr);
      return result;
    });

    return function (_x5, _x6) {
      return _ref3.apply(this, arguments);
    };
  }());
  /**
   * asyncFn의 시작은 await accPromise가 되어야 한다.
   */


  const reduceAsync = _fp.default.curry((asyncFn, initAcc, dest) => {
    const initAccPromise = Promise.resolve(initAcc);

    const result = _fp.default.reduce(asyncFn, initAccPromise, dest);

    return result;
  });
  /**
   * value로 object key 조회
   */


  const key = _fp.default.curry((v, a) => {
    const composer = _fp.default.pipe(_fp.default.invert, _fp.default.get(v));

    const result = composer(a);
    return result;
  });
  /**
   * 대상 문자열이 json형식 문자열인지 여부
   * @param {String} a
   */


  const isJson = a => {
    const composer = _fp.default.pipe(_fp.default.attempt, _fp.default.isError);

    return _fp.default.isString(a) && !composer(() => JSON.parse(a));
  };
  /**
   * shallow freeze 보완
   * (대상 object의 refence 타입의 properties까지 object.freeze 처리)
   * @param {*} obj
   */


  const deepFreeze = obj => {
    const freezeRecursively = v => (_fp.default.isPlainObject(v) || _fp.default.isFunction(v)) && !Object.isFrozen(v) ? deepFreeze(v) : v;

    const composer = _fp.default.pipe(Object.freeze, _fp.default.forOwn(freezeRecursively));

    const result = composer(obj);
    return result;
  };

  const objectKeyTarnsform = _fp.default.curry((transformFn, dest) => {
    const convertRecursively = dest => {
      const convertTo = o => {
        const composer = _fp.default.pipe(_fp.default.entries, _fp.default.reduce((acc, [k, v]) => {
          const cond = _fp.default.cond([[_fp.default.isPlainObject, convertTo], [_fp.default.isArray, v => _fp.default.map(cond, v)], [_fp.default.T, _fp.default.identity]]);

          acc[transformFn(k)] = cond(v);
          return acc;
        }, {}));

        const result = composer(o);
        return result;
      };

      const result = convertTo(dest);
      return result;
    };

    const result = _fp.default.isObject(dest) || _fp.default.isArray(dest) ? convertRecursively(dest) : dest;
    return result;
  });
  /**
   * 대상 object의 property key문자열을 camelcase 문자열로 변환
   */


  const toCamelcase = objectKeyTarnsform(_fp.default.camelCase);
  /**
   * 대상 object의 property key문자열을 snakecase 문자열로 변환
   */

  const toSnakecase = objectKeyTarnsform(_fp.default.snakeCase);
  /**
   * date형식 문자열 여부
   * @param {string} str date형식 문자열
   */

  const isDateString = str => isNaN(str) && !isNaN(Date.parse(str));
  /**
   * applicative functor pattern 구현체
   * (주로 _.pipe함수에서 함수의 인자 순서를 변경하기 위해 사용)
   */


  const ap = _fp.default.curry((a, curried) => curried(a));
  /**
   * 대상 인자가 undefined 또는 null이 아닌지 여부
   */


  const isNotNil = _fp.default.pipe(_fp.default.isNil, not);
  /**
   * a인자를 인자로, evaluator함수 실행,
   * true면 trueHandler에 a인자 대입
   * false면 a 반환
   */


  const ifT = _fp.default.curry((evaluater, trueHandler, a) => {
    const isValidParams = _fp.default.every(_fp.default.isFunction, [evaluater, trueHandler]);

    if (isValidParams) {
      return _fp.default.pipe(evaluater, toBool)(a) ? trueHandler(a) : a;
    } else {
      throw new Error('invalid parameter(s)');
    }
  });
  /**
   * a인자를 인자로, evaluator함수 실행,
   * false면 falseHandler에 a인자 대입
   * true면 a 반환
   */


  const ifF = _fp.default.curry((evaluater, falseHandler, a) => {
    const isValidParams = _fp.default.every(_fp.default.isFunction, [evaluater, falseHandler]);

    if (isValidParams) {
      return _fp.default.pipe(evaluater, toBool)(a) ? a : falseHandler(a);
    } else {
      throw new Error('invalid parameter(s)');
    }
  });
  /**
   * arr인자 배열에 a인자가 포함되지 않았는지 여부
   */


  const notIncludes = _fp.default.curry((a, arr) => {
    const composer = _fp.default.pipe(_fp.default.includes, ap(arr), not);

    const result = composer(a);
    return result;
  });
  /**
   * a인자와 b인자가 다른지 여부 (deep equal)
   */


  const notEquals = _fp.default.curry((a, b) => _fp.default.pipe(_fp.default.equals(a), _fp.default.not)(b));
  /**
   * arr인자의 idx인자의 index에 해당하는 요소 제거
   */


  const removeByIndex = _fp.default.curry((idx, arr) => {
    if (_fp.default.isArray(arr)) {
      arr.splice(idx, 1);
      return _fp.default.cloneDeep(arr);
    }

    return arr;
  });
  /**
   * arr 인자의 마지막 요소 제거 (immutable)
   *
   * @param {*} arr
   */


  const removeLast = arr => {
    const nextArr = _fp.default.cloneDeep(arr);

    nextArr.pop();
    return nextArr;
  };
  /**
   * _.concat alias
   */


  const append = _fp.default.concat;
  /**
   * array 인자의 (index상)앞쪽에 value인자를 추가
   */

  const prepend = _fp.default.curry((array, value) => _fp.default.isArray(value) ? _fp.default.concat(value, array) : _fp.default.concat([value], array));
  /**
   * key(index)를 포함한 _.map
   * (가급적 _.entries 사용 권장)
   */


  const mapWithKey = _fp.default.map.convert({
    cap: false
  });
  /**
   * key(index)를 포함한 reduce
   * (가급적 _.entries 사용 권장)
   */


  const reduceWithKey = _fp.default.reduce.convert({
    cap: false
  });

  return _fp.default.mixin({
    mapAsync,
    filterAsync,
    reduceAsync,
    findAsync,
    promisify,
    then,
    otherwise,
    finally: _finally,
    isPromise,
    isNotEmpty,
    isNotNil,
    isJson,
    notEquals,
    not,
    notIncludes,
    toBool,
    deepFreeze,
    key,
    // string
    pascalCase,
    toCamelcase,
    toSnakecase,
    isDateString,
    ap,
    instanceOf,
    ternary,
    ifT,
    ifF,
    // array
    removeByIndex,
    removeLast,
    append,
    prepend,
    mapWithKey,
    reduceWithKey
  });
})();

var _default = lodash;
exports.default = _default;