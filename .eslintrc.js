/* eslint-disable no-undef */

module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.eslint.json"],
    extraFileExtensions: [".svelte"],
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  plugins: ["svelte3", "@typescript-eslint"],
  overrides: [
    {
      files: ["*.svelte"],
      processor: "svelte3/svelte3",
      rules: {
        // NOTE: there are false positives/negatives in Svelte files for type-aware rules
        // See https://github.com/sveltejs/eslint-plugin-svelte3/issues/104
        "@typescript-eslint/no-unsafe-member-access": "off",
      },
      env: {
        browser: true,
        webextensions: true,
      },
    },
  ],
  rules: {
    // NOTE: TypeScript is used to detect unused variables
    "@typescript-eslint/no-unused-vars": "off",
  },
  settings: {
    "svelte3/typescript": () => require("typescript"),
  },
};
