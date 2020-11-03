const { pathsToModuleNameMapper } = require('ts-jest/utils')
const { compilerOptions } = require('./tsconfig')

module.exports = {
  roots: ['<rootDir>/Tasks', '<rootDir>/Tests'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  collectCoverage: true,
  coverageDirectory: './coverage/',
  collectCoverageFrom: [
    './Tasks/**/*.ts',
    '!**/*.d.ts',
    // Some of these files need to be ignored since it's a copy from common folder
    // and have been tested once
    '!./Tasks/DigitalOceanSpacesUpload/common/utils/filterFiles.ts',
    '!./Tasks/DigitalOceanSpacesDownload/common/utils/filterFiles.ts',
  ],
}
