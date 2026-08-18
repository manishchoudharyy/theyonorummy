/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Content-Security-Policy intentionally left out for now — every
          // page has an inline JSON-LD <script> tag (dangerouslySetInnerHTML),
          // so a naive CSP would break those unless rolled out in
          // report-only mode first with 'unsafe-inline' or a nonce strategy.
        ],
      },
    ];
  },
};

export default nextConfig;
