import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.{test,spec}.ts'],
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
    setupFiles: ['./tests/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'tests/__fixtures.ts',
        'src/main.ts',
        'src/**/index.ts'
      ],
      thresholds: {
        lines: 95,
        functions: 90,
        branches: 90,
        statements: 95,
      },
    },
  },
});
