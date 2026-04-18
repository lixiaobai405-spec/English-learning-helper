import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Silence Next.js 16 turbopack/webpack mismatch warning caused by next-pwa
  turbopack: {}
};

export default withPWA(nextConfig);
