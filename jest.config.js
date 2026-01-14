module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  projects: [
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/__tests__/unit/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/src/**/*.test.{js,jsx,ts,tsx}',
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
    {
      displayName: 'jsdom',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/__tests__/integration/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/components/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/app/**/*.test.{js,jsx,ts,tsx}',
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js', '@testing-library/jest-native/extend-expect'],
      transformIgnorePatterns: [
        'node_modules/(?!(react-native|@react-native|expo|@expo|@unimodules|unimodules|sentry-expo|native-base|react-clone-referenced-element|@react-native-community|react-navigation|@react-navigation/.*|@unimodules/.*|react-native-svg|react-native-screens)/)',
      ],
    },
  ],
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.(test|spec).{js,jsx,ts,tsx}'
  ],
  // Exclude problematic React Native tests for now
  testPathIgnorePatterns: [
    '/node_modules/',
    '__tests__/disabled/',
  ],
  collectCoverageFrom: [
    'hooks/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'src/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/jest.setup.js',
    '!**/jest.config.js',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testTimeout: 10000,
};