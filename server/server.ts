import { createApp, server } from "@databricks/appkit";

// Match the Unified Mission Workbench server foundation. Domain endpoints can be
// registered here after their Databricks resources and authorization are established.
createApp({
  plugins: [server()],
}).catch((error: unknown) => {
  console.error("[armament-sca] AppKit startup failed:", error);
  process.exitCode = 1;
});
