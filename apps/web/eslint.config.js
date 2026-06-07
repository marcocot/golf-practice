import fido from '@fido.id/eslint-config-fido';

export default [
  { ignores: ['dist/**', 'dev-dist/**', 'coverage/**'] },
  ...fido.configs.react,
  {
    // This app uses Tailwind + shadcn/ui, not Material UI.
    // no-undef is redundant under TypeScript (the compiler checks identifiers,
    // including DOM type globals like RequestInit).
    settings: { react: { version: 'detect' } },
    rules: { 'tf/mui-prefer-components': 'off', 'no-undef': 'off' },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', 'src/test/**/*.ts'],
    rules: { 'tf/no-explicit-as': 'off' },
  },
];
