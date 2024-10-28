// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    'config.js',
    'node_modules',
    'server/plugin',
    'server/services/CreditLimitESB',
    'erver/helpers/dataFilterHelper',
    'server/helpers/encryptionHelper',
    'server/helpers/responseHelper',
  ],

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',

  // Indicates which provider should be used to instrument code for coverage
  reporters: ['default', 'jest-sonar'],

  // The directory where Jest should output its coverage files
  verbose: true,

  // Automatically reset mock state before every test
  resetMocks: true,

  // Automatically restore mock state and implementation before every test
  restoreMocks: true,

  // Configuration for coverage threshold
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 60,
      functions: 60,
      lines: 60,
    },
  },
};
