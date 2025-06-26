/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '', // Leave empty for default HTTPS port
        pathname: '/dlil6t6m4/image/upload/**', // Adjust to match your Cloudinary account
      },
    ],
  },
};

export default nextConfig;