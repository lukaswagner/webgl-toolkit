import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
    js.configs.recommended,
    {
        rules: {
            'array-callback-return': 'warn',
            'no-duplicate-imports': 'warn',
            'no-promise-executor-return': 'warn',
            'no-template-curly-in-string': 'warn',
            'consistent-return': 'warn',
            'default-case': 'warn',
            'default-case-last': 'warn',
            eqeqeq: 'warn',
            'no-var': 'warn',
            'one-var': [ 'warn', 'never' ],
            'prefer-const': 'warn',
            'require-await': 'warn',
            'sort-imports': 'warn',
            'no-unused-vars': [ 'warn', { argsIgnorePattern: '^_' } ],
        },
    },
    stylistic.configs['recommended-flat'],
    {
        plugins: {
            '@stylistic': stylistic,
        },
        rules: {
            '@stylistic/array-bracket-spacing': [ 'warn', 'always', {
                arraysInArrays: false,
            } ],
            '@stylistic/comma-dangle': [ 'warn', 'always-multiline' ],
            '@stylistic/dot-location': [ 'warn', 'property' ],
            '@stylistic/eol-last': 'off',
            '@stylistic/indent': 'off',
            '@stylistic/max-len': [ 'warn', {
                code: 100,
                ignoreTemplateLiterals: true,
            } ],
            '@stylistic/multiline-ternary': [ 'warn', 'always-multiline' ],
            '@stylistic/new-parens': 'warn',
            '@stylistic/operator-linebreak': [ 'warn', 'after' ],
            '@stylistic/padded-blocks': [ 'warn', 'never' ],
            '@stylistic/quote-props': [ 'warn', 'as-needed' ],
            '@stylistic/quotes': [ 'warn', 'single' ],
            '@stylistic/semi': [ 'warn', 'always' ],
            '@stylistic/lines-between-class-members': 'off',
            '@stylistic/brace-style': [ 'warn', '1tbs' ],
            '@stylistic/keyword-spacing': [ 'warn', { before: true, after: true } ],
            '@stylistic/member-delimiter-style': [ 'warn', { multiline: { delimiter: 'semi' } } ],
        },
    },
    {
        ...ts.configs.strictTypeChecked,
        files: [ '**/*.ts' ],
    },
    {
        files: [ '**/*.ts' ],
        plugins: {
            '@typescript-eslint': ts,
        },
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 5,
            sourceType: 'script',
            parserOptions: {
                project: [ './tsconfig.json' ],
            },
        },
        rules: {
            'no-undef': 'off',
            '@typescript-eslint/explicit-member-accessibility': 'warn',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/promise-function-async': 'warn',
            '@typescript-eslint/switch-exhaustiveness-check': 'warn',
            '@typescript-eslint/no-unnecessary-condition': 'off',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [ 'warn', { argsIgnorePattern: '^_' } ],
        },
    },
];
