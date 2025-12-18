import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Security: Limit request body size (prevent DoS attacks)
  experimental: {
    serverActions: {
      bodySizeLimit: "1mb", // Limit server action body size
    },
  },
  
  // Security: Disable X-Powered-By header
  poweredByHeader: false,
  
  // Security: Enable strict mode
  reactStrictMode: true,

  // Security Headers (Next.js 16+ recommended approach)
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: [
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none';",
          },
          // HSTS only in production
          ...(process.env.NODE_ENV === "production"
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
