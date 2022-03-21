/* eslint-disable no-undef */
module.exports = {
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	rules: {
		'one-var': [2, 'never'],
		'no-empty': ['error', { allowEmptyCatch: true }],
		'prefer-spread': 'off',
		'no-unsafe-finally': 'off',
		'no-prototype-builtins': 'off',
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
		'@typescript-eslint/ban-types': 'off',
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-this-alias': 'off',
		'no-useless-escape': 'off',
		// 'no-unused-vars': ['error', { 'vars': 'local' , 'args': 'after-used' }]
	},
	env: {
		browser: true,
		node: true,
	},
	globals: {
		document: true,
		window: true,
		HTMLElement: true,
	},
};
