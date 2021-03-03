module.exports = {
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  extends: ['plugin:@angular-eslint/recommended'],
  rules: {
    // ORIGINAL tslint.json -> "directive-selector": [true, "attribute", "app", "camelCase"],
    '@angular-eslint/directive-selector': [
      'error',
      { type: 'attribute', prefix: 'app', style: 'camelCase' },
    ],
    // ORIGINAL tslint.json -> "component-selector": [true, "element", "app", "kebab-case"],
    '@angular-eslint/component-selector': [
      'error',
      { type: 'element', prefix: 'app', style: 'kebab-case' },
    ],
  },
  overrides: [
    {
      files: ['*.html'],
      rules: {
        'max-len': 'off'
      }
    },
    {
      files: ['*.component.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      plugins: ['@angular-eslint/template'],
      processor: '@angular-eslint/template/extract-inline-html',
    },
    {
      files: ["*.ts"],
      extends: [
        'airbnb-typescript/base',
        'prettier/@typescript-eslint',
        'plugin:prettier/recommended',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      rules: {
         // Custom rules
         'import/no-unresolved': 'off',
         'import/prefer-default-export': 'off',
         'class-methods-use-this': 'off',
         'lines-between-class-members': 'off',
         '@typescript-eslint/camelcase': 'off',
         "import/no-extraneous-dependencies": ["error", { "devDependencies": true }],
         '@typescript-eslint/unbound-method': [
           'error',
           {
             ignoreStatic: true,
           }
         ]
      }
    },
  ],
}
