!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(require("lodash/fp")):"function"==typeof define&&define.amd?define(["lodash/fp"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self)._)}(this,(function(e){"use strict";function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var u=t(e);function a(e,t,u,a,r,l,n){try{var f=e[l](n),d=f.value}catch(e){return void u(e)}f.done?t(d):Promise.resolve(d).then(a,r)}function r(e){return function(){var t=this,u=arguments;return new Promise((function(r,l){var n=e.apply(t,u);function f(e){a(n,r,l,f,d,"next",e)}function d(e){a(n,r,l,f,d,"throw",e)}f(void 0)}))}}const l=e=>u.default.isFunction(u.default.get("then",e))&&u.default.isFunction(u.default.get("catch",e)),n=u.default.cond([[u.default.isFunction,(e,...t)=>((e,...t)=>new Promise(((a,r)=>e(...t,((e,t)=>u.default.isNil(e)?a(t):r(e))))))(e,...t)],[l,u.default.identity],[u.default.T,e=>Promise.resolve(e)]]),f=e=>l(e)?e.then((e=>f(e))):e,d=u.default.curry(((e,t)=>n(t).then(f(e)))),i=u.default.curry(((e,t)=>n(t).catch(f(e)))),c=u.default.curry(((e,t)=>n(t).finally(f(e)))),o=e=>!e,s=u.default.pipe(u.default.isEmpty,o),p=e=>u.default.cond([[u.default.equals("true"),u.default.T],[u.default.equals("false"),u.default.F],[u.default.T,e=>!!e]])(e),y=u.default.curry(((e,t,a)=>a?u.default.isFunction(e)?e():e:u.default.isFunction(t)?t():t)),m=u.default.curry(((e,t)=>t instanceof e)),h=u.default.pipe(u.default.camelCase,u.default.upperFirst),v=u.default.curry(function(){var e=r((function*(e,t){return yield Promise.all(u.default.flatMapDeep(e,t))}));return function(t,u){return e.apply(this,arguments)}}()),F=u.default.curry(function(){var e=r((function*(e,t){return yield Promise.all(u.default.filter(e,t))}));return function(t,u){return e.apply(this,arguments)}}()),w=u.default.curry(function(){var e=r((function*(e,t){const a=u.default.pipe(v(e),d(u.default.indexOf(!0)),d((e=>u.default.get(`[${e}]`,t))),i(u.default.always(void 0)));return yield a(t)}));return function(t,u){return e.apply(this,arguments)}}()),N=u.default.curry(((e,t,a)=>{const r=Promise.resolve(t);return u.default.reduce(e,r,a)})),P=u.default.curry(((e,t)=>u.default.pipe(u.default.invert,u.default.get(e))(t))),b=e=>u.default.pipe(Object.freeze,u.default.forOwn((e=>!u.default.isPlainObject(e)&&!u.default.isFunction(e)||Object.isFrozen(e)?e:b(e))))(e),O=u.default.curry(((e,t)=>u.default.isObject(t)||u.default.isArray(t)?(t=>{const a=t=>u.default.pipe(u.default.entries,u.default.reduce(((t,[r,l])=>{const n=u.default.cond([[u.default.isPlainObject,a],[u.default.isArray,e=>u.default.map(n,e)],[u.default.T,u.default.identity]]);return t[e(r)]=n(l),t}),{}))(t);return a(t)})(t):t)),g=O(u.default.camelCase),A=O(u.default.snakeCase),j=u.default.curry(((e,t)=>t(e))),T=u.default.pipe(u.default.isNil,o),E=u.default.curry(((e,t,a)=>{if(u.default.every(u.default.isFunction,[e,t]))return u.default.pipe(e,p)(a)?t(a):a;throw new Error("invalid parameter(s)")})),q=u.default.curry(((e,t,a)=>{if(u.default.every(u.default.isFunction,[e,t]))return u.default.pipe(e,p)(a)?a:t(a);throw new Error("invalid parameter(s)")})),x=u.default.curry(((e,t)=>u.default.pipe(u.default.includes,j(t),o)(e))),C=u.default.curry(((e,t)=>u.default.pipe(u.default.equals(e),u.default.not)(t))),D=u.default.curry(((e,t)=>u.default.isArray(t)?(t.splice(e,1),u.default.cloneDeep(t)):t)),S=u.default.concat,k=u.default.curry(((e,t)=>u.default.isArray(t)?u.default.concat(t,e):u.default.concat([t],e))),z=u.default.map.convert({cap:!1}),B=u.default.reduce.convert({cap:!1});module.exports={mapAsync:v,filterAsync:F,reduceAsync:N,findAsync:w,promisify:n,then:d,otherwise:i,finally:c,isPromise:l,isNotEmpty:s,isNotNil:T,isJson:e=>{const t=u.default.pipe(u.default.attempt,u.default.isError);return u.default.isString(e)&&!t((()=>JSON.parse(e)))},notEquals:C,not:o,notIncludes:x,toBool:p,deepFreeze:b,key:P,pascalCase:h,toCamelcase:g,toSnakecase:A,isDateString:e=>isNaN(e)&&!isNaN(Date.parse(e)),ap:j,instanceOf:m,ternary:y,ifT:E,ifF:q,removeByIndex:D,removeLast:e=>{const t=u.default.cloneDeep(e);return t.pop(),t},append:S,prepend:k,mapWithKey:z,reduceWithKey:B}}));
//# sourceMappingURL=index.js.map
