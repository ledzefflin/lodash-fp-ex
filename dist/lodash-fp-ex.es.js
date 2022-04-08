import r from"lodash/fp";function e(r,e,n,t,i,c,s){try{var o=r[c](s),a=o.value}catch(r){return void n(r)}o.done?e(a):Promise.resolve(a).then(t,i)}function n(r){return function(){var n=this,t=arguments;return new Promise((function(i,c){var s=r.apply(n,t);function o(r){e(s,i,c,o,a,"next",r)}function a(r){e(s,i,c,o,a,"throw",r)}o(void 0)}))}}const t=e=>r.isFunction(r.get("then",e))&&r.isFunction(r.get("catch",e)),i=(e,...n)=>r.cond([[r.isFunction,()=>((r,...e)=>new Promise(((n,t)=>{try{n(r(...e))}catch(r){t(r)}})))(e,...n)],[t,r.identity],[r.T,r=>Promise.resolve(r)]])(e),c=r=>t(r)?r.then((r=>c(r))):r,s=r.curry(((r,e)=>i(e).then(c(r)))),o=r.curry(((r,e)=>i(e).catch(c(r)))),a=r.curry(((r,e)=>i(e).finally(c(r)))),u=r=>!r,p=r.pipe(r.isEmpty,u),y=r.curry(((e,n,t,i)=>{var c;return r.curry(((e,n,t,i)=>i?r.isFunction(e)?e(t):e:r.isFunction(n)?n(t):n))(n,t,i,(c=e,r.isNil(c)?r.identity:c)(i))})),l=r.curry(((r,e)=>e instanceof r)),f=r.pipe(r.camelCase,r.upperFirst),d=r.curry(function(){var e=n((function*(e,t){const c=r.pipe(r.flatMapDeep(r.pipe(e,i)),function(){var r=n((function*(r){return yield Promise.all(r)}));return function(e){return r.apply(this,arguments)}}());return yield c(t)}));return function(r,n){return e.apply(this,arguments)}}()),h=r.curry(function(){var e=n((function*(e,t){const i=r.pipe(d(function(){var r=n((function*(r){return!!(yield e(r))&&r}));return function(e){return r.apply(this,arguments)}}()),s(r.filter(r.pipe(r.equals(!1),u))));return yield i(t)}));return function(r,n){return e.apply(this,arguments)}}()),m=r.curry(function(){var e=n((function*(e,n){const t=r.pipe(d(e),s(r.indexOf(!0)),s((e=>r.get(`[${e}]`,n))),o(r.always(void 0)));return yield t(n)}));return function(r,n){return e.apply(this,arguments)}}()),v=r.curry(((e,n,t)=>{const i=Promise.resolve(n);return r.reduce(e,i,t)})),N=r.curry(function(){var e=n((function*(e,n){const t=[],i=r.entries(n);for(const r of i)t.push(yield e(r[1],r[0]));return t}));return function(r,n){return e.apply(this,arguments)}}()),F=r.curry(((e,n)=>r.pipe(r.entries,r.find((([e,t])=>r.equals(n,t))),r.head)(e))),w=e=>r.pipe(Object.freeze,r.forOwn((r=>D(r)&&!Object.isFrozen(r)?w(r):r)))(e),E=r.curry(((e,n)=>r.isObject(n)||r.isArray(n)?(n=>{const t=n=>r.pipe(r.entries,r.reduce(((n,[i,c])=>{const s=r.cond([[r.isPlainObject,t],[r.isArray,r=>r.map(s)],[r.T,r=>r]]),o=e(i);if(r.has(o,n))throw new Error(`${o} already exist. duplicated property name is not supported.`);return n[o]=s(c),n}),{}))(n);return t(n)})(n):n)),g=E(r.camelCase),O=E(r.snakeCase),q=E(f),A=r.curry(((r,e)=>e(r))),P=r.pipe(r.isNil,u),x=r.curry(((e,n,t)=>{if(r.every(r.isFunction,[e,n]))return r.pipe(e,r.equals(!0))(t)?n(t):t;throw new Error("invalid parameter")})),b=r.curry(((e,n,t)=>{if(r.every(r.isFunction,[e,n]))return r.pipe(e,r.equals(!1))(t)?n(t):t;throw new Error("invalid parameter(s)")})),S=r.curry(((e,n)=>r.pipe(r.includes,A(n),u)(e))),T=r.curry(((e,n)=>r.pipe(r.equals(e),u)(n))),C=r.curry(((e,n)=>{if(r.isArray(n)){const t=r.cloneDeep(n);return t.splice(r.toNumber(e),1),t}return n})),I=r.concat,K=r.curry(((e,n)=>r.isArray(n)?r.concat(n,e):r.concat([n],e))),W=r.curry(((e,n)=>r.map.convert({cap:!1})(e,n))),j=r.curry(((e,n)=>r.forEach.convert({cap:!1})(e,n))),k=r.curry(((e,n,t)=>r.reduce.convert({cap:!1})(e,n,t))),B=e=>r.isNil(e)||r.isBoolean(e)||r.isNumber(e)||r.isString(e),D=r.pipe(B,u),z=e=>r.isNil(e)||r.some(r.equals(e),[0,-0,NaN,!1,""]),J=(({curry:e,getOr:n})=>e(((e,n,t)=>{const i=r.get(n,t);return r.isNil(i)?e:i})))(r);var R={mapAsync:d,filterAsync:h,reduceAsync:v,findAsync:m,forEachAsync:N,promisify:i,then:s,andThen:s,otherwise:o,catch:o,finally:a,isPromise:t,isNotEmpty:p,isNotNil:P,isJson:e=>{const n=r.pipe(r.attempt,r.isError);return r.isString(e)&&!n((()=>JSON.parse(e)))},notEquals:T,isNotEqual:T,isVal:B,isPrimitive:B,isRef:D,isReference:D,not:u,notIncludes:S,toBool:e=>r.cond([[r.equals("true"),r.T],[r.equals("false"),r.F],[r.T,r=>!!r]])(e),deepFreeze:w,key:F,keyByVal:F,transformObjectKey:E,toCamelcase:g,toCamelKey:g,toSnakecase:O,toSnakeKey:O,toPascalcase:q,pascalCase:f,isDatetimeString:r=>isNaN(r)&&!isNaN(Date.parse(r)),ap:A,instanceOf:l,ternary:y,ifT:x,ifF:b,removeByIndex:C,removeByIdx:C,removeLast:e=>{const n=r.cloneDeep(e);return r.isArray(e)&&n.pop(),r.isString(e)?n.substring(0,r.size(e)-1):n},append:I,prepend:K,mapWithKey:W,mapWithIdx:W,forEachWithKey:j,forEachWithIdx:j,reduceWithKey:k,reduceWithIdx:k,isFalsy:z,isTruthy:r=>!z(r),getOr:J};export{R as default};
//# sourceMappingURL=lodash-fp-ex.es.js.map
