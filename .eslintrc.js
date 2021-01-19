module.exports = {
    root: true,
    env: {
        es6: true,
        node: true
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:prettier/recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        sourceType: 'module'
    },
    plugins: ['@typescript-eslint', '@typescript-eslint/tslint', 'prefer-arrow', 'prettier'],
    rules: {
        '@typescript-eslint/adjacent-overload-signatures': 'error',
        '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
        '@typescript-eslint/ban-ts-comment': 0,
        '@typescript-eslint/ban-ts-ignore': 0,
        '@typescript-eslint/ban-types': 'error',
        '@typescript-eslint/consistent-type-assertions': 'error',
        '@typescript-eslint/consistent-type-definitions': 'error',
        '@typescript-eslint/explicit-member-accessibility': [
            'error',
            {
                accessibility: 'explicit',
                overrides: {
                    constructors: 'no-public'
                }
            }
        ],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/indent': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/member-delimiter-style': [
            'off',
            {
                multiline: {
                    delimiter: 'none',
                    requireLast: true
                },
                singleline: {
                    delimiter: 'semi',
                    requireLast: false
                }
            }
        ],
        '@typescript-eslint/member-ordering': [
            'error',
            {
                default: ['static-field', 'instance-field', 'static-method', 'instance-method']
            }
        ],
        '@typescript-eslint/no-empty-function': 'error',
        '@typescript-eslint/no-empty-interface': 'error',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-misused-new': 'error',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-parameter-properties': 'off',
        '@typescript-eslint/no-shadow': [
            'error',
            {
                hoist: 'never'
            }
        ],
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-var-requires': 'error',
        '@typescript-eslint/prefer-for-of': 'error',
        '@typescript-eslint/prefer-function-type': 'error',
        '@typescript-eslint/prefer-namespace-keyword': 'error',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/quotes': 'off',
        '@typescript-eslint/semi': ['off', null],
        '@typescript-eslint/space-within-parens': ['off', 'never'],
        '@typescript-eslint/triple-slash-reference': 'error',
        '@typescript-eslint/type-annotation-spacing': 'off',
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/unified-signatures': 'error',
        'arrow-body-style': 'error',
        'arrow-parens': ['off', 'as-needed'],
        'comma-dangle': 'off',
        complexity: 'off',
        'constructor-super': 'error',
        curly: 'error',
        'dot-notation': 'error',
        'eol-last': 'off',
        eqeqeq: ['error', 'smart'],
        'guard-for-in': 'error',
        'id-blacklist': ['error', 'any', 'String', 'string', 'Boolean', 'boolean', 'Undefined'],
        'id-match': 'error',
        'import/order': 'off',
        'linebreak-style': 'off',
        'max-classes-per-file': ['error', 20],
        'max-len': 'off',
        'new-parens': 'off',
        'newline-per-chained-call': 'off',
        'no-bitwise': 'error',
        'no-caller': 'error',
        'no-cond-assign': 'error',
        'no-console': 'error',
        'no-constant-condition': 'warn',
        'no-debugger': 'error',
        'no-empty': 'error',
        'no-eval': 'error',
        'no-extra-semi': 'off',
        'no-fallthrough': 'off',
        'no-invalid-this': 'off',
        'no-irregular-whitespace': 'off',
        'no-multiple-empty-lines': 'off',
        'no-new-wrappers': 'error',
        'no-prototype-builtins': 'off',
        'no-shadow': 'off',
        'no-throw-literal': 'error',
        'no-trailing-spaces': 'off',
        'no-undef-init': 'error',
        'no-underscore-dangle': ['warn', { allowAfterThis: true, allow: ['_id', '_raw'] }],
        'no-unsafe-finally': 'error',
        'no-unused-expressions': 'error',
        'no-unused-labels': 'error',
        'no-var': 'error',
        'object-shorthand': 'error',
        'one-var': ['error', 'never'],
        'prefer-arrow/prefer-arrow-functions': [
            'error',
            {
                disallowPrototype: true,
                singleReturnOnly: false,
                classPropertiesAllowed: false
            }
        ],
        'prefer-const': 'error',
        'prettier/prettier': ['error', { usePrettierrc: true }],
        'quote-props': 'off',
        radix: 'error',
        'space-before-function-paren': 'off',
        'spaced-comment': 'error',
        'use-isnan': 'error',
        'valid-typeof': 'off',
        '@typescript-eslint/tslint/config': [
            'error',
            {
                rules: {
                    'jsdoc-format': true,
                    'no-reference-import': true
                }
            }
        ]
    }
};
