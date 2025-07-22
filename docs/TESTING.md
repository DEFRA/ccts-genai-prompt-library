# Testing with Vitest

## Strict Unit Test Policy

**All unit tests in this project must strictly follow the existing Vitest-based approach.**

- Only [Vitest](https://vitest.dev/) is allowed as the test runner and assertion library.
- All tests must use the `describe`/`it`/`expect`/`vi` API from Vitest.
- Tests must be colocated with their implementation files and use `.test.ts` or `.test.tsx` extensions.
- Use [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) for React component testing and [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) for DOM assertions.
- Follow the Arrange-Act-Assert pattern and keep tests isolated and independent.
- Do not introduce alternative test frameworks, assertion libraries, or patterns.

> **Note:** This policy is enforced to ensure consistency and maintainability. Copilot and all contributors must adhere to this pattern for all new and updated tests.

This project uses [Vitest](https://vitest.dev/) for all testing. Vitest is a Vite-native test runner that offers faster performance and a more integrated experience with the rest of the tooling.

## Running Tests

- `npm run test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with the Vitest UI
- `npm run test:coverage` - Generate test coverage report
- `npm run test:update` - Update snapshots

## Writing Tests

Tests are located alongside the corresponding source files with `.test.ts` or `.test.tsx` extensions.

Example:

```typescript
// Button.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders with the correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

## Test Utilities

- `@testing-library/react` - For rendering and interacting with React components
- `@testing-library/jest-dom` - For DOM-based assertions
- `vi` - Vitest's API for mocks, spies, and timers

## Best Practices

1. Co-locate tests with implementation files
2. Use descriptive test names that explain the expected behavior
3. Follow the Arrange-Act-Assert pattern
4. Keep tests isolated and independent
5. Aim for high test coverage, especially for critical paths
