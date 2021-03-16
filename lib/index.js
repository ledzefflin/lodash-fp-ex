import _ from 'lodash/fp';

/**
 * 대상 인자가 promise(thenable)인지 여부
 * @param {*} x
 */
const isPromise = (x) => _.isFunction(_.get('then', x)) && _.isFunction(_.get('catch', x));

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
 * 대상 인자를 promise로 wrapping
 */
const promisify = (a, ...args) => {
  const cond = _.cond([
    [_.isFunction, () => fnPromisify(a, ...args)],
    [isPromise, _.identity],
    [_.T, (a) => Promise.resolve(a)]
  ]);
  const result = cond(a);

  return result;
};

/**
 * promise가 또다른 promise를 resolve하는 경우, promise의 중첩을 제거하기 위한 helper 함수
 *
 * @param {*} thenable
 */
const flatPromise = (thenable) =>
  isPromise(thenable) ? thenable.then((x) => flatPromise(x)) : thenable;

/**
 * lodash 형태의 promise then
 */
const then = _.curry((fn, thenable) => promisify(thenable).then(flatPromise(fn)));

/**
 * lodash 형태의 promise catch
 */
const otherwise = _.curry((fn, thenable) => promisify(thenable).catch(flatPromise(fn)));

/**
 * lodash 형태의 promise finally
 */
const _finally = _.curry((fn, thenable) => promisify(thenable).finally(flatPromise(fn)));

/**
 * invert boolean
 * @param {*} x
 */
const not = (x) => !x;

/**
 * 대상이 비어있지 않은지 여부
 */
const isNotEmpty = _.pipe(_.isEmpty, not);

/**
 * 대상 인자를 boolean 타입으로 변환
 * (예외)'true'문자열이면 true, 'false'문자열이면 false)
 *
 * @param {*} a
 */
const toBool = (a) =>
  _.cond([
    [_.equals('true'), _.T],
    [_.equals('false'), _.F],
    [_.T, (a) => !!a]
  ])(a);

/**
 * 삼항식 helper 함수
 * (isTrue가 true면 t(실행)반환, false면 f(실행)반환)
 */
const ternary = _.curry((t, f, isTrue) => {
  if (isTrue) {
    return _.isFunction(t) ? t() : t;
  } else {
    return _.isFunction(f) ? f() : f;
  }
});

/**
 * a인자가 t타입인지 여부
 */
const instanceOf = _.curry((t, a) => a instanceof t);

/**
 * 대상 문자열을 pascalcase 문자열로 변환
 */
const pascalCase = _.pipe(_.camelCase, _.upperFirst);

/**
 * (collection) _.map의 비동기 함수
 * mapper 함수로 비동기 함수를 받아서 처리해준다.
 */
const mapAsync = _.curry(async (asyncMapper, arr) => {
  const composer = _.pipe(_.flatMapDeep(_.pipe(asyncMapper, promisify)), async (a) =>
    Promise.all(a)
  );
  const result = composer(arr);

  return result;
});

/**
 * (collection) _.filter의 비동기 함수
 * 필터함수로 비동기 함수를 받아서 처리해준다.
 */
const filterAsync = _.curry(async (asyncFilter, arr) => {
  const composer = _.pipe(
    mapAsync(async (item) => ((await asyncFilter(item)) ? item : false)),
    then(_.filter(_.pipe(_.equals(false), not)))
  );
  const result = await composer(arr);

  return result;
});
/**
 * (collection) _.find의 비동기 함수
 */
const findAsync = _.curry(async (asyncFn, arr) => {
  const composer = _.pipe(
    mapAsync(asyncFn),
    then(_.indexOf(true)),
    then((idx) => _.get(`[${idx}]`, arr)),
    otherwise(_.always(undefined))
  );
  const result = await composer(arr);

  return result;
});

/**
 * asyncFn의 시작은 await accPromise가 되어야 한다.
 * 순차적으로 실행된다.
 * (ex 300ms이 걸리는 5개의 promise가 있다면, 최소 1500ms+alpah의 시간이 소요된다.
 * 상기의 mapAsync의 경우 300+alpah의 시간만 소요된다.(Promise.all과 Promise.resolve의 차이))
 */
const reduceAsync = _.curry((asyncFn, initAcc, dest) => {
  const initAccPromise = Promise.resolve(initAcc);
  const result = _.reduce(asyncFn, initAccPromise, dest);
  return result;
});

/**
 * value로 object key 조회
 */
const key = _.curry((a, v) => {
  const composer = _.pipe(_.invert, _.get(v));
  const result = composer(a);
  return result;
});

/**
 * 대상 문자열이 json형식 문자열인지 여부
 * @param {String} a
 */
const isJson = (a) => {
  const composer = _.pipe(_.attempt, _.isError);
  return _.isString(a) && !composer(() => JSON.parse(a));
};

