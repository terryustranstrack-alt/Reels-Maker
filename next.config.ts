import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" bundles a small Node server that the Windows app starts on the user's PC.
  output: "standalone",
  // ffmpeg-static finds its program file relative to its own folder, so it must not be bundled.
  serverExternalPackages: ["ffmpeg-static"],
  // Never copy local test videos or project files into the Windows app.
  outputFileTracingExcludes: {
    "*": [".local-data/**", "vendor/**", "src/**", "context/**", "supabase/**", "dist-desktop/**", "desktop/**"],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
