"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fp_1 = __importDefault(require("lodash/fp"));
/**
 * 대상 문자열이 json형식 문자열인지 여부 조회
 *
 * @param {string} jsonStr 조회 대상 문자열
 * @returns {boolean} json 문자열인지 여부
 */
var isJson = function (jsonStr) {
    var composer = fp_1.default.pipe(fp_1.default.attempt, fp_1.default.isError);
    var result = fp_1.default.isString(jsonStr) && !composer(function () { return JSON.parse(jsonStr); });
    return result;
};
/**
 * 원시 타입(primitive) 인지 여부 조회
 * null, undefined, Boolean, Number, String
 *
 * @param {any} arg 조회 대상
 * @returns {boolean} 원시 타입(primitive) 인지 여부
 */
var isVal = function (arg) {
    var result = fp_1.default.isNil(arg) || fp_1.default.isBoolean(arg) || fp_1.default.isNumber(arg) || fp_1.default.isString(arg);
    return result;
};
/**
 * 참조 타입(reference) 인지 여부 조회
 * Array, Object, Function
 *
 * @param {any} arg 조회 대상
 * @returns {boolean} 참조 타입(reference) 인지 여부
 */
var isRef = function (arg) {
    var composer = fp_1.default.pipe(isVal, not);
    var result = composer(arg);
    return result;
};
/**
 * 대상 인자가 promise(thenable)인지 여부 조회
 *
 * @param {any} x 조회 대상
 * @return {boolean} 대상 인자가 promise(thenable)인지 여부
 */
var isPromise = function (x) {
    return fp_1.default.isFunction(fp_1.default.get('then', x)) && fp_1.default.isFunction(fp_1.default.get('catch', x));
};
/**
 * 대상 함수를 promise로 lift
 *
 * @param {(...args: any[]) => any} fn 대상 합수
 * @param  {any[]} args 함수 인자 목록
 * @returns {Promise<any>} Promise로 lift된 Promise 객체
 */
