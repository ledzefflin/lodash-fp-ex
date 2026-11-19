const mod = process.argv[2] ?? new URL('../dist/index.cjs', import.meta.url).pathname;
import { createRequire } from 'node:module';
const f = createRequire(import.meta.url)(mod);
import { performance } from 'node:perf_hooks';

const run = async (name, fn, iters) => {
  for (let i = 0; i < Math.min(iters, 2000); i++) await fn();
  const t = performance.now();
  for (let i = 0; i < iters; i++) await fn();
  const dt = performance.now() - t;
  console.log(`${name.padEnd(34)} ${((dt / iters) * 1000).toFixed(2).padStart(10)} µs/op`);
};

const arr100 = Array.from({ length: 100 }, (_, i) => i);
const obj100 = Object.fromEntries(arr100.map((i) => [`key_${i}`, i]));
const nested = { a_b: { c_d: [{ e_f: 1 }, { g_h: 2 }], i_j: 3 }, k_l: 'x' };
const big = Object.fromEntries(arr100.map((i) => [`snake_key_${i}`, { in_ner: i }]));
const json = '{"a":1,"b":[1,2,3]}';

await run('isJson', () => f.isJson(json), 200000);
await run('isVal / isRef', () => (f.isVal(1), f.isRef({})), 200000);
await run('isNotEmpty', () => f.isNotEmpty(arr100), 200000);
await run('isFalsy', () => f.isFalsy('x'), 200000);
await run('notEquals', () => f.notEquals({ a: 1 }, { a: 1 }), 100000);
await run('promisify(value)', () => f.promisify(1), 100000);
await run('mapAsync(100)', () => f.mapAsync((v) => v, arr100), 3000);
await run('filterAsync(100)', () => f.filterAsync((v) => v % 2 === 0, arr100), 3000);
await run('findAsync(100)', () => f.findAsync((v) => v === 50, arr100), 3000);
await run('reduceAsync(100)', () => f.reduceAsync((a, v) => a + v, 0, arr100), 3000);
await run('forEachAsync(100)', () => f.forEachAsync((v) => v, arr100), 3000);
await run('mapWithKey(100)', () => f.mapWithKey((v, k) => k, arr100), 20000);
await run('reduceWithKey(100)', () => f.reduceWithKey((a, v, k) => a + k, 0, arr100), 20000);
await run('forEachWithKey(100)', () => f.forEachWithKey((v, k) => {}, arr100), 20000);
await run('deepFreeze(nested)', () => f.deepFreeze(structuredClone(nested)), 20000);
await run('toCamelcase(nested)', () => f.toCamelcase(nested), 20000);
await run('toCamelcase(100 keys)', () => f.toCamelcase(big), 500);
await run('removeByIndex(100)', () => f.removeByIndex(50, arr100), 20000);
await run('removeLast(100)', () => f.removeLast(arr100), 20000);
await run('getOr', () => f.getOr(0, 'a.b', { a: { b: 1 } }), 200000);
await run('key(obj100)', () => f.key(obj100, 99), 20000);
await run('prepend', () => f.prepend(arr100, 1), 50000);
await run('notIncludes', () => f.notIncludes(99, arr100), 100000);
