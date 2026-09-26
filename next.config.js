/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

// HSTS is opt-in via an explicit env var, not NODE_ENV — `next start` sets
// NODE_ENV=production even when nothing in front of it terminates TLS yet.
// Set ENABLE_HSTS=1 only once the production deployment is confirmed to be
// served over HTTPS end-to-end; enabling it prematurely can lock browsers
// out of the site if HTTPS isn't actually in place.
const headersList =
  process.env.ENABLE_HSTS === "1"
    ? [
        ...securityHeaders,
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : securityHeaders;

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: headersList,
      },
    ];
  },
};

module.exports = nextConfig;
