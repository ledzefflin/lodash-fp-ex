import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';
const require = createRequire(import.meta.url);
const cloneDeep = require('lodash/cloneDeep');

// 순수 데이터(plain object / array / primitive / Date) 전용 직접 구현
const isArr = Array.isArray;
const clonePlain = (v) => {
  if (v === null || typeof v !== 'object') return v;
  if (isArr(v)) {
    const out = new Array(v.length);
    for (let i = 0; i < v.length; i++) out[i] = clonePlain(v[i]);
    return out;
  }
  if (v instanceof Date) return new Date(v.getTime());
  const out = {};
  for (const k in v) if (Object.hasOwn(v, k)) out[k] = clonePlain(v[k]);
  return out;
};
const json = (v) => JSON.parse(JSON.stringify(v));
const shallow = (v) => v.slice();

const make = (n, depth) => (depth === 0 ? n : { id: n, name: `n${n}`, tags: ['a', 'b', 'c'], at: new Date(0), child: make(n, depth - 1) });
const sets = {
  'numbers[100]': Array.from({ length: 100 }, (_, i) => i),
  'objects[100] (depth 2)': Array.from({ length: 100 }, (_, i) => make(i, 2)),
  'objects[1000] (depth 3)': Array.from({ length: 1000 }, (_, i) => make(i, 3)),
};
const impls = { lodash_cloneDeep: cloneDeep, structuredClone, clonePlain, 'JSON(참고)': json, 'shallow slice': shallow };

const bench = (fn, data, ms = 300) => {
  for (let i = 0; i < 50; i++) fn(data);
  let n = 0; const t = performance.now();
  while (performance.now() - t < ms) { fn(data); n++; }
  return ((performance.now() - t) / n) * 1000;
};
for (const [dn, data] of Object.entries(sets)) {
  console.log(`\n## ${dn}`);
  for (const [name, fn] of Object.entries(impls)) {
    try { console.log(name.padEnd(18), bench(fn, data).toFixed(1).padStart(10), 'µs'); } catch (e) { console.log(name.padEnd(18), 'ERR', e.message); }
  }
}
// 의미 차이
console.log('\n## 의미 차이');
const fnObj = { f() {}, d: new Date(0), m: new Map([[1, 2]]), u: undefined, n: NaN };
const cyc = {}; cyc.self = cyc;
for (const [name, fn] of Object.entries(impls)) {
  if (name === 'shallow slice') continue;
  const r = (() => { try { const c = fn(fnObj); return `fn:${typeof c.f} date:${c.d instanceof Date} map:${c.m instanceof Map} undef:${'u' in c} nan:${Number.isNaN(c.n)}`; } catch (e) { return 'throws: ' + e.name; } })();
  const cy = (() => { try { fn(cyc); return 'ok'; } catch (e) { return 'throws: ' + e.constructor.name; } })();
  console.log(name.padEnd(18), r, '| 순환참조:', cy);
}
