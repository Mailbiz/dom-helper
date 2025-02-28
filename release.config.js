module.exports = {
	plugins: [
		'@semantic-release/commit-analyzer',
		'@semantic-release/release-notes-generator',
		'@semantic-release/changelog',
		'@semantic-release/npm',
		'@semantic-release/git',
		'@semantic-release/github',
	],
	branches: [
		'+([0-9])?(.{+([0-9]),x}).x',
		'master',
		'next',
		'next-major',
		{ name: 'beta', prerelease: true },
		{ name: 'alpha', prerelease: true },
	],
};
