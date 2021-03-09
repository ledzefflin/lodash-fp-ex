import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import url from '@rollup/plugin-url';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import sourcemaps from 'rollup-plugin-sourcemaps';
import babel from 'rollup-plugin-babel';

// eslint-disable-next-line import/extensions
import pkg from './package.json';
import { terser } from 'rollup-plugin-terser';

const input = 'lib/index.js';
const extensions = ['.js'];
const globals = { 'lodash/fp': '_' };
const external = ['lodash/fp'];

export default [
	{
		input,
		output: [
			{
				sourcemap: true,
				file: `dist/${pkg.name}.cjs.js`,
				format: 'cjs'
			},
			{
				sourcemap: true,
				file: `dist/${pkg.name}.es.js`,
				format: 'esm'
			},
			{
				sourcemap: true,
				file: pkg.main,
				format: 'umd',
				name: pkg.name,
				globals
			}
		],
		external,
		plugins: [
			resolve({ extensions }),
      babel({
        extensions,
        runtimeHelpers: true,
        include: ['lib/**/*'],
				exclude: 'node_modules/**',
			}),
			commonjs({ include: 'node_modules/**' }),
			url(),
			peerDepsExternal(),
      sourcemaps(),
      terser()
		]
	}
];