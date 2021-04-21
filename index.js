!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(require("lodash/fp")):"function"==typeof define&&define.amd?define(["lodash/fp"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self)._)}(this,(function(e){"use strict";function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var u=t(e);function a(e,t,u,a,r,n,l){try{var f=e[n](l),i=f.value}catch(e){return void u(e)}f.done?t(i):Promise.resolve(i).then(a,r)}function r(e){return function(){var t=this,u=arguments;return new Promise((function(r,n){var l=e.apply(t,u);function f(e){a(l,r,n,f,i,"next",e)}function i(e){a(l,r,n,f,i,"throw",e)}f(void 0)}))}}const n=e=>u.default.isFunction(u.default.get("then",e))&&u.default.isFunction(u.default.get("catch",e)),l=(e,...t)=>u.default.cond([[u.default.isFunction,()=>((e,...t)=>new Promise(((u,a)=>{try{u(e(...t))}catch(e){a(e)}})))(e,...t)],[n,u.default.identity],[u.default.T,e=>Promise.resolve(e)]])(e),f=e=>n(e)?e.then((e=>f(e))):e,i=u.default.curry(((e,t)=>l(t).then(f(e)))),d=u.default.curry(((e,t)=>l(t).catch(f(e)))),o=u.default.curry(((e,t)=>l(t).finally(f(e)))),c=e=>!e,s=u.default.pipe(u.default.isEmpty,c),p=u.default.curry(((e,t,a,r)=>{var n;return u.default.curry(((e,t,a,r)=>r?u.default.isFunction(e)?e(a):e:u.default.isFunction(t)?t(a):t))(t,a,r,(n=e,u.default.isNil(n)?u.default.identity:n)(r))})),y=u.default.curry(((e,t)=>t instanceof e)),h=u.default.pipe(u.default.camelCase,u.default.upperFirst),m=u.default.curry(function(){var e=r((function*(e,t){const a=u.default.pipe(u.default.flatMapDeep(u.default.pipe(e,l)),function(){var e=r((function*(e){return yield Promise.all(e)}));return function(t){return e.apply(this,arguments)}}());return yield a(t)}));return function(t,u){return e.apply(this,arguments)}}()),v=u.default.curry(function(){var e=r((function*(e,t){const a=u.default.pipe(m(function(){var t=r((function*(t){return!!(yield e(t))&&t}));return function(e){return t.apply(this,arguments)}}()),i(u.default.filter(u.default.pipe(u.default.equals(!1),c))));return yield a(t)}));return function(t,u){return e.apply(this,arguments)}}()),N=u.default.curry(function(){var e=r((function*(e,t){const a=u.default.pipe(m(e),i(u.default.indexOf(!0)),i((e=>u.default.get(`[${e}]`,t))),d(u.default.always(void 0)));return yield a(t)}));return function(t,u){return e.apply(this,arguments)}}()),w=u.default.curry(((e,t,a)=>{const r=Promise.resolve(t);return u.default.reduce(e,r,a)})),F=u.default.curry(function(){var e=r((function*(e,t){const a=[],r=u.default.entries(t);for(const t of r)a.push(yield e(t[1],t[0]));return a}));return function(t,u){return e.apply(this,arguments)}}()),b=u.default.curry(((e,t)=>u.default.pipe(u.default.entries,u.default.find((([e,a])=>u.default.equals(t,a))),u.default.head)(e))),q=e=>u.default.pipe(Object.freeze,u.default.forOwn((e=>W(e)&&!Object.isFrozen(e)?q(e):e)))(e),x=u.default.curry(((e,t)=>u.default.isObject(t)||u.default.isArray(t)?(t=>{const a=t=>u.default.pipe(u.default.entries,u.default.reduce(((t,[r,n])=>{const l=u.default.cond([[u.default.isPlainObject,a],[u.default.isArray,e=>u.default.map(l,e)],[u.default.T,u.default.identity]]),f=e(r);if(u.default.has(f,t))throw new Error(`${f} already exist. duplicated property name is not supported.`);return t[f]=l(n),t}),{}))(t);return a(t)})(t):t)),A=x(u.default.camelCase),E=x(u.default.snakeCase),O=u.default.curry(((e,t)=>t(e))),P=u.default.pipe(u.default.isNil,c),g=u.default.curry(((e,t,a)=>{if(u.default.every(u.default.isFunction,[e,t]))return u.default.pipe(e,u.default.equals(!0))(a)?t(a):a;throw new Error("invalid parameter")})),T=u.default.curry(((e,t,a)=>{if(u.default.every(u.default.isFunction,[e,t]))return u.default.pipe(e,u.default.equals(!1))(a)?t(a):a;throw new Error("invalid parameter(s)")})),j=u.default.curry(((e,t)=>u.default.pipe(u.default.includes,O(t),c)(e))),C=u.default.curry(((e,t)=>u.default.pipe(u.default.equals(e),c)(t))),S=u.default.curry(((e,t)=>{if(u.default.isArray(t)){const a=u.default.cloneDeep(t);return a.splice(u.default.toNumber(e),1),a}return t})),k=u.default.concat,B=u.default.curry(((e,t)=>u.default.isArray(t)?u.default.concat(t,e):u.default.concat([t],e))),D=u.default.curry(((e,t)=>u.default.map.convert({cap:!1})(e,t))),I=u.default.curry(((e,t,a)=>u.default.reduce.convert({cap:!1})(e,t,a))),K=e=>u.default.isNil(e)||u.default.isBoolean(e)||u.default.isNumber(e)||u.default.isString(e),W=u.default.pipe(K,c);module.exports={mapAsync:m,filterAsync:v,reduceAsync:w,findAsync:N,forEachAsync:F,promisify:l,then:i,andThen:i,otherwise:d,catch:d,finally:o,isPromise:n,isNotEmpty:s,isNotNil:P,isJson:e=>{const t=u.default.pipe(u.default.attempt,u.default.isError);return u.default.isString(e)&&!t((()=>JSON.parse(e)))},notEquals:C,isNotEqual:C,isVal:K,isPrimitive:K,isRef:W,isReference:W,not:c,notIncludes:j,toBool:e=>u.default.cond([[u.default.equals("true"),u.default.T],[u.default.equals("false"),u.default.F],[u.default.T,e=>!!e]])(e),deepFreeze:q,key:b,keyByVal:b,transformObjectKey:x,toCamelcase:A,toCamelKey:A,toSnakecase:E,toSnakeKey:E,pascalCase:h,isDatetimeString:e=>isNaN(e)&&!isNaN(Date.parse(e)),ap:O,instanceOf:y,ternary:p,ifT:g,ifF:T,removeByIndex:S,removeByIdx:S,removeLast:e=>{const t=u.default.cloneDeep(e);return t.pop(),t},append:k,prepend:B,mapWithKey:D,mapWithIdx:D,reduceWithKey:I,reduceWithIdx:I}}));
//# sourceMappingURL=index.js.map
