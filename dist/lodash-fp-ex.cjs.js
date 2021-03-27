"use strict";function e(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var t=e(require("lodash/fp"));function u(e,t,u,a,r,n,l){try{var f=e[n](l),i=f.value}catch(e){return void u(e)}f.done?t(i):Promise.resolve(i).then(a,r)}function a(e){return function(){var t=this,a=arguments;return new Promise((function(r,n){var l=e.apply(t,a);function f(e){u(l,r,n,f,i,"next",e)}function i(e){u(l,r,n,f,i,"throw",e)}f(void 0)}))}}const r=e=>t.default.isFunction(t.default.get("then",e))&&t.default.isFunction(t.default.get("catch",e)),n=(e,...u)=>t.default.cond([[t.default.isFunction,()=>((e,...t)=>new Promise(((u,a)=>{try{u(e(...t))}catch(e){a(e)}})))(e,...u)],[r,t.default.identity],[t.default.T,e=>Promise.resolve(e)]])(e),l=e=>r(e)?e.then((e=>l(e))):e,f=t.default.curry(((e,t)=>n(t).then(l(e)))),i=t.default.curry(((e,t)=>n(t).catch(l(e)))),d=t.default.curry(((e,t)=>n(t).finally(l(e)))),c=e=>!e,o=t.default.pipe(t.default.isEmpty,c),s=t.default.curry(((e,u,a,r)=>{var n;return t.default.curry(((e,u,a,r)=>r?t.default.isFunction(e)?e(a):e:t.default.isFunction(u)?u(a):u))(u,a,r,(n=e,t.default.isNil(n)?t.default.identity:n)(r))})),p=t.default.curry(((e,t)=>t instanceof e)),y=t.default.pipe(t.default.camelCase,t.default.upperFirst),m=t.default.curry(function(){var e=a((function*(e,u){const r=t.default.pipe(t.default.flatMapDeep(t.default.pipe(e,n)),function(){var e=a((function*(e){return yield Promise.all(e)}));return function(t){return e.apply(this,arguments)}}());return yield r(u)}));return function(t,u){return e.apply(this,arguments)}}()),h=t.default.curry(function(){var e=a((function*(e,u){const r=t.default.pipe(m(function(){var t=a((function*(t){return!!(yield e(t))&&t}));return function(e){return t.apply(this,arguments)}}()),f(t.default.filter(t.default.pipe(t.default.equals(!1),c))));return yield r(u)}));return function(t,u){return e.apply(this,arguments)}}()),v=t.default.curry(function(){var e=a((function*(e,u){const a=t.default.pipe(m(e),f(t.default.indexOf(!0)),f((e=>t.default.get(`[${e}]`,u))),i(t.default.always(void 0)));return yield a(u)}));return function(t,u){return e.apply(this,arguments)}}()),N=t.default.curry(((e,u,a)=>{const r=Promise.resolve(u);return t.default.reduce(e,r,a)})),w=t.default.curry(function(){var e=a((function*(e,u){const a=[],r=t.default.entries(u);for(const t of r)a.push(yield e(t[1],t[0]));return a}));return function(t,u){return e.apply(this,arguments)}}()),F=t.default.curry(((e,u)=>t.default.pipe(t.default.invert,t.default.get(u))(e))),q=e=>t.default.pipe(Object.freeze,t.default.forOwn((e=>K(e)&&!Object.isFrozen(e)?q(e):e)))(e),A=t.default.curry(((e,u)=>t.default.isObject(u)||t.default.isArray(u)?(u=>{const a=u=>t.default.pipe(t.default.entries,t.default.reduce(((u,[r,n])=>{const l=t.default.cond([[t.default.isPlainObject,a],[t.default.isArray,e=>t.default.map(l,e)],[t.default.T,t.default.identity]]),f=e(r);if(t.default.has(f,u))throw new Error(`${f} already exist. duplicated property name is not supported.`);return u[f]=l(n),u}),{}))(u);return a(u)})(u):u)),E=A(t.default.camelCase),O=A(t.default.snakeCase),P=t.default.curry(((e,t)=>t(e))),b=t.default.pipe(t.default.isNil,c),x=t.default.curry(((e,u,a)=>{if(t.default.every(t.default.isFunction,[e,u]))return t.default.pipe(e,t.default.equals(!0))(a)?u(a):a;throw new Error("invalid parameter")})),g=t.default.curry(((e,u,a)=>{if(t.default.every(t.default.isFunction,[e,u]))return t.default.pipe(e,t.default.equals(!1))(a)?u(a):a;throw new Error("invalid parameter(s)")})),j=t.default.curry(((e,u)=>t.default.pipe(t.default.includes,P(u),c)(e))),C=t.default.curry(((e,u)=>t.default.pipe(t.default.equals(e),c)(u))),S=t.default.curry(((e,u)=>{if(t.default.isArray(u)){const a=t.default.cloneDeep(u);return a.splice(t.default.toNumber(e),1),a}return u})),T=t.default.concat,k=t.default.curry(((e,u)=>t.default.isArray(u)?t.default.concat(u,e):t.default.concat([u],e))),B=t.default.curry(((e,u)=>t.default.map.convert({cap:!1})(e,u))),D=t.default.curry(((e,u,a)=>t.default.reduce.convert({cap:!1})(e,u,a))),I=e=>t.default.isNil(e)||t.default.isBoolean(e)||t.default.isNumber(e)||t.default.isString(e),K=t.default.pipe(I,c);module.exports={mapAsync:m,filterAsync:h,reduceAsync:N,findAsync:v,forEachAsync:w,promisify:n,then:f,andThen:f,otherwise:i,finally:d,isPromise:r,isNotEmpty:o,isNotNil:b,isJson:e=>{const u=t.default.pipe(t.default.attempt,t.default.isError);return t.default.isString(e)&&!u((()=>JSON.parse(e)))},notEquals:C,isNotEqual:C,isVal:I,isPrimitive:I,isRef:K,isReference:K,not:c,notIncludes:j,toBool:e=>t.default.cond([[t.default.equals("true"),t.default.T],[t.default.equals("false"),t.default.F],[t.default.T,e=>!!e]])(e),deepFreeze:q,key:F,keyByVal:F,transformObjectKey:A,toCamelcase:E,toCamelKey:E,toSnakecase:O,toSnakeKey:O,pascalCase:y,isDatetimeString:e=>isNaN(e)&&!isNaN(Date.parse(e)),ap:P,instanceOf:p,ternary:s,ifT:x,ifF:g,removeByIndex:S,removeByIdx:S,removeLast:e=>{const u=t.default.cloneDeep(e);return u.pop(),u},append:T,prepend:k,mapWithKey:B,mapWithIdx:B,reduceWithKey:D,reduceWithIdx:D};
//# sourceMappingURL=lodash-fp-ex.cjs.js.map