/**
 * shallow freeze 보완
 * (대상 object의 refence 타입의 properties까지 object.freeze 처리)
 * @param {*} obj
 */
const deepFreeze = (obj) => {
  const freezeRecursively = (v) => (isRef(v) && !Object.isFrozen(v) ? deepFreeze(v) : v);
  const composer = _.pipe(Object.freeze, _.forOwn(freezeRecursively));
  const result = composer(obj);

  return result;
};

const transformObjectKey = _.curry((transformFn, dest) => {
  const convertRecursively = (dest) => {
    const convertTo = (o) => {
      const composer = _.pipe(
        _.entries,
        _.reduce((acc, [k, v]) => {
          const cond = _.cond([
            [_.isPlainObject, convertTo],
            [_.isArray, (v) => _.map(cond, v)],
            [_.T, _.identity]
          ]);
          const transformedKey = transformFn(k);
          if (!_.has(transformedKey, acc)) {
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

  const result = _.isObject(dest) || _.isArray(dest) ? convertRecursively(dest) : dest;

  return result;
});

/**
 * 대상 object의 property key문자열을 camelcase 문자열로 변환
 */
const toCamelcase = transformObjectKey(_.camelCase);

/**
 * 대상 object의 property key문자열을 snakecase 문자열로 변환
 */
const toSnakecase = transformObjectKey(_.snakeCase);

/**
 * date형식 문자열 여부
 * @param {string} str date형식 문자열
 */
const isDatetimeString = (str) => isNaN(str) && !isNaN(Date.parse(str));
/**
 * applicative functor pattern 구현체
 * (주로 _.pipe함수에서 함수의 인자 순서를 변경하기 위해 사용)
 */
const ap = _.curry((a, curried) => curried(a));

/**
 * 대상 인자가 undefined 또는 null이 아닌지 여부
 */
const isNotNil = _.pipe(_.isNil, not);

/**
 * a인자를 인자로, evaluator함수 실행,
 * true면 trueHandler에 a인자 대입
 * false면 a 반환
 */
const ifT = _.curry((evaluator, trueHandler, a) => {
  const isValidParams = _.every(_.isFunction, [evaluator, trueHandler]);

  if (isValidParams) {
    return _.pipe(evaluator, toBool)(a) ? trueHandler(a) : a;
  } else {
    throw new Error('invalid parameter');
  }
});

/**
 * a인자를 인자로, evaluator함수 실행,
 * false면 falseHandler에 a인자 대입
 * true면 a 반환
 */
const ifF = _.curry((evaluator, falseHandler, a) => {
  const isValidParams = _.every(_.isFunction, [evaluator, falseHandler]);

  if (isValidParams) {
    return _.pipe(evaluator, toBool)(a) ? a : falseHandler(a);
  } else {
    throw new Error('invalid parameter(s)');
  }
});

/**
 * arr인자 배열에 a인자가 포함되지 않았는지 여부
 */
const notIncludes = _.curry((a, arr) => {
  const composer = _.pipe(_.includes, ap(arr), not);
  const result = composer(a);

  return result;
});

/**
 * a인자와 b인자가 다른지 여부 (deep equal)
 */
const notEquals = _.curry((a, b) => _.pipe(_.equals(a), not)(b));

/**
 * arr인자의 idx인자의 index에 해당하는 요소 제거
 */
const removeByIndex = _.curry((idx, arr) => {
  if (_.isArray(arr)) {
    const cloned = _.cloneDeep(arr);
    cloned.splice(_.toNumber(idx), 1);

    return cloned;
  }
  return arr;
});

/**
 * arr 인자의 마지막 요소 제거 (immutable)
 *
 * @param {*} arr
 */
const removeLast = (arr) => {
  const nextArr = _.cloneDeep(arr);
  nextArr.pop();

  return nextArr;
};

/**
 * _.concat alias
 */
const append = _.concat;

/**
 * array 인자의 (index상)앞쪽에 value인자를 추가
 */
const prepend = _.curry((array, value) =>
  _.isArray(value) ? _.concat(value, array) : _.concat([value], array)
);

/**
 * key(index)를 포함한 _.map
 */
const mapWithKey = _.curry((f, a) => _.map.convert({ cap: false })(f, a));

/**
 * key(index)를 포함한 reduce
 */
const reduceWithKey = _.curry((f, acc, a) => _.reduce.convert({ cap: false })(f, acc, a));

/**
 * null, undefined, Boolean, Number, String
 *
 */
const isVal = (a) => _.isNil(a) || _.isBoolean(a) || _.isNumber(a) || _.isString(a);

/**
 * Array, Object, Function
 */
const isRef = _.pipe(isVal, not);

module.exports = {
  mapAsync,
  filterAsync,
  reduceAsync,
  findAsync,
  promisify,
  then,
  andThen: then,
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
  reduceWithKey,
  reduceWithIdx: reduceWithKey
};
