module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Files to test
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx}',
    '<rootDir>/tests/**/*.{test,spec}.{js,jsx}'
  ],
  
  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.d.ts',
    '!src/main.js', // Entry point
    '!**/node_modules/**',
    '!**/*.config.js'
  ],
  
  // Coverage thresholds for v1 launch
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Module name mapping for assets
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/tests/__mocks__/fileMock.js'
  },
  
  // Transform files
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true
}; 