var fnPromisify = function (fn) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return new Promise(function (resolve, reject) {
        try {
            resolve(fn.apply(void 0, args));
        }
        catch (e) {
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
var promisify = function (a) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var cond = fp_1.default.cond([
        [fp_1.default.isFunction, function () { return fnPromisify.apply(void 0, __spreadArray([a], args, false)); }],
        [isPromise, function (a) { return fp_1.default.identity(a); }],
        [fp_1.default.T, function (a) { return Promise.resolve(a); }],
    ]);
    var result = cond(a);
    return result;
};
/**
 * promise가 또다른 promise를 resolve하는 경우, promise의 중첩을 제거하기 위한 helper 함수
 *
 * @param {Promise<any> | any} thenable Promise 객체
 * @return {Promise<any> | any} 중첩 제거된 Promise 객체
 */
var flatPromise = function (thenable) {
    return isPromise(thenable) ? thenable.then(function (x) { return flatPromise(x); }) : thenable;
};
/**
 * lodash 형태의 promise then
 *
 * @param {(response:any) => any} successHandler 응답값 처리 callback
 * @param {Promise<any>} thenable resolve 대상 Promise 객체
 * @returns {Promise<any>} fullfilled 상태의 Promise 객체
 */
var andThen = fp_1.default.curry(function (successHandler, thenable) { return promisify(thenable).then(flatPromise(successHandler)); });
/**
 * lodash 형태의 promise catch
 *
 * @param {(error:Error|any) => never | any} failureHandler error 처리 callback
 * @param {Promise<Error|any>} thenable error를 resolve 하는 promise
 * @return {Promise<never | any>} error 상태의 Promise 객체
 */
var otherwise = fp_1.default.curry(function (failureHandler, thenable) {
    return promisify(thenable).catch(flatPromise(failureHandler));
});
/**
 * lodash 형태의 promise finally
 *
 * @param {(...args: any[]) => any} callback Promise 상태와 무관하게 실행되는 callback
 * @param {Promise<any>} thenable Promise 객체
 * @return {Promise<any>} Promise 객체
 */
var _finally = fp_1.default.curry(function (callback, thenable) {
    return promisify(thenable).finally(flatPromise(callback));
});
/**
 * invert boolean
 * @param {any} x 대상
 * @return {boolean} not 연산된 값
 */
var not = function (x) { return !x; };
/**
 * 대상이 비어있지 않은지 여부
 * (주의: 숫자타입은 항상 false를 반환)
 *
 * @param {any} a 대상
 * @returns {boolean} 비어 있는지 여부
 */
var isNotEmpty = function (a) {
    var composer = fp_1.default.pipe(fp_1.default.isEmpty, not);
    var result = composer(a);
    return result;
};
/**
 * 대상 인자를 boolean 타입으로 변환\
 *
 * @param {any} a 대상
 * @returns {boolean} 변환된 boolean 타입 값
 */
var toBool = function (arg) { return !!arg; };
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
var ternary = fp_1.default.curry(function (evaluator, trueHandler, falseHandler, arg) {
    var executor = fp_1.default.curry(function (t, f, a, isTrue) {
        var result = isTrue
            ? fp_1.default.isFunction(t)
                ? t(a)
                : fp_1.default.identity(t)
            : fp_1.default.isFunction(f)
                ? f(a)
                : fp_1.default.identity(f);
        return result;
    });
    var result = executor(trueHandler, falseHandler, arg, fp_1.default.isFunction(evaluator) ? evaluator(arg) : !!arg);
    return result;
});
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
var ifT = fp_1.default.curry(function (evaluator, trueHandler, arg) {
    var isValidEvaluator = fp_1.default.isFunction(evaluator) || fp_1.default.isBoolean(evaluator);
    if (isValidEvaluator) {
        // evaluator가 함수인 경우
        if (fp_1.default.isFunction(evaluator)) {
            if (fp_1.default.pipe(evaluator, fp_1.default.equals(true))(arg)) {
                return fp_1.default.isFunction(trueHandler) ? trueHandler(arg) : trueHandler;
            }
            else {
                return arg;
            }
        }
        else {
            // evaluator가 boolean인 경우
            if (evaluator) {
                return fp_1.default.isFunction(trueHandler) ? trueHandler(arg) : trueHandler;
            }
            else {
                return arg;
            }
        }
    }
    else {
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
var ifF = fp_1.default.curry(function (evaluator, falseHandler, arg) {
    var isValidEvaluator = fp_1.default.isFunction(evaluator) || fp_1.default.isBoolean(evaluator);
    if (isValidEvaluator) {
        // evaluator가 함수인 경우
        if (fp_1.default.isFunction(evaluator)) {
            if (fp_1.default.pipe(evaluator, fp_1.default.equals(false))(arg)) {
                return fp_1.default.isFunction(falseHandler) ? falseHandler(arg) : falseHandler;
            }
            else {
                return arg;
            }
        }
        else {
            // evaluator가 boolean인 경우
            if (evaluator) {
                return fp_1.default.isFunction(falseHandler) ? falseHandler(arg) : falseHandler;
            }
            else {
                return arg;
            }
        }
    }
    else {
        throw new Error('invalid parameter(s)');
    }
});
/**
 * a인자가 t타입인지 여부 조회
 * @param {any} t 조회 대상 type
 * @param {any} a 조회 대상
 * @returns {boolean} a인자가 t타입인지 여부
 */
var instanceOf = fp_1.default.curry(function (t, a) { return a instanceof t; });
/**
 * 대상 문자열을 pascalcase 문자열로 변환
 * @param {string} str 대상 문자열
 * @returns {string} pascal case로 변환된 문자열
 */
var pascalCase = function (str) {
    var composer = fp_1.default.pipe(fp_1.default.camelCase, fp_1.default.upperFirst);
    var result = composer(str);
    return result;
};
/**
 * (collection) fp.map의 비동기 함수\
 * mapper 함수로 비동기 함수를 받아서 처리해준다.
 *
 * @param {(a) => Promise<any>} asyncMapper 비동기 mapper
 * @param {object|any[]} collection 대상 object 또는 array
 * @returns {Promise<any[]>} 결과 array를 resolve 하는 promise
 */
var mapAsync = fp_1.default.curry(function (asyncMapper, collection) { return __awaiter(void 0, void 0, void 0, function () {
    var composer, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                composer = fp_1.default.pipe(fp_1.default.flatMapDeep.convert({ cap: false })(fp_1.default.pipe(asyncMapper, promisify)), function (a) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Promise.all(a)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                }); }); });
                return [4 /*yield*/, composer(collection)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, result];
        }
    });
}); });
/**
 * 비동기 forEach
 * 실행함수로 비동기 함수를 받아서 처리해준다
 * 순차실행
 *
 * @param {(value: any, key: number | string) => Promise<any>} callbackAsync 비동기 iterator
 * @param {object|any[]} collection 대상 객체 또는 배열
 * @returns {Promise<any[]>} 결과 Promise
 */
