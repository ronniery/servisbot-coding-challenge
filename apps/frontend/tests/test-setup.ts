import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { EventEmitter } from 'node:events';

EventEmitter.setMaxListeners(40);

const originalError = console.error;
console.error = (...args) => {
  // We are silencing it because this is not so important for us right now
  if (/was not wrapped in act/.test(args[0])) {
    return;
  }

  originalError.call(console, ...args);
};

afterEach(() => {
  cleanup();
});
