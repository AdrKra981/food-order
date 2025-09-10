// ESLint flat config for React project (ESLint v9+)

import js from "@eslint/js";
import react from "eslint-plugin-react";
import babelParser from "@babel/eslint-parser";

export default [
    js.configs.recommended,
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
            "no-unused-vars": "warn",
            "react/prop-types": "off",
        },
    },
];
