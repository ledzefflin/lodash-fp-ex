import fp from 'lodash/fp';

/**
 * 대상 인자가 promise(thenable)인지 여부
 * @param {*} x
 */
const isPromise = (x) => fp.isFunction(fp.get('then', x)) && fp.isFunction(fp.get('catch', x));

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
 * @param {*} thenable
 */
const flatPromise = (thenable) =>
  isPromise(thenable) ? thenable.then((x) => flatPromise(x)) : thenable;

/**
 * lodash 형태의 promise then
 */
const then = fp.curry((fn, thenable) => promisify(thenable).then(flatPromise(fn)));

/**
 * lodash 형태의 promise catch
 */
const otherwise = fp.curry((fn, thenable) => promisify(thenable).catch(flatPromise(fn)));

/**
 * lodash 형태의 promise finally
 */
const _finally = fp.curry((fn, thenable) => promisify(thenable).finally(flatPromise(fn)));

/**
 * invert boolean
 * @param {*} x
 */
const not = (x) => !x;

/**
 * 대상이 비어있지 않은지 여부
 */
const isNotEmpty = fp.pipe(fp.isEmpty, not);

/**
 * 대상 인자를 boolean 타입으로 변환\
 * (예외)'true'문자열이면 true, 'false'문자열이면 false
 *
 * @param {*} a
 */
const toBool = (a) => !!a;

/**
 * 삼항식 helper 함수\
 * (isTrue가 true면 t(실행)반환, false면 f(실행)반환)
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
 * a인자가 t타입인지 여부
 */
const instanceOf = fp.curry((t, a) => a instanceof t);

/**
 * 대상 문자열을 pascalcase 문자열로 변환
 */
const pascalCase = fp.pipe(fp.camelCase, fp.upperFirst);

/**
 * (collection) fp.map의 비동기 함수\
 * mapper 함수로 비동기 함수를 받아서 처리해준다.
 */
const mapAsync = fp.curry(async (asyncMapper, arr) => {
  const composer = fp.pipe(
    fp.flatMapDeep(fp.pipe(asyncMapper, promisify)),
    async (a) => await Promise.all(a)
  );
  const result = await composer(arr);

  return result;
});

/**
 * (collection) fp.filter의 비동기 함수\
 * 필터함수로 비동기 함수를 받아서 처리해준다.
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
 * 대상 문자열이 json형식 문자열인지 여부
 * @param {String} a
 */
const isJson = (a) => {
  const composer = fp.pipe(fp.attempt, fp.isError);
  return fp.isString(a) && !composer(() => JSON.parse(a));
};

/**
 * shallow freeze 보완
 * (대상 object의 refence 타입의 properties까지 object.freeze 처리)
 * @param {*} obj
 */
const deepFreeze = (obj) => {
  const freezeRecursively = (v) => (isRef(v) && !Object.isFrozen(v) ? deepFreeze(v) : v);
  const composer = fp.pipe(Object.freeze, fp.forOwn(freezeRecursively));
  const result = composer(obj);

  return result;
};

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
 */
const toCamelcase = transformObjectKey(fp.camelCase);

/**
 * 대상 object의 property key문자열을 snakecase 문자열로 변환
 */
const toSnakecase = transformObjectKey(fp.snakeCase);
const toPascalcase = transformObjectKey(pascalCase);

/**
 * date형식 문자열 여부
 * @param {string} str date형식 문자열
 */
const isDatetimeString = (str) => isNaN(str) && !isNaN(Date.parse(str));
/**
 * applicative functor pattern 구현체
 * (주로 fp.pipe함수에서 함수의 인자 순서를 변경하기 위해 사용)
 */
const ap = fp.curry((a, curried) => curried(a));

/**
 * 대상 인자가 undefined 또는 null이 아닌지 여부
 */
const isNotNil = fp.pipe(fp.isNil, not);

/**
 * a인자를 인자로, evaluator함수 실행,
 * true면 trueHandler에 a인자 대입
 * false면 a 반환
 */
const ifT = fp.curry((evaluator, trueHandler, a) => {
  const isValidParams = fp.every(fp.isFunction, [evaluator, trueHandler]);

  if (isValidParams) {
    return fp.pipe(evaluator, fp.equals(true))(a) ? trueHandler(a) : a;
  } else {
    throw new Error('invalid parameter');
  }
});

/**
 * a인자를 인자로, evaluator함수 실행,
 * false면 falseHandler에 a인자 대입
 * true면 a 반환
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
 * arr인자 배열에 a인자가 포함되지 않았는지 여부
 */
const notIncludes = fp.curry((a, arr) => {
  const composer = fp.pipe(fp.includes, ap(arr), not);
  const result = composer(a);

  return result;
});

/**
 * a인자와 b인자가 다른지 여부 (deep equal)
 */
const notEquals = fp.curry((a, b) => fp.pipe(fp.equals(a), not)(b));

/**
 * arr인자의 idx인자의 index에 해당하는 요소 제거
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
 * arr 인자의 마지막 요소 제거 (immutable)
 *
 * @param {*} arr
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
 */
const append = fp.concat;

/**
 * array 인자의 (index상)앞쪽에 value인자를 추가
 */
const prepend = fp.curry((array, value) =>
  fp.isArray(value) ? fp.concat(value, array) : fp.concat([value], array)
);

/**
 * key(index)를 포함한 fp.map
 */
const mapWithKey = fp.curry((f, a) => fp.map.convert({ cap: false })(f, a));

/**
 * key(index)를 포함한 fp.forEach
 */
const forEachWithKey = fp.curry((f, a) => fp.forEach.convert({ cap: false })(f, a));

/**
 * key(index)를 포함한 reduce
 */
const reduceWithKey = fp.curry((f, acc, a) => fp.reduce.convert({ cap: false })(f, acc, a));

/**
 * null, undefined, Boolean, Number, String
 *
 */
const isVal = (a) => fp.isNil(a) || fp.isBoolean(a) || fp.isNumber(a) || fp.isString(a);

/**
 * Array, Object, Function
 */
const isRef = fp.pipe(isVal, not);

const isFalsy = (a) => {
  return fp.isNil(a) || fp.some(fp.equals(a), [0, -0, NaN, false, '']);
};

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
