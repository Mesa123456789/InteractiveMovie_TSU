import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  timeout: 40_000,
  fullyParallel: true,
  workers: 2,
  use: { baseURL, trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3000",
    url: "http://127.0.0.1:3000", reuseExistingServer: true, timeout: 120_000,
  },
  projects: [
    { name: "desktop", testMatch: "**/movie.spec.ts", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", testMatch: "**/mobile.spec.ts", use: {
      ...devices["iPhone 13"], defaultBrowserType: "chromium", viewport: { width: 390, height: 844 },
    } },
  ],
});
