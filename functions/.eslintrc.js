module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    project: ["tsconfig.json", "tsconfig.dev.json"],
  },
  ignorePatterns: [
    "lib/**/*",      // 빌드 출력은 무시
    "node_modules",
  ],
  plugins: ["@typescript-eslint", "import", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:prettier/recommended",   // ⭐ prettier와 충돌 자동 해결
  ],
  rules: {
    // --- Prettier와 연계 ---
    "prettier/prettier": "warn",

    // --- 스타일 규칙 완화 ---
    "max-len": "off",
    "linebreak-style": "off",
    "object-curly-spacing": ["error", "always"],
    "quotes": ["error", "double", { avoidEscape: true }],
    "semi": ["error", "always"],

    // --- TypeScript 룰 완화 ---
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": ["warn"],

    // --- Import 관련 ---
    "import/no-unresolved": 0,
    "import/order": [
      "warn",
      {
        groups: ["builtin", "external", "internal"],
        "newlines-between": "always",
      },
    ],
  },
};
