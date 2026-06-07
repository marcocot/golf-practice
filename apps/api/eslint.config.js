const fido = require('@fido.id/eslint-config-fido');

const jestGlobals = {
  describe: 'readonly',
  it: 'readonly',
  test: 'readonly',
  expect: 'readonly',
  beforeAll: 'readonly',
  afterAll: 'readonly',
  beforeEach: 'readonly',
  afterEach: 'readonly',
  jest: 'readonly',
};

module.exports = [
  { ignores: ['dist/**', 'coverage/**', 'src/generated/**'] },
  ...fido.configs.recommended,
  {
    files: ['**/*.spec.ts', 'test/**/*.ts'],
    languageOptions: { globals: jestGlobals },
    rules: { 'tf/no-explicit-as': 'off' },
  },
  {
    // NestJS modules are decorator-only classes with no members by design.
    files: ['**/*.module.ts'],
    rules: { '@typescript-eslint/no-extraneous-class': 'off' },
  },
];
