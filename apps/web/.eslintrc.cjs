// apps/web/.eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended', // Add this line for accessibility rules
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'vite-env.d.ts'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'jsx-a11y'], // Add 'jsx-a11y' to plugins
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // Custom rules for jsx-a11y can be added here if needed
    // For example:
    // 'jsx-a11y/label-has-associated-control': [
    //   'error',
    //   {
    //     labelComponents: ['CustomLabel'],
    //     labelAttributes: ['htmlFor'],
    //     controlComponents: ['CustomInput'],
    //     depth: 3,
    //   },
    // ],
  },
};
