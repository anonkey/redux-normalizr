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
  // projects: [
  //   {
  //     displayName: 'test',
  //   },
  //   {
  //     displayName: 'lint',
  //     runner: 'jest-runner-eslint',
  //     testMatch: ['<rootDir>/!(coverage|__tests__)/**/*.js'],
  //   },
  // ],
};
