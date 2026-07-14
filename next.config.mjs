/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [new URL("https://res.cloudinary.com/**")],
  },
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
