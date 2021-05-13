import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import url from '@rollup/plugin-url';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import sourcemaps from 'rollup-plugin-sourcemaps';
import babel from 'rollup-plugin-babel';

// eslint-disable-next-line import/extensions
import pkg from './package.json';
import { terser } from 'rollup-plugin-terser';

const extensions = ['.js'];
const external = ['lodash/fp'];
const globals = { 'lodash/fp': '_' };

export default [
  {
    input: 'lib/index.js',
    output: [
      {
        sourcemap: true,
        file: `dist/${pkg.name}.cjs.js`,
        format: 'cjs',
        globals
      },
      {
        sourcemap: true,
        file: `dist/${pkg.name}.es.js`,
        format: 'esm',
        globals
      },
      {
        sourcemap: true,
        file: pkg.module,
        format: 'umd',
        globals,
        name: pkg.name
      }
    ],
    external,
    plugins: [
      resolve({ extensions }),
      babel({
        extensions,
        runtimeHelpers: true,
        include: ['lib/**/*'],
        exclude: 'node_modules/**'
      }),
      commonjs({ include: 'node_modules/**' }),
      url(),
      peerDepsExternal(),
      sourcemaps(),
      terser()
    ]
  }
];