var forEachAsync = fp_1.default.curry(function (callbackAsync, collection) { return __awaiter(void 0, void 0, void 0, function () {
    var loopResults, entries, _i, entries_1, entry, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                loopResults = [];
                entries = fp_1.default.entries(collection);
                _i = 0, entries_1 = entries;
                _c.label = 1;
            case 1:
                if (!(_i < entries_1.length)) return [3 /*break*/, 4];
                entry = entries_1[_i];
                _b = (_a = loopResults).push;
                return [4 /*yield*/, callbackAsync(entry[1], (fp_1.default.isArray(collection) ? fp_1.default.toNumber(entry[0]) : entry[0]))];
            case 2:
                _b.apply(_a, [_c.sent()]);
                _c.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/, loopResults];
        }
    });
}); });
/**
 * (collection) fp.filter의 비동기 함수\
 * 필터함수로 비동기 함수를 받아서 처리해준다.
 *
 * @param {(a) => Promise<bool>} asyncFilter 비동기 필터
 * @param {object|any[]} collection 대상 object 또는 array
 * @returns {Promise<any[]>} 결과 array를 resolve하는 promise
 */
var filterAsync = fp_1.default.curry(function (asyncFilter, collection) { return __awaiter(void 0, void 0, void 0, function () {
    var composer, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                composer = fp_1.default.pipe(mapAsync(function (item, key) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, asyncFilter(item, key)];
                        case 1: return [2 /*return*/, (_a.sent()) ? item : false];
                    }
                }); }); }), andThen(function (response) {
                    return fp_1.default.filter(fp_1.default.pipe(fp_1.default.equals(false), not))(response);
                }));
                return [4 /*yield*/, composer(collection)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, result];
        }
    });
}); });
/**
 * (collection) fp.find의 비동기 함수
 * @param {(a) => Promise<bool>} asyncFilter 비동기 필터
 * @param {object|any[]} collection 대상 object 또는 array
 * @returns {Promise<any>} 필터된 단일 결과를 resolve하는 promise
 */
var findAsync = fp_1.default.curry(function (asyncFilter, collection) { return __awaiter(void 0, void 0, void 0, function () {
    var composer, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                composer = fp_1.default.pipe(filterAsync(asyncFilter), andThen(function (response) {
                    return fp_1.default.isEmpty(response) ? undefined : fp_1.default.head(response);
                }), otherwise(fp_1.default.always(undefined)));
                return [4 /*yield*/, composer(collection)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, result];
        }
    });
}); });
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
var reduceAsync = fp_1.default.curry(function (asyncFn, initAcc, collection) { return __awaiter(void 0, void 0, void 0, function () {
    var initAccPromise, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fp_1.default.pipe(promisify, function (accP) {
                    return Promise.resolve(accP);
                })(initAcc)];
            case 1:
                initAccPromise = _a.sent();
                result = fp_1.default.reduce.convert({ cap: false })(asyncFn, initAccPromise, collection);
                return [2 /*return*/, result];
        }
    });
}); });
/**
 * value로 object key 조회
 *
 * @param {object} obj 대상 객체
 * @param {string} value 조회 대상 값
 * @returns {string} 속성명
 */
