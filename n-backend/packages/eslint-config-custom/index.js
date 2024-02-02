module.exports = {
  env: {
    node: true,
    jest: true,
    es2022: true,
  },
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'turbo',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['.eslintrc.js'],
  root: true,
  rules: {
    /**
     * nestjs deafult rules
     */
    // '@typescript-eslint/interface-name-prefix': 'off',
    // '@typescript-eslint/explicit-function-return-type': 'off',
    // '@typescript-eslint/explicit-module-boundary-types': 'off',
    // '@typescript-eslint/no-explicit-any': 'off',
    /**
     * cainz backend team custom rules
     */
    'import/prefer-default-export': 'off',
    'class-methods-use-this': 'off',
    'no-plusplus': 'off',
  },
};
