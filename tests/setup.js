// Jest setup file for Slate Dashboard tests
require('@testing-library/jest-dom');

// Mock console methods in tests to avoid noise
global.console = {
  ...console,
  // Keep these methods for debugging
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch for API calls
global.fetch = jest.fn();

// Add custom matchers for widget testing
expect.extend({
  toHaveValidWidgetStructure(received) {
    const pass = received && 
                  typeof received.render === 'function' && 
                  typeof received.init === 'function';
    
    if (pass) {
      return {
        message: () => `expected widget not to have valid structure`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected widget to have init and render methods`,
        pass: false,
      };
    }
  },
});

// Set up DOM for testing
beforeEach(() => {
  document.body.innerHTML = '';
  jest.clearAllMocks();
}); 