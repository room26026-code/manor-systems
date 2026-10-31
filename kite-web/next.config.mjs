/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["lucide-react"],
  output: process.env.OUTPUT === "export" ? "export" : "standalone",
};

// Sandbox preview only: serve the API under this dev server's origin so session
// cookies stay first-party. Unset BASE44_PREVIEW_MODE keeps the original behavior.
if (
  process.env.BASE44_PREVIEW_MODE === "1" &&
  process.env.KITE_API_PROXY_TARGET
) {
  nextConfig.rewrites = async () => [
    {
      source: "/v1/:path*",
      destination: `${process.env.KITE_API_PROXY_TARGET}/v1/:path*`,
    },
  ];
}

export default nextConfig;
