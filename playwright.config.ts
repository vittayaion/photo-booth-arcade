import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 90000,
  expect: { timeout: 15000 },
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3100",
    channel: "chrome",
    headless: true,
    viewport: { width: 1440, height: 1000 },
    launchOptions: {
      args: [
        "--use-fake-device-for-media-stream",
        "--use-fake-ui-for-media-stream",
      ],
    },
    permissions: ["camera"],
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "pnpm exec next start --hostname 127.0.0.1 --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
