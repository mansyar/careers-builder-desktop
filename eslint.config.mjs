import tseslint from 'typescript-eslint'
import js from '@eslint/js'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['out/**', 'dist/**', 'node_modules/**', '*.config.ts']
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  }
)
