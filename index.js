!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t(require("lodash/fp")):"function"==typeof define&&define.amd?define(["lodash/fp"],t):(e="undefined"!=typeof globalThis?globalThis:e||self)["lodash-fp-ex"]=t(e._)}(this,(function(e){"use strict";function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var u=t(e);function a(e,t,u,a,r,n,l){try{var f=e[n](l),i=f.value}catch(e){return void u(e)}f.done?t(i):Promise.resolve(i).then(a,r)}function r(e){return function(){var t=this,u=arguments;return new Promise((function(r,n){var l=e.apply(t,u);function f(e){a(l,r,n,f,i,"next",e)}function i(e){a(l,r,n,f,i,"throw",e)}f(void 0)}))}}const n=e=>u.default.isFunction(u.default.get("then",e))&&u.default.isFunction(u.default.get("catch",e)),l=(e,...t)=>{const a=u.default.cond([[u.default.isFunction,()=>((e,...t)=>new Promise(((u,a)=>{try{u(e(...t))}catch(e){a(e)}})))(e,...t)],[n,u.default.identity],[u.default.T,e=>Promise.resolve(e)]]);return a(e)},f=e=>n(e)?e.then((e=>f(e))):e,i=u.default.curry(((e,t)=>l(t).then(f(e)))),d=u.default.curry(((e,t)=>l(t).catch(f(e)))),c=u.default.curry(((e,t)=>l(t).finally(f(e)))),o=e=>!e,s=u.default.pipe(u.default.isEmpty,o),p=u.default.curry(((e,t,a,r)=>{const n=u.default.curry(((e,t,a,r)=>r?u.default.isFunction(e)?e(a):e:u.default.isFunction(t)?t(a):t));var l;return n(t,a,r,(l=e,u.default.isNil(l)?u.default.identity:l)(r))})),y=u.default.curry(((e,t)=>t instanceof e)),h=u.default.pipe(u.default.camelCase,u.default.upperFirst),m=u.default.curry(function(){var e=r((function*(e,t){const a=u.default.pipe(u.default.flatMapDeep(u.default.pipe(e,l)),function(){var e=r((function*(e){return yield Promise.all(e)}));return function(t){return e.apply(this,arguments)}}());return yield a(t)}));return function(t,u){return e.apply(this,arguments)}}()),v=u.default.curry(function(){var e=r((function*(e,t){const a=u.default.pipe(m(function(){var t=r((function*(t){return!!(yield e(t))&&t}));return function(e){return t.apply(this,arguments)}}()),i(u.default.filter(u.default.pipe(u.default.equals(!1),o))));return yield a(t)}));return function(t,u){return e.apply(this,arguments)}}()),N=u.default.curry(function(){var e=r((function*(e,t){const a=u.default.pipe(m(e),i(u.default.indexOf(!0)),i((e=>u.default.get(`[${e}]`,t))),d(u.default.always(void 0)));return yield a(t)}));return function(t,u){return e.apply(this,arguments)}}()),g=u.default.curry(((e,t,a)=>{const r=Promise.resolve(t);return u.default.reduce(e,r,a)})),b=u.default.curry(function(){var e=r((function*(e,t){const a=[],r=u.default.entries(t);for(const t of r)a.push(yield e(t[1],t[0]));return a}));return function(t,u){return e.apply(this,arguments)}}()),w=u.default.curry(((e,t)=>u.default.pipe(u.default.entries,u.default.find((([e,a])=>u.default.equals(t,a))),u.default.head)(e))),E=e=>u.default.pipe(Object.freeze,u.default.forOwn((e=>J(e)&&!Object.isFrozen(e)?E(e):e)))(e),F=u.default.curry(((e,t)=>u.default.isObject(t)||u.default.isArray(t)?(t=>{const a=t=>u.default.pipe(u.default.entries,u.default.reduce(((t,[r,n])=>{const l=u.default.cond([[u.default.isPlainObject,a],[u.default.isArray,e=>e.map(l)],[u.default.T,e=>e]]),f=e(r);if(u.default.has(f,t))throw new Error(`${f} already exist. duplicated property name is not supported.`);return t[f]=l(n),t}),{}))(t);return a(t)})(t):t)),x=F(u.default.camelCase),O=F(u.default.snakeCase),A=F(h),P=u.default.curry(((e,t)=>t(e))),q=u.default.pipe(u.default.isNil,o),j=u.default.curry(((e,t,a)=>{if(u.default.every(u.default.isFunction,[e,t]))return u.default.pipe(e,u.default.equals(!0))(a)?t(a):a;throw new Error("invalid parameter")})),S=u.default.curry(((e,t,a)=>{if(u.default.every(u.default.isFunction,[e,t]))return u.default.pipe(e,u.default.equals(!1))(a)?t(a):a;throw new Error("invalid parameter(s)")})),T=u.default.curry(((e,t)=>u.default.pipe(u.default.includes,P(t),o)(e))),C=u.default.curry(((e,t)=>u.default.pipe(u.default.equals(e),o)(t))),I=u.default.curry(((e,t)=>{if(u.default.isArray(t)){const a=u.default.cloneDeep(t);return a.splice(u.default.toNumber(e),1),a}return t})),K=u.default.concat,W=u.default.curry(((e,t)=>u.default.isArray(t)?u.default.concat(t,e):u.default.concat([t],e))),k=u.default.curry(((e,t)=>u.default.map.convert({cap:!1})(e,t))),B=u.default.curry(((e,t)=>u.default.forEach.convert({cap:!1})(e,t))),D=u.default.curry(((e,t,a)=>u.default.reduce.convert({cap:!1})(e,t,a))),z=e=>u.default.isNil(e)||u.default.isBoolean(e)||u.default.isNumber(e)||u.default.isString(e),J=u.default.pipe(z,o),R=e=>u.default.isNil(e)||u.default.some(u.default.equals(e),[0,-0,NaN,!1,""]),V=(({curry:e,getOr:t})=>e(((e,t,a)=>{const r=u.default.get(t,a);return u.default.isNil(r)?e:r})))(u.default);return{mapAsync:m,filterAsync:v,reduceAsync:g,findAsync:N,forEachAsync:b,promisify:l,then:i,andThen:i,otherwise:d,catch:d,finally:c,isPromise:n,isNotEmpty:s,isNotNil:q,isJson:e=>{const t=u.default.pipe(u.default.attempt,u.default.isError);return u.default.isString(e)&&!t((()=>JSON.parse(e)))},notEquals:C,isNotEqual:C,isVal:z,isPrimitive:z,isRef:J,isReference:J,not:o,notIncludes:T,toBool:e=>!!e,deepFreeze:E,key:w,keyByVal:w,transformObjectKey:F,toCamelcase:x,toCamelKey:x,toSnakecase:O,toSnakeKey:O,toPascalcase:A,pascalCase:h,isDatetimeString:e=>isNaN(e)&&!isNaN(Date.parse(e)),ap:P,instanceOf:y,ternary:p,ifT:j,ifF:S,removeByIndex:I,removeByIdx:I,removeLast:e=>{const t=u.default.cloneDeep(e);return u.default.isArray(e)&&t.pop(),u.default.isString(e)?t.substring(0,u.default.size(e)-1):t},append:K,prepend:W,mapWithKey:k,mapWithIdx:k,forEachWithKey:B,forEachWithIdx:B,reduceWithKey:D,reduceWithIdx:D,isFalsy:R,isTruthy:e=>!R(e),getOr:V}}));
//# sourceMappingURL=index.js.map
