// The site is served at yourdomain.com/roadshow. Change it here only.
const basePath = "/roadshow";

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80],
  },
  async redirects() {
    // Bare domain goes to the roadshow page. Temporary (307), so browsers don't cache it.
    return [{ source: "/", destination: basePath, basePath: false, permanent: false }];
  },
  async headers() {
    return [
      {
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
