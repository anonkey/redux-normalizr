module.exports = {
  verbose: true,
  automock: false,
  bail: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  notify: true,
  notifyMode: 'failure',
  // transform: {
  //   '^.+\\.jsx?$': 'babel-jest',
  // },
  projects: [
    {
      displayName: 'Unit tests',
    },
    {
      displayName: 'lint',
      runner: 'jest-runner-eslint',
      testMatch: ['<rootDir>/index.js'],
    },
  ],
};
