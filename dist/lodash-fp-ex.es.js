import e from"lodash/fp";function r(e,r,n,t,i,c,o){try{var s=e[c](o),u=s.value}catch(e){return void n(e)}s.done?r(u):Promise.resolve(u).then(t,i)}function n(e){return function(){var n=this,t=arguments;return new Promise((function(i,c){var o=e.apply(n,t);function s(e){r(o,i,c,s,u,"next",e)}function u(e){r(o,i,c,s,u,"throw",e)}s(void 0)}))}}const t=r=>e.isFunction(e.get("then",r))&&e.isFunction(e.get("catch",r)),i=(r,...n)=>e.cond([[e.isFunction,()=>((e,...r)=>new Promise(((n,t)=>{try{n(e(...r))}catch(e){t(e)}})))(r,...n)],[t,e.identity],[e.T,e=>Promise.resolve(e)]])(r),c=e=>t(e)?e.then((e=>c(e))):e,o=e.curry(((e,r)=>i(r).then(c(e)))),s=e.curry(((e,r)=>i(r).catch(c(e)))),u=e.curry(((e,r)=>i(r).finally(c(e)))),a=e=>!e,p=e.pipe(e.isEmpty,a),y=r=>e.cond([[e.equals("true"),e.T],[e.equals("false"),e.F],[e.T,e=>!!e]])(r),l=e.curry(((r,n,t)=>t?e.isFunction(r)?r():r:e.isFunction(n)?n():n)),f=e.curry(((e,r)=>r instanceof e)),d=e.pipe(e.camelCase,e.upperFirst),m=e.curry(function(){var r=n((function*(r,t){return e.pipe(e.flatMapDeep(e.pipe(r,i)),function(){var e=n((function*(e){return Promise.all(e)}));return function(r){return e.apply(this,arguments)}}())(t)}));return function(e,n){return r.apply(this,arguments)}}()),h=e.curry(function(){var r=n((function*(r,t){const i=e.pipe(m(function(){var e=n((function*(e){return!!(yield r(e))&&e}));return function(r){return e.apply(this,arguments)}}()),o(e.filter(e.pipe(e.equals(!1),a))));return yield i(t)}));return function(e,n){return r.apply(this,arguments)}}()),v=e.curry(function(){var r=n((function*(r,n){const t=e.pipe(m(r),o(e.indexOf(!0)),o((r=>e.get(`[${r}]`,n))),s(e.always(void 0)));return yield t(n)}));return function(e,n){return r.apply(this,arguments)}}()),N=e.curry(((r,n,t)=>{const i=Promise.resolve(n);return e.reduce(r,i,t)})),w=e.curry(((r,n)=>e.pipe(e.invert,e.get(n))(r))),F=r=>e.pipe(Object.freeze,e.forOwn((e=>I(e)&&!Object.isFrozen(e)?F(e):e)))(r),O=e.curry(((r,n)=>e.isObject(n)||e.isArray(n)?(n=>{const t=n=>e.pipe(e.entries,e.reduce(((n,[i,c])=>{const o=e.cond([[e.isPlainObject,t],[e.isArray,r=>e.map(o,r)],[e.T,e.identity]]),s=r(i);if(e.has(s,n))throw new Error(`${s} already exist. duplicated property name is not supported.`);return n[s]=o(c),n}),{}))(n);return t(n)})(n):n)),P=O(e.camelCase),x=O(e.snakeCase),A=e.curry(((e,r)=>r(e))),E=e.pipe(e.isNil,a),b=e.curry(((r,n,t)=>{if(e.every(e.isFunction,[r,n]))return e.pipe(r,y)(t)?n(t):t;throw new Error("invalid parameter")})),g=e.curry(((r,n,t)=>{if(e.every(e.isFunction,[r,n]))return e.pipe(r,y)(t)?t:n(t);throw new Error("invalid parameter(s)")})),q=e.curry(((r,n)=>e.pipe(e.includes,A(n),a)(r))),C=e.curry(((r,n)=>e.pipe(e.equals(r),a)(n))),S=e.curry(((r,n)=>{if(e.isArray(n)){const t=e.cloneDeep(n);return t.splice(e.toNumber(r),1),t}return n})),T=e.concat,j=e.curry(((r,n)=>e.isArray(n)?e.concat(n,r):e.concat([n],r))),k=e.curry(((r,n)=>e.map.convert({cap:!1})(r,n))),B=e.curry(((r,n,t)=>e.reduce.convert({cap:!1})(r,n,t))),D=r=>e.isNil(r)||e.isBoolean(r)||e.isNumber(r)||e.isString(r),I=e.pipe(D,a);module.exports={mapAsync:m,filterAsync:h,reduceAsync:N,findAsync:v,promisify:i,then:o,andThen:o,otherwise:s,finally:u,isPromise:t,isNotEmpty:p,isNotNil:E,isJson:r=>{const n=e.pipe(e.attempt,e.isError);return e.isString(r)&&!n((()=>JSON.parse(r)))},notEquals:C,isNotEqual:C,isVal:D,isPrimitive:D,isRef:I,isReference:I,not:a,notIncludes:q,toBool:y,deepFreeze:F,key:w,keyByVal:w,transformObjectKey:O,toCamelcase:P,toCamelKey:P,toSnakecase:x,toSnakeKey:x,pascalCase:d,isDatetimeString:e=>isNaN(e)&&!isNaN(Date.parse(e)),ap:A,instanceOf:f,ternary:l,ifT:b,ifF:g,removeByIndex:S,removeByIdx:S,removeLast:r=>{const n=e.cloneDeep(r);return n.pop(),n},append:T,prepend:j,mapWithKey:k,mapWithIdx:k,reduceWithKey:B,reduceWithIdx:B};
//# sourceMappingURL=lodash-fp-ex.es.js.map
