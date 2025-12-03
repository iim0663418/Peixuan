import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

export default [
  // Ignore patterns
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/.wrangler/**',
      '**/build/**',
    ],
  },

  // Base JavaScript config
  js.configs.recommended,

  // TypeScript files configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        // Cloudflare Workers runtime
        console: 'readonly',
        fetch: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        Headers: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        ReadableStream: 'readonly',
        crypto: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',

        // Node.js (for build/config files)
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      // Environment-specific rules
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-inferrable-types': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
        },
      ],

      // General best practices
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'no-throw-literal': 'error',
      'prefer-template': 'warn',
      'prefer-arrow-callback': 'warn',
      'no-nested-ternary': 'warn',
      'no-unneeded-ternary': 'error',
      'no-else-return': 'warn',
      'object-shorthand': ['warn', 'always'],
      'prefer-destructuring': [
        'warn',
        {
          array: false,
          object: true,
        },
      ],

      // Code quality rules
      'complexity': ['warn', 15],
      'max-depth': ['warn', 4],
      'max-lines': ['warn', { max: 500, skipBlankLines: true, skipComments: true }],
      'max-params': ['warn', 5],
      'no-duplicate-imports': 'error',
      'no-useless-return': 'error',
      'no-useless-concat': 'error',
      'no-lonely-if': 'warn',
      'yoda': 'error',

      // Security rules
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
    },
  },

  // JavaScript files (non-TypeScript)
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
    },
  },

  // Test files
  {
    files: ['**/*.test.ts', '**/*.test.js', '**/*.spec.ts', '**/*.spec.js', '**/__tests__/**'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
        vitest: 'readonly',
        global: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'max-lines': 'off',
    },
  },

  // Config files
  {
    files: ['*.config.js', '*.config.ts', '.eslintrc.js'],
    languageOptions: {
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'no-console': 'off',
    },
  },
]
