import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // lib/zod.ts turns on jitless mode so zod never calls new Function(''),
    // which the production CSP (no 'unsafe-eval') reports as a violation.
    files: ["**/*.{ts,tsx}"],
    ignores: ["lib/zod.ts"],
    rules: {
      "no-restricted-imports": ["error", {
        paths: [{ name: "zod", message: "Import z from '@/lib/zod' so jitless mode is set before any schema is built." }],
      }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Standalone CJS helpers that validate the design handoff are not shipped
    // application code and use Node's CJS runtime intentionally.
    "design/**/tools/**",
    "design/**/server*.log",
  ]),
]);

export default eslintConfig;
