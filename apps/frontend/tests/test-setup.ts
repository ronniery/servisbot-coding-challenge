import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { EventEmitter } from 'node:events';

EventEmitter.setMaxListeners(40);

afterEach(() => {
  cleanup();
});
