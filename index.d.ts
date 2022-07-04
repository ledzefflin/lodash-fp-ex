declare namespace _default {
    export { mapAsync };
    export { filterAsync };
    export { reduceAsync };
    export { findAsync };
    export { forEachAsync };
    export { promisify };
    export { then };
    export { then as andThen };
    export { otherwise };
    export { otherwise as catch };
    export { _finally as finally };
    export { isPromise };
    export { isNotEmpty };
    export { isNotNil };
    export { isJson };
    export { notEquals };
    export { notEquals as isNotEqual };
    export { isVal };
    export { isVal as isPrimitive };
    export { isRef };
    export { isRef as isReference };
    export { not };
    export { notIncludes };
    export { toBool };
    export { deepFreeze };
    export { key };
    export { key as keyByVal };
    export { transformObjectKey };
    export { toCamelcase };
    export { toCamelcase as toCamelKey };
    export { toSnakecase };
    export { toSnakecase as toSnakeKey };
    export { toPascalcase };
    export { pascalCase };
    export { isDatetimeString };
    export { ap };
    export { instanceOf };
    export { ternary };
    export { ifT };
    export { ifF };
    export { removeByIndex };
    export { removeByIndex as removeByIdx };
    export { removeLast };
    export { append };
    export { prepend };
    export { mapWithKey };
    export { mapWithKey as mapWithIdx };
    export { forEachWithKey };
    export { forEachWithKey as forEachWithIdx };
    export { reduceWithKey };
    export { reduceWithKey as reduceWithIdx };
    export { isFalsy };
    export { isTruthy };
    export { getOr };
}
export default _default;
/**
 * (collection) fp.map의 비동기 함수\
 * mapper 함수로 비동기 함수를 받아서 처리해준다.
 *
 * @param {(a) => Promise<any>} asyncMapper 비동기 mapper
 * @param {object|any[]} collection 대상 object 또는 array
 * @returns {Promise<any[]>} 결과 array를 resolve 하는 promise
 */
declare const mapAsync: any;
/**
 * (collection) fp.filter의 비동기 함수\
 * 필터함수로 비동기 함수를 받아서 처리해준다.
 *
 * @param {(a) => Promise<bool>} asyncFilter 비동기 필터
 * @param {object|any[]} collection 대상 object 또는 array
 * @returns {Promise<any[]>} 결과 array를 resolve하는 promise
 */
declare const filterAsync: any;
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
declare const reduceAsync: any;
/**
 * (collection) fp.find의 비동기 함수
 * @param {(a) => Promise<bool>} asyncFn 비동기 필터
 * @param {object|any[]} collection 대상 object 또는 array
 * @returns {Promise<any>} 필터된 단일 결과를 resolve하는 promise
 */
declare const findAsync: any;
/**
 * 비동기 forEach
 * 실행함수로 비동기 함수를 받아서 처리해준다
 * 순차실행
 *
 * @param {(a) => Promise<any>} cb 비동기 iterator
 * @param {object|any[]} collection 대상 객체 또는 배열
 * @returns {Promise<any[]>} 결과 Promise
 */
declare const forEachAsync: any;
/**
 * 대상 인자를 promise로 wrapping (lift)
 *
 * @param {any} a 대상 인자
 * @param {...any} args 대상 인자 a가 함수인 경우, 함수의 인자목록
 * @return {Promise<any>} Promise로 lift된 Promise 객채
 */
declare function promisify(a: any, ...args: any[]): Promise<any>;
/**
 * lodash 형태의 promise then
 *
 * @param {(response) => any} fn 응답값 처리 callback
 * @param {Promise<any>} thenable resolve 대상 Promise 객체
 * @returns {Promise<any>} fullfilled 상태의 Promise 객체
 */
declare const then: any;
/**
 * lodash 형태의 promise catch
 *
 * @param {(error) => never} fn error 처리 callback
 * @param {Promise<error>} thenable error를 resolve 하는 promise
 * @return {Promise<never>} error 상태의 Promise 객체
 */
