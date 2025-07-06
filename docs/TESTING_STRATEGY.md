# Testing Strategy Recommendations

## Strict Adherence to Unit Test Pattern

All new and updated unit tests must strictly follow the existing implementation pattern:

- Use only Vitest for all test files and assertions.
- Place tests in `__tests__` folders for components or next to utility files.
- Name test files as `[filename].test.ts` or `[filename].test.tsx`.
- Use the Arrange-Act-Assert structure in every test.
- Use only the provided test utilities and helpers (e.g., `@testing-library/react`, `@testing-library/jest-dom`).
- Do not introduce alternative frameworks, assertion libraries, or test structures.

> **This policy is mandatory for Copilot and all contributors.**

## Current Strategy Analysis

The project has successfully migrated from Jest to Vitest, which brings several advantages:

1. **Faster Performance**: Vitest runs tests in parallel by default and leverages Vite's fast bundling.
2. **Native ESM Support**: Vitest works seamlessly with ESM modules, improving compatibility with modern JavaScript.
3. **Better Integration**: Vitest works natively with the Vite build system already used in this project.
4. **Watch Mode Improvements**: Vitest's watch mode is more efficient, especially with TypeScript files.
5. **UI for Monitoring Tests**: The @vitest/ui package provides a nice visual interface for viewing test results.

## Recommendations for Further Enhancement

### 1. Test Organization

- **Component Tests**: All component tests should live in a `__tests__` folder next to the component files.
- **Utility Tests**: Tests for utilities should be co-located with their implementation files.
- **Test Naming**: Use a consistent naming pattern like `[filename].test.ts` or `[filename].spec.ts`.

### 2. Test Coverage

- Set up a coverage threshold in the `vitest.config.ts` file:

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  reportsDirectory: './coverage',
  include: ['src/**/*.{ts,tsx}'],
  exclude: ['**/__tests__/**', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
  branches: 80,
  functions: 80,
  lines: 80,
  statements: 80
}
```

### 3. Testing Best Practices

- **Arrange-Act-Assert**: Structure tests with clear setup, action, and assertion phases.
- **Test Isolation**: Each test should be independent of others.
- **Mock External Dependencies**: Use Vitest's mocking capabilities for external services.
- **Snapshot Testing**: Use sparingly for UI components that change infrequently.
- **Data Providers**: Use parametric tests for testing multiple cases:

```typescript
it.each([
  [1, 2, 3],
  [5, 5, 10],
  [0, 0, 0]
])('adds %i + %i to equal %i', (a, b, expected) => {
  expect(a + b).toBe(expected);
});
```

### 4. CI Integration

- Add a GitHub workflow or Azure pipeline step that runs tests on every PR.
- Configure the CI to report test coverage changes between PRs.
- Configure the CI to fail if coverage drops below thresholds.

### 5. Testing Utilities

- Create reusable testing utilities for common tasks:
  - Custom renderers for components with default context providers
  - Test data generators
  - Common assertion helpers

### 6. Test Documentation

- Document testing strategy in TESTING.md (already created)
- Add JSDoc comments to test utilities explaining their purpose and usage

### 7. Regular Test Maintenance

- Schedule regular reviews of test coverage and quality
- Update tests when refactoring code
- Delete obsolete tests when removing features

## Conclusion

By standardizing on Vitest as the only testing framework and following these recommendations, the project will benefit from:

1. **Consistency**: All tests follow the same patterns and use the same utilities
2. **Maintainability**: Tests are well-organized and easier to understand
3. **Efficiency**: Tests run faster and provide more reliable results
4. **Coverage**: Better test coverage leads to fewer bugs in production

These improvements will result in a more robust application with fewer regressions and easier maintenance.
