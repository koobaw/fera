module.exports = {
  extends: ['eslint-config-custom'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
};