var key = fp_1.default.curry(function (obj, value) {
    var composer = fp_1.default.pipe(fp_1.default.entries, fp_1.default.find(function (_a) {
        var k = _a[0], val = _a[1];
        return fp_1.default.equals(value, val);
    }), fp_1.default.head);
    var result = composer(obj);
    return result;
});
/**
 * shallow freeze 보완
 * (대상 object의 refence 타입의 properties까지 object.freeze 처리)
 * @param {object} obj 대상 객체
 * @returns {object} frozen 처리된 객체
 */
var deepFreeze = function (obj) {
    var freezeRecursively = function (v) {
        return isRef(v) && !Object.isFrozen(v) ? deepFreeze(v) : v;
    };
    var composer = fp_1.default.pipe(Object.freeze, fp_1.default.forOwn(freezeRecursively));
    var result = composer(obj);
    return result;
};
/**
 * 대상 객체의 속성명을 transformFn의 결과값으로 변환
 *
 * @param {(orignStr) => string} transformFn 변환함수
 * @param {object} obj 대상 객체
 * @returns {object} 속성명이 변환된 객체
 */
var transformObjectKey = fp_1.default.curry(function (transformFn, obj) {
    var convertRecursively = function (obj) {
        var convertTo = function (o) {
            var composer = fp_1.default.pipe(fp_1.default.reduce.convert({ cap: false })(function (acc, v, k) {
                var cond = function (arg) {
                    if (fp_1.default.isPlainObject(arg)) {
                        return convertTo(arg);
                    }
                    else if (fp_1.default.isArray(arg)) {
                        return fp_1.default.map(cond, arg);
                    }
                    else {
                        return fp_1.default.identity(arg);
                    }
                };
                var transformedKey = transformFn(k);
                if (!fp_1.default.has(transformedKey, acc)) {
                    var result_1 = fp_1.default.set(transformedKey, cond(v), acc);
                    return result_1;
                }
                else {
                    throw new Error("".concat(transformedKey, " already exist. duplicated property name is not supported."));
                }
            }, {}));
            var result = composer(o);
            return result;
        };
        var result = convertTo(obj);
        return result;
    };
    var result = fp_1.default.isObject(obj) || fp_1.default.isArray(obj) ? convertRecursively(obj) : obj;
    return result;
});
/**
 * 대상 object의 property key문자열을 camelcase 문자열로 변환
 *
 * @param {object} obj 대상 객체
 * @returns {object} 속성명이 camel case로 변환된 객체
 */
var toCamelcase = transformObjectKey(fp_1.default.camelCase);
/**
 * 대상 object의 property key문자열을 snakecase 문자열로 변환
 *
 * @param {object} obj 대상 객체
 * @returns {object} 속성명이 snake case로 변환된 객체
 */
var toSnakecase = transformObjectKey(fp_1.default.snakeCase);
/**
 * 대상 object의 property key문자열을 camelcase 문자열로 변환
 *
 * @param {object} obj 대상 객체
 * @returns {object} 속성명이 camel case로 변환된 객체
 */
var toPascalcase = transformObjectKey(pascalCase);
/**
 * date형식 문자열 여부 조회
 * @param {string} dateStr date형식 문자열
 * @returns {boolean} date형식 문자열 여부
 */