declare const otherwise: any;
/**
 * lodash 형태의 promise finally
 *
 * @param {() => any} fn Promise 상태와 무관하게 실행되는 callback
 * @param {Promise<any>} thenable Promise 객체
 * @return {void} 반환값 없음
 */
declare const _finally: any;
/**
 * 대상 인자가 promise(thenable)인지 여부 조회
 *
 * @param {any} x 조회 대상
 * @return {boolean} 대상 인자가 promise(thenable)인지 여부
 */
declare function isPromise(x: any): boolean;
/**
 * 대상이 비어있지 않은지 여부
 * (주의: 숫자타입은 항상 true를 반환)
 *
 * @param {any} a 대상
 * @returns {boolean} 비어 있는지 여부
 */
declare const isNotEmpty: any;
/**
 * 대상 인자가 undefined 또는 null이 아닌지 여부 조회
 *
 * @param {any} a 대상인자
 * @returns {boolean} 대상 인자가 undefined 또는 null이 아닌지 여부
 */
declare const isNotNil: any;
/**
 * 대상 문자열이 json형식 문자열인지 여부 조회
 *
 * @param {string} a 조회 대상 문자열
 * @returns {boolean} json 문자열인지 여부
 */
declare function isJson(a: string): boolean;
/**
 * a인자와 b인자가 다른지 여부 (deep equal) 조회
 * @param {any} a 비교 인자
 * @param {any} b 비교 인자
 * @returns {boolean} a인자와 b인자가 다른지 여부 (deep equal)
 */
declare const notEquals: any;
/**
 * 원시 타입(primitive) 인지 여부 조회
 * null, undefined, Boolean, Number, String
 *
 * @param {any} a 조회 대상
 * @returns {boolean} 원시 타입(primitive) 인지 여부
 */
declare function isVal(a: any): boolean;
/**
 * 참조 타입(reference) 인지 여부 조회
 * Array, Object, Function
 *
 * @param {any} a 조회 대상
 * @returns {boolean} 참조 타입(reference) 인지 여부
 */
declare const isRef: any;
/**
 * invert boolean
 * @param {any} x 대상
 * @return {boolean} not 연산된 값
 */
declare function not(x: any): boolean;
/**
 * arr인자 배열에 a인자가 포함되지 않았는지 여부 조회
 * @param {any} a 대상 인자
 * @param {any[]} arr 대상 배열
 * @returns {boolean} arr 배열에 a인자가 포함되지 않았는지 여부
 */
declare const notIncludes: any;
/**
 * 대상 인자를 boolean 타입으로 변환\
 *
 * @param {any} a 대상
 * @returns {boolean} 변환된 boolean 타입 값
 */
declare function toBool(a: any): boolean;
/**
 * shallow freeze 보완
 * (대상 object의 refence 타입의 properties까지 object.freeze 처리)
 * @param {object} obj 대상 객체
 * @returns {object} frozen 처리된 객체
 */
declare function deepFreeze(obj: object): object;
/**
 * value로 object key 조회
 *
 * @param {object} a 대상 객체
 * @param {string} v 조회 대상 key (속성명)
 * @returns {any} 속성명에 해당하는 값
 */
declare const key: any;
/**
 * 대상 객체의 속성명을 transformFn의 결과값으로 변환
 *
 * @param {(a) => string} transformFn 변환함수
 * @param {object} dest 대상 객체
 * @returns {object} 속성명이 변환된 객체
 */
declare const transformObjectKey: any;
/**
 * 대상 object의 property key문자열을 camelcase 문자열로 변환
 *
 * @param {object} a 대상 객체
 * @returns {object} 속성명이 camel case로 변환된 객체
 */
