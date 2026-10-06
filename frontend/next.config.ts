import type { NextConfig } from 'next';

// Next's built-in image optimizer refuses to fetch from localhost/private IPs
// (SSRF protection) and can't be allow-listed around that via remotePatterns.
// The backend runs on localhost in dev and on a private Docker network
// hostname in the compose setup, so both would trip that check. Disabling
// server-side optimization lets the browser fetch images directly instead —
// Cloudinary (used in production when configured) already serves optimized,
// CDN-cached images on its own, so this isn't a loss there either.
const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  async headers() {
    return [{
      source: '/images/attractions/:path*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    }];
  },
};

export default nextConfig;
