import eslintPluginPrettier from "eslint-plugin-prettier";
import globals from "globals";

export default [
	{
		ignores: [
			"**/*.min.js",
			"cypress.config.js",
			"node_modules/**/*",
			"src/scripts/libraries/**/*",
			"src/serviceWorker/**/*",
		],
	},
	{
		languageOptions: {
			ecmaVersion: 2021,
			sourceType: "module",
			globals: {
				...globals.browser,
			},
		},
		plugins: {
			eslintPluginPrettier,
		},
		rules: {
			indent: ["error", "tab"],
			"no-console": "off",
			"no-continue": "off",
			"no-param-reassign": "off",
			"no-restricted-syntax": "off",
			"no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
			"no-use-before-define": "off",
			"eslintPluginPrettier/prettier": "error",
			semi: ["error", "always"],
		},
	},
];
