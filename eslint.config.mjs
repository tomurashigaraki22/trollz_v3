import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Catch nested copies too (e.g. build caches inside .claude/worktrees/*)
    "**/.next/**",
    "**/node_modules/**",
    ".claude/**",
  ]),
]);

export default eslintConfig;
