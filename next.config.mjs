/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Product videos are capped at 50MB; leave room for multipart overhead.
      bodySizeLimit: "51mb",
    },
  },
  images: {
    remotePatterns: [new URL("https://res.cloudinary.com/**")],
  },
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
