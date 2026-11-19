import type { LodashConcat } from 'lodash/fp';
/** 배열이면 요소 타입, 객체면 속성값 타입 추론 */
type ValueOf<T> = T extends readonly (infer V)[] ? V : T[keyof T];
/** 배열이면 number, 객체면 string 키 타입 추론 */
type KeyOf<T> = T extends readonly any[] ? number : Extract<keyof T, string>;
/** 배열 또는 객체 collection */
type Collection<V> = readonly V[] | {
    readonly [key: string]: V;
};
/** 동기 값 또는 Promise */
type MaybePromise<T> = T | Promise<T>;
/** 일반 객체 */
type Dict<V = any> = Record<string, V>;
/**
 * 대상 인자를 promise로 wrapping (lift)
 *
 * @param {any} a 대상 인자
 * @param {any[]} args 대상 인자 a가 함수인 경우, 함수의 인자목록
 * @return {Promise<any>} Promise로 lift된 Promise 객채
 */
declare function promisify<A extends any[], R>(fn: (...args: A) => R, ...args: A): Promise<Awaited<R>>;
declare function promisify<R>(a: MaybePromise<R>): Promise<Awaited<R>>;
type TandThen = {
    <T, R>(successHandler: (response: T) => MaybePromise<R>, thenable: MaybePromise<T>): Promise<R>;
    <T, R>(successHandler: (response: T) => MaybePromise<R>): (thenable: MaybePromise<T>) => Promise<R>;
};
type Totherwise = {
    <E extends Error, T, R>(failureHandler: (error: E) => MaybePromise<R>, thenable: MaybePromise<T>): Promise<T | R>;
    <E extends Error, R>(failureHandler: (error: E) => MaybePromise<R>): <T>(thenable: MaybePromise<T>) => Promise<T | R>;
};
type Tfinally = {
    <T>(callback: () => MaybePromise<void>, thenable: MaybePromise<T>): Promise<T>;
    (callback: () => MaybePromise<void>): <T>(thenable: MaybePromise<T>) => Promise<T>;
};
type Ctor = abstract new (...args: any[]) => object;
type TinstanceOf = {
    <C extends Ctor, T>(t: C, arg: T): boolean;
    <C extends Ctor>(t: C): <T>(arg: T) => boolean;
};
type TmapAsync = {
    <T extends object, R>(asyncMapper: (value: ValueOf<T>, key: KeyOf<T>) => MaybePromise<R>, collection: T): Promise<R[]>;
    <V, K extends string | number, R>(asyncMapper: (value: V, key: K) => MaybePromise<R>): (collection: Collection<V>) => Promise<R[]>;
};
type TforEachAsync = {
    <T extends object, R>(callbackAsync: (value: ValueOf<T>, key: KeyOf<T>) => MaybePromise<R>, collection: T): Promise<R[]>;
    <V, K extends string | number, R>(callbackAsync: (value: V, key: K) => MaybePromise<R>): (collection: Collection<V>) => Promise<R[]>;
};
type TfilterAsync = {
    <T extends object>(asyncFilter: (value: ValueOf<T>, key: KeyOf<T>) => MaybePromise<boolean>, collection: T): Promise<ValueOf<T>[]>;
    <V, K extends string | number>(asyncFilter: (value: V, key: K) => MaybePromise<boolean>): (collection: Collection<V>) => Promise<V[]>;
};
type TfindAsync = {
    <T extends object>(asyncFilter: (value: ValueOf<T>, key: KeyOf<T>) => MaybePromise<boolean>, collection: T): Promise<ValueOf<T>>;
    <V, K extends string | number>(asyncFilter: (value: V, key: K) => MaybePromise<boolean>): (collection: Collection<V>) => Promise<V>;
};
type TreduceAsync = {
    <T extends object, A>(asyncFn: (acc: A, value: ValueOf<T>, key: KeyOf<T>) => MaybePromise<A>, initAcc: MaybePromise<A>, collection: T): Promise<A>;
    <V, K extends string | number, A>(asyncFn: (acc: A, value: V, key: K) => MaybePromise<A>, initAcc: MaybePromise<A>): (collection: Collection<V>) => Promise<A>;
};
type Tkey = {
    <T extends object>(obj: T, value: ValueOf<T>): KeyOf<T>;
    <T extends object>(obj: T): (value: ValueOf<T>) => KeyOf<T>;
};
type TtransformObjectKey = {
    <T extends object>(transformFn: (originStr: string) => string, obj: T): Dict;
    (transformFn: (originStr: string) => string): <T extends object>(obj: T) => Dict;
};
type Tap = {
    <A, R>(arg: A, curried: (arg: A) => R): R;
    <A>(arg: A): <R>(curried: (arg: A) => R) => R;
};
type TnotIncludes = {
    <T extends object | string>(arg: ValueOf<T>, target: T): boolean;
    <V>(arg: V): (target: Collection<V> | string) => boolean;
};
type TnotEquals = {
    <A, B = A>(a: A, b: B): boolean;
    <A>(a: A): <B = A>(b: B) => boolean;
};
type TremoveByIndex = {
    <R>(index: number | string, targetArray: R[]): R[];
    (index: number | string): <R>(targetArray: R[]) => R[];
};
declare function removeLast(target: string): string;
declare function removeLast<T>(target: T[]): T[];
type Tprepend = {
    <T>(targetArray: T[], value: T | T[]): T[];
    <T>(targetArray: T[]): (value: T | T[]) => T[];
};
type TmapWithKey = {
    <T extends object, R>(iteratee: (value: ValueOf<T>, key: KeyOf<T>) => R, collection: T): R[];
    <V, K extends string | number, R>(iteratee: (value: V, key: K) => R): (collection: Collection<V>) => R[];
};
type TforEachWithKey = {
    <T extends object>(iteratee: (value: ValueOf<T>, key: KeyOf<T>) => boolean | void, collection: T): T;
    <V, K extends string | number>(iteratee: (value: V, key: K) => boolean | void): <C extends Collection<V>>(collection: C) => C;
};
type TreduceWithKey = {
    <T extends object, R>(iteratee: (acc: R, value: ValueOf<T>, key: KeyOf<T>) => R, acc: R, collection: T): R;
    <V, K extends string | number, R>(iteratee: (acc: R, value: V, key: K) => R, acc: R): (collection: Collection<V>) => R;
};
declare const _default: {
    mapAsync: TmapAsync;
    filterAsync: TfilterAsync;
    reduceAsync: TreduceAsync;
    findAsync: TfindAsync;
    forEachAsync: TforEachAsync;
    promisify: typeof promisify;
    andThen: TandThen;
    otherwise: Totherwise;
    finally: Tfinally;
    isPromise: <T>(x: T) => boolean;
    isNotEmpty: <T>(a: T) => boolean;
    isNotNil: <T>(arg: T) => boolean;
    isJson: (jsonStr: string) => boolean;
    notEquals: TnotEquals;
    isNotEqual: TnotEquals;
    isVal: <T>(arg: T) => boolean;
    isPrimitive: <T>(arg: T) => boolean;
    isRef: <T>(arg: T) => boolean;
    isReference: <T>(arg: T) => boolean;
    not: <T>(x: T) => boolean;
    notIncludes: TnotIncludes;
    toBool: <T>(arg: T) => boolean;
    deepFreeze: <T extends object>(obj: T) => Readonly<T>;
    key: Tkey;
    keyByVal: Tkey;
    transformObjectKey: TtransformObjectKey;
    toCamelcase: <T extends object>(obj: T) => Dict;
    toCamelKey: <T extends object>(obj: T) => Dict;
    toSnakecase: <T extends object>(obj: T) => Dict;
    toSnakeKey: <T extends object>(obj: T) => Dict;
    toPascalcase: <T extends object>(obj: T) => Dict;
    pascalCase: (str: string) => string;
    isDatetimeString: (dateStr: string) => boolean;
    ap: Tap;
    instanceOf: TinstanceOf;
    removeByIndex: TremoveByIndex;
    removeLast: typeof removeLast;
    append: LodashConcat;
    prepend: Tprepend;
    mapWithKey: TmapWithKey;
    mapWithIndex: TmapWithKey;
    forEachWithKey: TforEachWithKey;
    forEachWithIndex: TforEachWithKey;
    reduceWithKey: TreduceWithKey;
    reduceWithIndex: TreduceWithKey;
    isFalsy: <T>(arg: T) => boolean;
    isTruthy: <T>(arg: T) => boolean;
    getOr: import("lodash/fp").LodashGetOr;
    delayAsync: (ms: number) => Promise<void>;
    sleep: (ms: number) => Promise<void>;
};
export default _default;