declare const toCamelcase: any;
/**
 * 대상 object의 property key문자열을 snakecase 문자열로 변환
 *
 * @param {object} a 대상 객체
 * @returns {object} 속성명이 snake case로 변환된 객체
 */
declare const toSnakecase: any;
declare const toPascalcase: any;
/**
 * 대상 문자열을 pascalcase 문자열로 변환
 * @param {string} a 대상 문자열
 * @returns {string} pascal case로 변환된 문자열
 */
declare const pascalCase: any;
/**
 * date형식 문자열 여부 조회
 * @param {string} str date형식 문자열
 * @returns {boolean} date형식 문자열 여부
 */
declare function isDatetimeString(str: string): boolean;
/**
 * applicative functor pattern 구현체
 * (주로 fp.pipe함수에서 함수의 인자 순서를 변경하기 위해 사용)
 *
 * @param {any} a 대입 인자
 * @param {function} curried currying된 함수
 * @returns {any} 결과값
 */
declare const ap: any;
/**
 * a인자가 t타입인지 여부 조회
 * @param {any} t 조회 대상 type
 * @param {any} a 조회 대상
 * @returns {boolean} a인자가 t타입인지 여부
 */
declare const instanceOf: any;
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
declare const ternary: any;
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
declare const ifT: any;
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
declare const ifF: any;
/**
 * arr인자의 idx인자의 index에 해당하는 요소 제거
 * @param {number|string} idx numeric 타입 색인값
 * @param {any[]} arr 대상 배열
 * @returns {any[]} index에 해당하는 요소 제거된 배열
 */
declare const removeByIndex: any;
/**
 * 인자의 마지막 요소 제거 (immutable)
 *
 * @param {string|any[]} arr 문자열 또는 배열의 마지막 요소 제거
 * @returns 마지막 요소 제거된 인자
 */
declare function removeLast(a: any): any;
/**
 * fp.concat alias
 *
 * @param {any[]} array 병합대상 배열
 * @param {any|any[]} a 병합 인자
 * @returns {any[]} 병합된 배열
 */
declare const append: any;
/**
 * array 인자의 (index상)앞쪽에 value인자를 추가
 *
 * @param {any[]} array 병합대상 배열
 * @param {any|any[]} value 병합 인자
 * @returns {any[]} 병합된 배열
 */
declare const prepend: any;
/**
 * key(index)를 포함한 fp.map
 * @param {(v, k) => any} f value, key(또는 index)를 인자로 갖는 callback
 * @param {object|any[]} a 대상 collection
 * @returns {any[]} 결과 배열
 */
declare const mapWithKey: any;
/**
 * key(index)를 포함한 fp.forEach
 * @param {(v, k) => any} f value, key(또는 index)를 인자로 갖는 callback
 * @param {object|any[]} a 대상 collection
 * @returns {void} 반환값 없음
 */
declare const forEachWithKey: any;
/**
 * key(index)를 포함한 reduce
 *
 * @param {(acc, v, k) => any} f accumulator, value, key(또는 index)를 인자로 갖는 callback
 * @param {any} acc 누적기
 * @param {object|any[]} 대상 collection
 * @returns {any} 누적기
 */
declare const reduceWithKey: any;
/**
 * falsy 타입(0, -0, NaN, false, '')인지 여부 조회
 * @param {any} a 조회 대상
 * @returns {boolean} falsy 타입(0, -0, NaN, false, '')인지 여부
 */
declare function isFalsy(a: any): boolean;
/**
 * truthy 타입 인지 여부 조회
 * (falsy타입(0, -0, NaN, false, '')이 아니면 truthy 타입)
 * @param {any} a 조회 대상
 * @returns {boolean} truthy 타입 인지 여부
 */
declare function isTruthy(a: any): boolean;
/**
 * fp.getOr override
 *
 * fp.getOr의 반환값이 null인 경우, 기본값 반환되게 수정한 버전
 * circular dependency 때문에 closure로 작성
 */
declare const getOr: any;
