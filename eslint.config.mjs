import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends('next/core-web-vitals', 'next/typescript'),

    // ✅ Custom rules override block
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': [
                'off',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            'no-unused-vars': [
                'off',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            "react-hooks/exhaustive-deps": "off"
        },
    },
];

export default eslintConfig;