var isDatetimeString = function (dateStr) {
    return fp_1.default.isString(dateStr) && !isNaN(Date.parse(dateStr));
};
/**
 * applicative functor pattern 구현체
 * (주로 fp.pipe함수에서 함수의 인자 순서를 변경하기 위해 사용)
 *
 * @param {any} arg 대입 인자
 * @param {function} curried currying된 함수
 * @returns {any} 결과값
 */
var ap = fp_1.default.curry(function (a, curried) { return curried(a); });
/**
 * 대상 인자가 undefined 또는 null이 아닌지 여부 조회
 *
 * @param {any} arg 대상인자
 * @returns {boolean} 대상 인자가 undefined 또는 null이 아닌지 여부
 */
var isNotNil = fp_1.default.pipe(fp_1.default.isNil, not);
/**
 * arr인자 배열에 a인자가 포함되지 않았는지 여부 조회
 * @param {any} a 대상 인자
 * @param {any[] | Record<string, any> | string} arr 대상 배열
 * @returns {boolean} arr 배열에 a인자가 포함되지 않았는지 여부
 */
var notIncludes = fp_1.default.curry(function (arg, targetArray) {
    var result = !fp_1.default.includes(arg, targetArray);
    return result;
});
/**
 * a인자와 b인자가 다른지 여부 (deep equal) 조회
 * @param {any} a 비교 인자
 * @param {any} b 비교 인자
 * @returns {boolean} a인자와 b인자가 다른지 여부 (deep equal)
 */
var notEquals = fp_1.default.curry(function (a, b) {
    var composer = fp_1.default.pipe(fp_1.default.equals(a), not);
    var result = composer(b);
    return result;
});
/**
 * arr인자의 idx인자의 index에 해당하는 요소 제거
 * @param {number|string} index numeric 타입 색인값
 * @param {any[]} targetArray 대상 배열
 * @returns {any[]} index에 해당하는 요소 제거된 배열
 */
