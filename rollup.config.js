import { nodeResolve } from '@rollup/plugin-node-resolve';
import ts from 'rollup-plugin-ts'; // Prefered over @rollup/plugin-typescript as it bundles .d.ts files
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import { terser } from 'rollup-plugin-terser';
import cleanup from 'rollup-plugin-cleanup';
import sizes from 'rollup-plugin-sizes';
import filesize from 'rollup-plugin-filesize';
import pkg from './package.json';

const plugins = [
	json(),
	nodeResolve({ browser: true }),
	commonjs(),
	ts({ tsconfig: './tsconfig.json' }),
	compiler(),
	terser(),
	cleanup({ comments: 'none' }),
	sizes(),
	filesize({ showMinifiedSize: false, showBeforeSizes: 'build' }),
];

const integrationPlugins = [
	json(),
	nodeResolve({ browser: true }),
	commonjs(),
	ts({ tsconfig: './tsconfig.json' }),
	compiler(),
	terser(),
	cleanup({ comments: 'none' }),
	sizes(),
	filesize({ showMinifiedSize: false, showBeforeSizes: 'build' }),
];

export default [
	{
		input: './src/index.ts',
		plugins: plugins,
		treeshake: { moduleSideEffects: [] },
		output: [{ file: pkg.browser, format: 'iife', sourcemap: false }],
	},

	{
		input: './src/integration.ts',
		plugins: integrationPlugins,
		// treeshake: { moduleSideEffects: [] },
		output: [{ file: 'dist/integration.min.js', format: 'iife', sourcemap: false }],
	},
];
