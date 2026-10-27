import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  // Declare your Neon services here
  auth: true,
  functions: {
    familyapi: {
      name: "PDSA family profile API",
      source: "src/functions/familyapi.mjs",
      env: {
        APP_ORIGINS: process.env.APP_ORIGINS!,
        AUTH_BASE_URL: process.env.AUTH_BASE_URL!,
        AUTH_JWKS_URL: process.env.AUTH_JWKS_URL!,
        FAMILY_API_DATABASE_URL: process.env.FAMILY_API_DATABASE_URL!,
      },
    },
  },
  // Branch policy: per-branch tuning
  branch: (branch) => {
    if (branch.isDefault) {
      // Default branch: no overrides, uses project defaults
      return {};
    }
    if (!branch.exists) {
      // New non-default branches: auto-expire
      // Run `neon checkout <name>` to create a new branch with these settings
      return { ttl: "7d" };
    }
    // Existing branch: no changes
    return {};
  },
});
