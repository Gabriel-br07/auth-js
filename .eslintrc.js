module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'standard',
    'prettier',
  ],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  rules: {
    // Adicione regras customizadas aqui se necessário
  },
  ignorePatterns: [
    'dist/**',
    'node_modules/**',
    '*.js',
    '*.d.ts',
  ],
};
