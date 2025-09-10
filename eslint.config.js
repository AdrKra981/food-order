// ESLint flat config for React project (ESLint v9+)

import js from "@eslint/js";
import react from "eslint-plugin-react";
import babelParser from "@babel/eslint-parser";

export default [
    js.configs.recommended,
    // don't spread plugin configs directly (flat config requires plugin objects)
    {
        files: ["**/*.js", "**/*.jsx"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parser: babelParser,
            parserOptions: {
                requireConfigFile: false,
                babelOptions: {
                    presets: ["@babel/preset-react"],
                },
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                React: "writable",
                route: "readonly",
                confirm: "readonly",
                reset: "readonly",
                alert: "readonly",
                fetch: "readonly",
                FileReader: "readonly",
                FormData: "readonly",
                URLSearchParams: "readonly",
                window: "readonly",
                document: "readonly",
                console: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
            },
        },
        plugins: {
            react,
        },
        rules: {
            // Ignore the React identifier when using the new JSX transform
            "no-unused-vars": [
                "warn",
                {
                    "varsIgnorePattern": "^React$",
                    "args": "after-used",
                    "ignoreRestSiblings": true
                }
            ],
            // Mark variables used in JSX as used to avoid false positives
            "react/jsx-uses-vars": "error",
            "react/prop-types": "off",
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    },
];