var removeByIndex = fp_1.default.curry(function (index, targetArray) {
    if (fp_1.default.isArray(targetArray) &&
        fp_1.default.pipe(fp_1.default.size, fp_1.default.curry(function (index, sz) {
            var num = fp_1.default.toNumber(index);
            var isAccesable = fp_1.default.isNumber(num) && fp_1.default.lte(num, sz);
            return isAccesable;
        })(index))(targetArray)) {
        var cloned = fp_1.default.cloneDeep(targetArray);
        cloned.splice(fp_1.default.toNumber(index), 1);
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
    if (fp_1.default.isArray(target) || fp_1.default.isString(target)) {
        var result = fp_1.default.cloneDeep(target);
        fp_1.default.isArray(target)
            ? result.pop()
            : result.substring(0, fp_1.default.size(target) - 1);
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
var append = fp_1.default.concat;
/**
 * array 인자의 (index상)앞쪽에 value인자를 추가
 *
 * @param {any[]} targetArray 병합대상 배열
 * @param {any|any[]} value 병합 인자
 * @returns {any[]} 병합된 배열
 */
var prepend = fp_1.default.curry(function (targetArray, value) {
    return fp_1.default.isArray(value)
        ? fp_1.default.concat(value, targetArray)
        : fp_1.default.concat([value], targetArray);
});
/**
 * key(index)를 포함한 fp.map
 * @param {(v, k) => any} f value, key(또는 index)를 인자로 갖는 callback
 * @param {object|any[]} a 대상 collection
 * @returns {any[]} 결과 배열
 */
var mapWithKey = fp_1.default.curry(function (iteratee, collection) { return fp_1.default.map.convert({ cap: false })(iteratee, collection); });
/**
 * key(index)를 포함한 fp.forEach
 * @param {(v, k) => any} f value, key(또는 index)를 인자로 갖는 callback
 * @param {object|any[]} a 대상 collection
 * @returns {void} 반환값 없음
 */
var forEachWithKey = fp_1.default.curry(function (iteratee, collection) {
    return fp_1.default.forEach.convert({ cap: false })(iteratee, collection);
});
/**
 * key(index)를 포함한 reduce
 *
 * @param {(acc, v, k) => any} f accumulator, value, key(또는 index)를 인자로 갖는 callback
 * @param {any} acc 누적기
 * @param {object|any[]} 대상 collection
 * @returns {any} 누적기
 */
var reduceWithKey = fp_1.default.curry(function (iteratee, acc, collection) {
    return fp_1.default.reduce.convert({ cap: false })(iteratee, acc, collection);
});
/**
 * falsy 타입(0, -0, NaN, false, '')인지 여부 조회
 * @param {any} arg 조회 대상
 * @returns {boolean} falsy 타입(0, -0, NaN, false, '')인지 여부
 */
var isFalsy = function (arg) {
    return fp_1.default.isNil(arg) || fp_1.default.some(fp_1.default.equals(arg), [0, -0, NaN, false, '']);
};
/**
 * truthy 타입 인지 여부 조회
 * (falsy타입(0, -0, NaN, false, '')이 아니면 truthy 타입)
 * @param {any} arg 조회 대상
 * @returns {boolean} truthy 타입 인지 여부
 */
var isTruthy = function (arg) { return !isFalsy(arg); };
/**
 * fp.getOr override
 *
 * fp.getOr의 반환값이 null인 경우, 기본값 반환되게 수정한 버전
 * circular dependency 때문에 closure로 작성
 */
var getOr = (function (_a) {
    var curry = _a.curry, getOr = _a.getOr;
    var _getOr = curry(function (defaultValue, path, target) {
        return fp_1.default.isNil(target) || fp_1.default.isNil(fp_1.default.get(path, target))
            ? defaultValue
            : fp_1.default.get(path, target);
    });
    return _getOr;
})(fp_1.default);
/**
 * ms 시간동안 대기
 *
 * @param ms 대기시간
 * @returns Promise
 */
var delayAsync = function (ms) { return __awaiter(void 0, void 0, void 0, function () {
    var exe, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                exe = function () {
                    return new Promise(function (resolve) { return setTimeout(function () { return resolve(); }, ms); });
                };
                return [4 /*yield*/, exe()];
            case 1:
                result = _a.sent();
                return [2 /*return*/, result];
        }
    });
}); };
exports.default = {
    mapAsync: mapAsync,
    filterAsync: filterAsync,
    reduceAsync: reduceAsync,
    findAsync: findAsync,
    forEachAsync: forEachAsync,
    promisify: promisify,
    andThen: andThen,
    otherwise: otherwise,
    finally: _finally,
    isPromise: isPromise,
    isNotEmpty: isNotEmpty,
    isNotNil: isNotNil,
    isJson: isJson,
    notEquals: notEquals,
    isNotEqual: notEquals,
    isVal: isVal,
    isPrimitive: isVal,
    isRef: isRef,
    isReference: isRef,
    not: not,
    notIncludes: notIncludes,
    toBool: toBool,
    deepFreeze: deepFreeze,
    key: key,
    keyByVal: key,
    // string
    transformObjectKey: transformObjectKey,
    toCamelcase: toCamelcase,
    toCamelKey: toCamelcase,
    toSnakecase: toSnakecase,
    toSnakeKey: toSnakecase,
    toPascalcase: toPascalcase,
    pascalCase: pascalCase,
    isDatetimeString: isDatetimeString,
    ap: ap,
    instanceOf: instanceOf,
    // array
    removeByIndex: removeByIndex,
    removeLast: removeLast,
    append: append,
    prepend: prepend,
    mapWithKey: mapWithKey,
    mapWithIndex: mapWithKey,
    forEachWithKey: forEachWithKey,
    forEachWithIndex: forEachWithKey,
    reduceWithKey: reduceWithKey,
    reduceWithIndex: reduceWithKey,
    isFalsy: isFalsy,
    isTruthy: isTruthy,
    getOr: getOr,
    delayAsync: delayAsync,
    sleep: delayAsync,
};
