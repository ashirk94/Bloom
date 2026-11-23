// Test settings. Vitest runs TypeScript directly (it uses the same engine as
// Vite), so no extra "transform" setup is needed like Jest had.
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// server tests, plus tests for the React app's plain helper functions
		include: ["tests/**/*.test.ts", "client/src/**/*.test.ts"],
		environment: "node",
		// put each mock back to how it started before every test, so one test
		// can't leak fake behaviour into the next
		restoreMocks: true
	}
});
