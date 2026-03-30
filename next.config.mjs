/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.licdn.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'http', hostname: '187.77.210.204' },
    ],
  },
};

export default nextConfig;
