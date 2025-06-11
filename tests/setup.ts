import { vi, beforeEach, afterEach } from 'vitest';

// Store original console methods
const originalConsole = {
  error: console.error,
  warn: console.warn,
  log: console.log
};

// Mock console methods to prevent unwanted output during tests
beforeEach(() => {
  // Mock console.error to prevent stderr noise in tests
  console.error = vi.fn();
  
  // Optionally mock other console methods if needed
  // console.warn = vi.fn();
  // console.log = vi.fn();
});

afterEach(() => {
  // Restore original console methods
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.log = originalConsole.log;
});
