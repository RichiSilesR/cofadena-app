console.log('VALIDACION HOST:', process.env.NEXT_DISABLE_ACTION_HOST_VALIDATION);
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/ws',
        destination: 'http://127.0.0.1:1880/ws',
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:1880/api/:path*', // Cambia 1880 si tu backend usa otro puerto
      },
      {
        source: '/ws/:path*',
        destination: 'http://localhost:1880/ws/:path*', // Proxy para WebSocket
      },
    ];
  },
};

module.exports = nextConfig;
