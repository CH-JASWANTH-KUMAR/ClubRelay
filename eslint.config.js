import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.gemini/**',
      '**/coverage/**',
      '**/.agents/**',
    ],
  },
  // Backend Node Configuration
  {
    files: ['server/**/*.js', 'api/**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_|^next', varsIgnorePattern: '^_|^mongoose' }],
      'no-console': 'off',
    },
  },
  // Frontend React Configuration
  {
    files: ['client/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^React$' }],
      'no-undef': 'off', // JSX React runtime handled by Vite
      'no-console': 'off',
    },
  },
];
