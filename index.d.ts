import fp from 'lodash/fp';
import { F } from 'ts-toolbelt';
type TandThen = F.Curry<(fn: (response: any) => any, thenable: Promise<any>) => Promise<any>>;
type Totherwise = F.Curry<(failureHandler: (error: Error | any) => never | any, thenable: Promise<Error | any>) => Promise<never | any>>;
type Tfinally = F.Curry<(callback: (...args: any[]) => any, thenable: Promise<any>) => Promise<any>>;
type TinstanceOf = F.Curry<(<T>(t: any, arg: T) => boolean)>;
type TmapAsync = F.Curry<(<T, K extends keyof T, R>(asyncMapper: (arg: T[K], key: K) => Promise<R>, collection: T) => Promise<R[]>)>;
type TfilterAsync = F.Curry<(<T, K extends keyof T, R>(asyncFilter: (arg: T[K], key: K) => Promise<boolean>, collection: T) => Promise<R[]>)>;
type TfindAsync = F.Curry<(<T, K extends keyof T, R>(asyncFilter: (arg: T[K], key: K) => Promise<boolean>, collection: T) => Promise<R>)>;
type TreduceAsync = F.Curry<(<T, K extends keyof T>(asyncFn: (acc: any, arg: T[K], key: K) => Promise<any>, initAcc: Promise<any> | any, collection: T) => Promise<any>)>;
type Tkey = F.Curry<(obj: Record<string, any>, value: any) => string>;
type TtransformObjectKey = F.Curry<(transformFn: (orignStr: string) => string, obj: Record<string, any>) => Record<string, any>>;
type Tap = F.Curry<(arg: any, curried: Function) => any>;
type TnotIncludes = F.Curry<(arg: any, targetArray: any[] | Record<string, any> | string) => boolean>;
type TnotEquals = F.Curry<(a: any, b: any) => boolean>;
type TremoveByIndex = F.Curry<(<R>(index: number | string, targetArray: R[]) => R[])>;
declare function removeLast(target: string): string;
declare function removeLast(target: any[]): any[];
type Tprepend = F.Curry<(<T>(arr: T[], arg: T | T[]) => T[])>;
type TmapWithKey = F.Curry<(<T, K extends keyof T, R>(iteratee: (value: T[K], key: K) => R, collection: T) => R[])>;
type TforEachWithKey = F.Curry<(<T, K extends keyof T>(iteratee: (value: T[K], key: K) => T, collection: T) => T)>;
type TreduceWithKey = F.Curry<(<T, K extends keyof T, R>(iteratee: (acc: R, value: T[K], key: K) => R, acc: R, collection: T) => R)>;
declare const _default: {
    mapAsync: TmapAsync;
    filterAsync: TfilterAsync;
    reduceAsync: TreduceAsync;
    findAsync: TfindAsync;
    forEachAsync: (...args: any[]) => any;
    promisify: (a: any, ...args: any[]) => Promise<any>;
    andThen: TandThen;
    otherwise: Totherwise;
    finally: Tfinally;
    isPromise: <T>(x: T) => boolean;
    isNotEmpty: (a: any) => boolean;
    isNotNil: (arg: any) => boolean;
    isJson: (jsonStr: string) => boolean;
    notEquals: TnotEquals;
    isNotEqual: TnotEquals;
    isVal: <T>(arg: T) => boolean;
    isPrimitive: <T>(arg: T) => boolean;
    isRef: <T>(arg: T) => boolean;
    isReference: <T>(arg: T) => boolean;
    not: <T>(x: T) => boolean;
    notIncludes: TnotIncludes;
    toBool: (arg: any) => boolean;
    deepFreeze: (obj: Record<string, any>) => Record<string, any>;
    key: Tkey;
    keyByVal: Tkey;
    transformObjectKey: TtransformObjectKey;
    toCamelcase: F.Curry<(obj: Record<string, any>) => Record<string, any>>;
    toCamelKey: F.Curry<(obj: Record<string, any>) => Record<string, any>>;
    toSnakecase: F.Curry<(obj: Record<string, any>) => Record<string, any>>;
    toSnakeKey: F.Curry<(obj: Record<string, any>) => Record<string, any>>;
    toPascalcase: F.Curry<(obj: Record<string, any>) => Record<string, any>>;
    pascalCase: (str: string) => string;
    isDatetimeString: (dateStr: string) => boolean;
    ap: Tap;
    instanceOf: TinstanceOf;
    removeByIndex: TremoveByIndex;
    removeLast: typeof removeLast;
    append: fp.LodashConcat;
    prepend: Tprepend;
    mapWithKey: TmapWithKey;
    mapWithIndex: TmapWithKey;
    forEachWithKey: TforEachWithKey;
    forEachWithIndex: TforEachWithKey;
    reduceWithKey: TreduceWithKey;
    reduceWithIndex: TreduceWithKey;
    isFalsy: (arg: any) => boolean;
    isTruthy: (arg: any) => boolean;
    getOr: import("lodash").CurriedFunction3<any, string, any, any>;
    delayAsync: (ms: number) => Promise<void>;
    sleep: (ms: number) => Promise<void>;
};
export default _default;
